import { useState } from 'react';
import { Button, Input, Space, Table, message, Modal } from 'antd';
import { PlusOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCategories, createCategory, updateCategory, deleteCategory, reorderCategories } from '@/api/categoryApi';
import { showConfirm } from '@/components/common/ConfirmModal';
import { usePermission } from '@/hooks/usePermission';
import { categorySchema, type CategoryFormValues } from '@/schemas/categorySchema';
import FormField from '@/components/common/FormField';
import type { AdminCategoryResponse } from '@/types/ingredient';

export default function CategoryManage() {
  const queryClient = useQueryClient();
  const { canWrite } = usePermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const createMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      message.success('추가되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) => updateCategory(id, data),
    onSuccess: () => {
      message.success('수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const reorderMut = useMutation({
    mutationFn: reorderCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    reset({ name: '' });
  };

  const handleEdit = (cat: AdminCategoryResponse) => {
    setEditingId(cat.id);
    reset({ name: cat.name });
    setModalOpen(true);
  };

  const onSubmit = (values: CategoryFormValues) => {
    if (editingId) {
      updateMut.mutate({ id: editingId, data: values });
    } else {
      createMut.mutate(values);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!categories) return;
    const list = [...categories];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
    reorderMut.mutate({ orderedIds: list.map((c) => c.id) });
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>카테고리 관리</h2>
        {canWrite && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            카테고리 추가
          </Button>
        )}
      </Space>
      <Table
        rowKey="id"
        dataSource={categories}
        loading={isLoading}
        pagination={false}
        columns={[
          { title: '순서', dataIndex: 'sortOrder', width: 60 },
          { title: '이름', dataIndex: 'name' },
          { title: '재료 수', dataIndex: 'ingredientCount', width: 100 },
          {
            title: '순서 변경',
            width: 100,
            render: (_: unknown, __: AdminCategoryResponse, index: number) => (
              <Space>
                <Button
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={index === 0}
                  onClick={() => handleMove(index, 'up')}
                />
                <Button
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={index === (categories?.length ?? 0) - 1}
                  onClick={() => handleMove(index, 'down')}
                />
              </Space>
            ),
          },
          {
            title: '액션',
            width: 140,
            render: (_: unknown, record: AdminCategoryResponse) =>
              canWrite && (
                <Space size="small">
                  <Button size="small" onClick={() => handleEdit(record)}>
                    수정
                  </Button>
                  <Button
                    size="small"
                    danger
                    onClick={() =>
                      showConfirm({
                        title: '카테고리 삭제',
                        content: `"${record.name}"을(를) 삭제하시겠습니까?`,
                        onConfirm: () => deleteMut.mutate(record.id),
                      })
                    }
                  >
                    삭제
                  </Button>
                </Space>
              ),
          },
        ]}
      />
      <Modal
        title={editingId ? '카테고리 수정' : '카테고리 추가'}
        open={modalOpen}
        onOk={handleSubmit(onSubmit)}
        onCancel={closeModal}
        confirmLoading={createMut.isPending || updateMut.isPending}
      >
        <form>
          <FormField label="카테고리명" error={errors.name?.message} required>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} status={errors.name ? 'error' : undefined} />
              )}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}

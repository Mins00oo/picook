import { useState } from 'react';
import { Button, Input, InputNumber, Modal, Select, Space, Table, message } from 'antd';
import { PlusOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCategories } from '@/api/categoryApi';
import {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  reorderSubcategories,
} from '@/api/subcategoryApi';
import FormField from '@/components/common/FormField';
import { showConfirm } from '@/components/common/ConfirmModal';
import { usePermission } from '@/hooks/usePermission';
import { subcategorySchema, type SubcategoryFormValues } from '@/schemas/subcategorySchema';
import type { AdminSubcategory } from '@/types/subcategory';

export default function SubcategoryManage() {
  const queryClient = useQueryClient();
  const { canWrite } = usePermission();
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<SubcategoryFormValues>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: { categoryId: 0, name: '', emoji: '', sortOrder: 0 },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: subs, isLoading } = useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: () => getSubcategories(categoryId),
    enabled: categoryId !== undefined,
  });

  const createMut = useMutation({
    mutationFn: createSubcategory,
    onSuccess: () => {
      message.success('등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      closeModal();
    },
    onError: (err: { message?: string }) =>
      message.error(err?.message ?? '등록에 실패했습니다.'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SubcategoryFormValues }) =>
      updateSubcategory(id, { ...data, emoji: data.emoji || undefined }),
    onSuccess: () => {
      message.success('수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      closeModal();
    },
    onError: (err: { message?: string }) =>
      message.error(err?.message ?? '수정에 실패했습니다.'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteSubcategory,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
    onError: (err: { message?: string }) =>
      message.error(err?.message ?? '삭제에 실패했습니다.'),
  });

  const reorderMut = useMutation({
    mutationFn: reorderSubcategories,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subcategories'] }),
    onError: (err: { message?: string }) =>
      message.error(err?.message ?? '순서 변경에 실패했습니다.'),
  });

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    reset({ categoryId: categoryId ?? 0, name: '', emoji: '', sortOrder: 0 });
  };

  const openCreate = () => {
    if (!categoryId) return;
    setEditingId(null);
    reset({
      categoryId,
      name: '',
      emoji: '',
      sortOrder: (subs?.length ?? 0) + 1,
    });
    setModalOpen(true);
  };

  const openEdit = (sub: AdminSubcategory) => {
    setEditingId(sub.id);
    reset({
      categoryId: sub.categoryId,
      name: sub.name,
      emoji: sub.emoji ?? '',
      sortOrder: sub.sortOrder,
    });
    setModalOpen(true);
  };

  const onSubmit = (values: SubcategoryFormValues) => {
    const payload = { ...values, emoji: values.emoji || undefined };
    if (editingId) {
      updateMut.mutate({ id: editingId, data: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!subs || !categoryId) return;
    const list = [...subs];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= list.length) return;
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
    reorderMut.mutate({
      categoryId,
      orderedIds: list.map((s) => s.id),
    });
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }} align="center">
        <h2 style={{ margin: 0 }}>서브카테고리 관리</h2>
        <Select
          placeholder="대카테고리 선택"
          style={{ width: 220 }}
          options={
            categories?.map((c) => ({
              value: c.id,
              label: `${c.emoji ? c.emoji + ' ' : ''}${c.name}`,
            })) ?? []
          }
          value={categoryId}
          onChange={(v) => setCategoryId(v)}
          allowClear
        />
        {canWrite && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            disabled={!categoryId}
          >
            서브카테고리 추가
          </Button>
        )}
      </Space>

      {categoryId === undefined ? (
        <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>
          대카테고리를 선택하면 서브카테고리 목록이 표시됩니다.
        </div>
      ) : (
        <Table
          rowKey="id"
          dataSource={subs ?? []}
          loading={isLoading}
          pagination={false}
          locale={{ emptyText: '이 카테고리에 서브카테고리가 없습니다.' }}
          columns={[
            { title: '순서', dataIndex: 'sortOrder', width: 60 },
            {
              title: '이모지',
              dataIndex: 'emoji',
              width: 80,
              render: (v?: string | null) => (
                <span style={{ fontSize: 20 }}>{v || '-'}</span>
              ),
            },
            { title: '이름', dataIndex: 'name' },
            {
              title: '순서 변경',
              width: 100,
              render: (_: unknown, __: AdminSubcategory, index: number) =>
                canWrite && (
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
                      disabled={index === (subs?.length ?? 0) - 1}
                      onClick={() => handleMove(index, 'down')}
                    />
                  </Space>
                ),
            },
            {
              title: '액션',
              width: 140,
              render: (_: unknown, record: AdminSubcategory) =>
                canWrite && (
                  <Space size="small">
                    <Button size="small" onClick={() => openEdit(record)}>
                      수정
                    </Button>
                    <Button
                      size="small"
                      danger
                      onClick={() =>
                        showConfirm({
                          title: '서브카테고리 삭제',
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
      )}

      <Modal
        title={editingId ? '서브카테고리 수정' : '서브카테고리 추가'}
        open={modalOpen}
        onOk={handleSubmit(onSubmit)}
        onCancel={closeModal}
        confirmLoading={createMut.isPending || updateMut.isPending}
      >
        <form>
          <FormField label="이름" error={errors.name?.message} required>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} status={errors.name ? 'error' : undefined} />
              )}
            />
          </FormField>
          <FormField label="이모지" error={errors.emoji?.message}>
            <Controller
              name="emoji"
              control={control}
              render={({ field }) => (
                <Input {...field} maxLength={8} placeholder="예: 🥕" />
              )}
            />
          </FormField>
          <FormField label="정렬 순서">
            <Controller
              name="sortOrder"
              control={control}
              render={({ field }) => (
                <InputNumber
                  value={field.value ?? 0}
                  onChange={(v) => field.onChange(v ?? 0)}
                  min={0}
                  style={{ width: '100%' }}
                />
              )}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}

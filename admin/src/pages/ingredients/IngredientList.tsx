import { useState } from 'react';
import { Button, Input, Select, Space, Table, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getIngredients, deleteIngredient } from '@/api/ingredientApi';
import { getCategories } from '@/api/categoryApi';
import { showConfirm } from '@/components/common/ConfirmModal';
import { usePermission } from '@/hooks/usePermission';
import { formatDate } from '@/utils/format';
import type { AdminIngredientResponse } from '@/types/ingredient';
import type { ColumnsType } from 'antd/es/table';

export default function IngredientList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canWrite } = usePermission();
  const [page, setPage] = useState(0);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [keyword, setKeyword] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['ingredients', page, categoryId, keyword],
    queryFn: () => getIngredients({ page, size: 10, categoryId, keyword: keyword || undefined }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });

  const categoryOptions = [
    { value: undefined as unknown as number, label: '전체 카테고리' },
    ...(categories?.map((c) => ({ value: c.id, label: c.name })) ?? []),
  ];

  const columns: ColumnsType<AdminIngredientResponse> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '재료명', dataIndex: 'name' },
    { title: '카테고리', dataIndex: 'categoryName', width: 100 },
    {
      title: '동의어',
      dataIndex: 'synonyms',
      render: (v: string[]) => v?.map((s) => <Tag key={s}>{s}</Tag>),
    },
    { title: '사용 레시피', dataIndex: 'usedRecipeCount', width: 100 },
    { title: '등록일', dataIndex: 'createdAt', width: 100, render: (v: string) => formatDate(v) },
    {
      title: '액션',
      width: 140,
      render: (_: unknown, record: AdminIngredientResponse) => (
        <Space size="small">
          {canWrite && (
            <>
              <Button size="small" onClick={() => navigate(`/ingredients/${record.id}/edit`)}>
                수정
              </Button>
              <Button
                size="small"
                danger
                onClick={() =>
                  showConfirm({
                    title: '재료 삭제',
                    content: `"${record.name}"을(를) 삭제하시겠습니까?`,
                    onConfirm: () => deleteMut.mutate(record.id),
                  })
                }
              >
                삭제
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          options={categoryOptions}
          value={categoryId}
          onChange={setCategoryId}
          style={{ width: 150 }}
          allowClear
          placeholder="카테고리"
        />
        <Input.Search
          placeholder="재료명 검색"
          onSearch={setKeyword}
          style={{ width: 200 }}
          allowClear
        />
        {canWrite && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/ingredients/new')}>
            재료 등록
          </Button>
        )}
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.content}
        loading={isLoading}
        pagination={{
          current: page + 1,
          pageSize: 10,
          total: data?.totalElements,
          onChange: (p) => setPage(p - 1),
        }}
      />
    </div>
  );
}

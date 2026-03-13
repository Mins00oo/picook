import { useState } from 'react';
import { Button, Input, Select, Space, Table, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getRecipes, deleteRecipe, changeRecipeStatus } from '@/api/recipeApi';
import StatusBadge from '@/components/common/StatusBadge';
import CoachingReadyIndicator from '@/components/recipe/CoachingReadyIndicator';
import { showConfirm } from '@/components/common/ConfirmModal';
import { usePermission } from '@/hooks/usePermission';
import { formatDate } from '@/utils/format';
import type { AdminRecipeListItem } from '@/types/recipe';
import type { ColumnsType } from 'antd/es/table';

const CATEGORY_OPTIONS = [
  { value: '', label: '전체 카테고리' },
  { value: 'korean', label: '한식' },
  { value: 'western', label: '양식' },
  { value: 'chinese', label: '중식' },
  { value: 'japanese', label: '일식' },
  { value: 'snack', label: '분식' },
  { value: 'dessert', label: '디저트' },
  { value: 'drink', label: '음료' },
  { value: 'other', label: '기타' },
];

const DIFFICULTY_OPTIONS = [
  { value: '', label: '전체 난이도' },
  { value: 'easy', label: '쉬움' },
  { value: 'medium', label: '보통' },
  { value: 'hard', label: '어려움' },
];

const STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'draft', label: '임시저장' },
  { value: 'published', label: '공개' },
  { value: 'hidden', label: '숨김' },
];

export default function RecipeList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canWrite } = usePermission();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    difficulty: '',
    keyword: '',
    coachingReady: undefined as boolean | undefined,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['recipes', page, filters],
    queryFn: () =>
      getRecipes({
        page,
        size: 10,
        status: filters.status || undefined,
        category: filters.category || undefined,
        difficulty: filters.difficulty || undefined,
        keyword: filters.keyword || undefined,
        coachingReady: filters.coachingReady,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => changeRecipeStatus(id, status),
    onSuccess: () => {
      message.success('상태가 변경되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });

  const columns: ColumnsType<AdminRecipeListItem> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '요리명', dataIndex: 'title', ellipsis: true },
    { title: '카테고리', dataIndex: 'category', width: 80 },
    { title: '난이도', dataIndex: 'difficulty', width: 80 },
    { title: '시간(분)', dataIndex: 'cookingTimeMinutes', width: 80 },
    {
      title: '코칭',
      dataIndex: 'coachingReady',
      width: 120,
      render: (v: boolean) => <CoachingReadyIndicator ready={v} />,
    },
    {
      title: '상태',
      dataIndex: 'status',
      width: 90,
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      width: 100,
      render: (v: string) => formatDate(v),
    },
    {
      title: '액션',
      width: 200,
      render: (_: unknown, record: AdminRecipeListItem) => (
        <Space size="small">
          <Button size="small" onClick={() => navigate(`/recipes/${record.id}`)}>
            보기
          </Button>
          {canWrite && (
            <>
              <Button size="small" onClick={() => navigate(`/recipes/${record.id}/edit`)}>
                수정
              </Button>
              {record.status === 'draft' && (
                <Button
                  size="small"
                  type="primary"
                  onClick={() => statusMutation.mutate({ id: record.id, status: 'published' })}
                >
                  공개
                </Button>
              )}
              <Button
                size="small"
                danger
                onClick={() =>
                  showConfirm({
                    title: '레시피 삭제',
                    content: `"${record.title}"을(를) 삭제하시겠습니까?`,
                    onConfirm: () => deleteMutation.mutate(record.id),
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
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          style={{ width: 120 }}
        />
        <Select
          options={CATEGORY_OPTIONS}
          value={filters.category}
          onChange={(v) => setFilters((f) => ({ ...f, category: v }))}
          style={{ width: 130 }}
        />
        <Select
          options={DIFFICULTY_OPTIONS}
          value={filters.difficulty}
          onChange={(v) => setFilters((f) => ({ ...f, difficulty: v }))}
          style={{ width: 120 }}
        />
        <Select
          value={filters.coachingReady}
          onChange={(v) => setFilters((f) => ({ ...f, coachingReady: v }))}
          allowClear
          placeholder="코칭 준비"
          style={{ width: 120 }}
          options={[
            { value: true, label: '준비 완료' },
            { value: false, label: '미준비' },
          ]}
        />
        <Input.Search
          placeholder="요리명 검색"
          onSearch={(v) => setFilters((f) => ({ ...f, keyword: v }))}
          style={{ width: 200 }}
          allowClear
        />
        {canWrite && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/recipes/new')}>
            레시피 등록
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

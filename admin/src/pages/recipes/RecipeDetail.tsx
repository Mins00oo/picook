import { Button, Card, Descriptions, Space, Table, Tag, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecipe, deleteRecipe, changeRecipeStatus } from '@/api/recipeApi';
import StatusBadge from '@/components/common/StatusBadge';
import CoachingReadyIndicator from '@/components/recipe/CoachingReadyIndicator';
import { showConfirm } from '@/components/common/ConfirmModal';
import { usePermission } from '@/hooks/usePermission';
import { formatDateTime } from '@/utils/format';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canWrite } = usePermission();

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => getRecipe(Number(id)),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteRecipe(Number(id)),
    onSuccess: () => {
      message.success('삭제되었습니다.');
      navigate('/recipes');
    },
  });

  const statusMut = useMutation({
    mutationFn: (status: string) => changeRecipeStatus(Number(id), status),
    onSuccess: () => {
      message.success('상태가 변경되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
    },
  });

  if (isLoading || !recipe) return null;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate('/recipes')}>목록</Button>
        {canWrite && (
          <>
            <Button onClick={() => navigate(`/recipes/${id}/edit`)}>수정</Button>
            {recipe.status === 'draft' && (
              <Button type="primary" onClick={() => statusMut.mutate('published')}>
                공개
              </Button>
            )}
            {recipe.status === 'published' && (
              <Button onClick={() => statusMut.mutate('hidden')}>숨김</Button>
            )}
            {recipe.status === 'hidden' && (
              <Button onClick={() => statusMut.mutate('published')}>공개</Button>
            )}
            <Button
              danger
              onClick={() =>
                showConfirm({
                  title: '삭제',
                  content: '정말 삭제하시겠습니까?',
                  onConfirm: () => deleteMut.mutate(),
                })
              }
            >
              삭제
            </Button>
          </>
        )}
      </Space>

      <Card title="기본 정보" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="요리명">{recipe.title}</Descriptions.Item>
          <Descriptions.Item label="카테고리">{recipe.category}</Descriptions.Item>
          <Descriptions.Item label="난이도">{recipe.difficulty}</Descriptions.Item>
          <Descriptions.Item label="조리시간">{recipe.cookingTimeMinutes}분</Descriptions.Item>
          <Descriptions.Item label="인분">{recipe.servings}인분</Descriptions.Item>
          <Descriptions.Item label="조회수">{recipe.viewCount}</Descriptions.Item>
          <Descriptions.Item label="상태">
            <StatusBadge status={recipe.status} />
          </Descriptions.Item>
          <Descriptions.Item label="코칭">
            <CoachingReadyIndicator ready={recipe.coachingReady} />
          </Descriptions.Item>
          <Descriptions.Item label="등록일">{formatDateTime(recipe.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="수정일">{formatDateTime(recipe.updatedAt)}</Descriptions.Item>
        </Descriptions>
        {recipe.tips && (
          <Descriptions>
            <Descriptions.Item label="팁">{recipe.tips}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      <Card title="재료" style={{ marginBottom: 16 }}>
        <Table
          rowKey="ingredientId"
          dataSource={recipe.ingredients}
          pagination={false}
          size="small"
          columns={[
            { title: '재료명', dataIndex: 'ingredientName' },
            { title: '수량', dataIndex: 'amount' },
            { title: '단위', dataIndex: 'unit' },
            {
              title: '필수',
              dataIndex: 'isRequired',
              render: (v: boolean) => (v ? <Tag color="blue">필수</Tag> : <Tag>선택</Tag>),
            },
          ]}
        />
      </Card>

      <Card title="조리 순서">
        <Table
          rowKey="stepNumber"
          dataSource={recipe.steps}
          pagination={false}
          size="small"
          columns={[
            { title: '순서', dataIndex: 'stepNumber', width: 60 },
            { title: '설명', dataIndex: 'description' },
            {
              title: '유형',
              dataIndex: 'stepType',
              width: 80,
              render: (v: string) =>
                v === 'active' ? <Tag color="blue">능동</Tag> : <Tag color="orange">대기</Tag>,
            },
            {
              title: '소요시간',
              dataIndex: 'durationSeconds',
              width: 100,
              render: (v: number) => (v ? `${v}초` : '-'),
            },
            {
              title: '병렬',
              dataIndex: 'canParallel',
              width: 60,
              render: (v: boolean) => (v ? 'O' : '-'),
            },
          ]}
        />
      </Card>
    </div>
  );
}

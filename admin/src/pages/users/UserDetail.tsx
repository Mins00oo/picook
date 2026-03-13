import { Button, Card, Descriptions, Space, Table, Tabs, Tag, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUser, suspendUser, activateUser } from '@/api/userApi';
import { showConfirm } from '@/components/common/ConfirmModal';
import { formatDate, formatDateTime } from '@/utils/format';
import { getUserRanking } from '../../../../shared/types/ranking';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id!),
  });

  const suspendMut = useMutation({
    mutationFn: () => suspendUser(id!),
    onSuccess: () => {
      message.success('사용자가 정지되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });

  const activateMut = useMutation({
    mutationFn: () => activateUser(id!),
    onSuccess: () => {
      message.success('사용자가 활성화되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });

  if (isLoading || !user) return null;

  const ranking = getUserRanking(user.completedCookingCount);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate('/users')}>목록</Button>
        {user.status === 'active' && (
          <Button
            danger
            onClick={() =>
              showConfirm({
                title: '사용자 정지',
                content: '이 사용자를 정지하시겠습니까?',
                onConfirm: () => suspendMut.mutate(),
              })
            }
          >
            정지
          </Button>
        )}
        {user.status === 'suspended' && (
          <Button
            type="primary"
            onClick={() =>
              showConfirm({
                title: '사용자 활성화',
                content: '이 사용자를 활성화하시겠습니까?',
                onConfirm: () => activateMut.mutate(),
              })
            }
          >
            활성화
          </Button>
        )}
      </Space>

      <Card title="기본 정보" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="닉네임">{user.displayName ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="이메일">{user.email ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="로그인">{user.loginType}</Descriptions.Item>
          <Descriptions.Item label="가입일">{formatDate(user.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="실력">{user.cookingLevel}</Descriptions.Item>
          <Descriptions.Item label="코칭">{user.coachingEnabled ? 'ON' : 'OFF'}</Descriptions.Item>
          <Descriptions.Item label="등급">
            Lv.{ranking.currentLevel.level} {ranking.currentLevel.title} {ranking.currentLevel.emoji}
            ({user.completedCookingCount}
            {ranking.nextLevel ? `/${ranking.nextLevel.min}` : ''})
          </Descriptions.Item>
          <Descriptions.Item label="상태">
            <Tag color={user.status === 'active' ? 'green' : 'red'}>{user.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="최근 접속">{formatDateTime(user.lastLoginAt)}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs
        items={[
          {
            key: 'coaching',
            label: '코칭 이력',
            children: (
              <Table
                rowKey="id"
                dataSource={user.coachingLogs}
                pagination={false}
                size="small"
                columns={[
                  { title: '날짜', dataIndex: 'startedAt', render: (v: string) => formatDateTime(v) },
                  { title: '레시피', dataIndex: 'recipeNames', render: (v: string[]) => v?.join(', ') },
                  { title: '모드', dataIndex: 'mode' },
                  {
                    title: '소요시간',
                    dataIndex: 'actualSeconds',
                    render: (v?: number) => (v ? `${Math.round(v / 60)}분` : '-'),
                  },
                  {
                    title: '완료',
                    dataIndex: 'completed',
                    render: (v: boolean) => (v ? <Tag color="green">완료</Tag> : <Tag>미완료</Tag>),
                  },
                ]}
              />
            ),
          },
          {
            key: 'completions',
            label: '요리 완료',
            children: (
              <Table
                rowKey="id"
                dataSource={user.cookingCompletions}
                pagination={false}
                size="small"
                columns={[
                  { title: '날짜', dataIndex: 'createdAt', render: (v: string) => formatDate(v) },
                  { title: '레시피', dataIndex: 'recipeName' },
                  {
                    title: '사진',
                    dataIndex: 'photoUrl',
                    render: (v: string) =>
                      v ? <img src={v} alt="" style={{ width: 60, height: 60, objectFit: 'cover' }} /> : '-',
                  },
                ]}
              />
            ),
          },
          {
            key: 'favorites',
            label: '즐겨찾기',
            children: (
              <Table
                rowKey="id"
                dataSource={user.favorites}
                pagination={false}
                size="small"
                columns={[
                  { title: '레시피', dataIndex: 'recipeName' },
                  { title: '날짜', dataIndex: 'createdAt', render: (v: string) => formatDate(v) },
                ]}
              />
            ),
          },
          {
            key: 'search',
            label: '검색 기록',
            children: (
              <Table
                rowKey="id"
                dataSource={user.searchHistory}
                pagination={false}
                size="small"
                columns={[
                  { title: '날짜', dataIndex: 'createdAt', render: (v: string) => formatDateTime(v) },
                  {
                    title: '선택 재료',
                    dataIndex: 'ingredientNames',
                    render: (v: string[]) => v?.join(', '),
                  },
                  { title: '결과 수', dataIndex: 'resultCount' },
                ]}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

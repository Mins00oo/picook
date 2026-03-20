import { useState } from 'react';
import { Button, Card, Descriptions, Input, Space, Table, Tabs, Tag, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUser,
  suspendUser,
  activateUser,
  getUserCoachingLogs,
  getUserCompletions,
  getUserFavorites,
  getUserSearchHistory,
} from '@/api/userApi';
import { showConfirm } from '@/components/common/ConfirmModal';
import { formatDate, formatDateTime } from '@/utils/format';
import { getUserRanking } from '../../../../shared/types/ranking';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [suspendReason, setSuspendReason] = useState('');
  const [coachingPage, setCoachingPage] = useState(0);
  const [completionPage, setCompletionPage] = useState(0);
  const [favoritePage, setFavoritePage] = useState(0);
  const [searchPage, setSearchPage] = useState(0);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id!),
  });

  const { data: coachingLogs } = useQuery({
    queryKey: ['user', id, 'coaching-logs', coachingPage],
    queryFn: () => getUserCoachingLogs(id!, { page: coachingPage, size: 10 }),
    enabled: !!id,
  });

  const { data: completions } = useQuery({
    queryKey: ['user', id, 'completions', completionPage],
    queryFn: () => getUserCompletions(id!, { page: completionPage, size: 10 }),
    enabled: !!id,
  });

  const { data: favorites } = useQuery({
    queryKey: ['user', id, 'favorites', favoritePage],
    queryFn: () => getUserFavorites(id!, { page: favoritePage, size: 10 }),
    enabled: !!id,
  });

  const { data: searchHistory } = useQuery({
    queryKey: ['user', id, 'search-history', searchPage],
    queryFn: () => getUserSearchHistory(id!, { page: searchPage, size: 10 }),
    enabled: !!id,
  });

  const suspendMut = useMutation({
    mutationFn: (reason: string) => suspendUser(id!, reason),
    onSuccess: () => {
      message.success('사용자가 정지되었습니다.');
      setSuspendReason('');
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
          <Space>
            <Input
              placeholder="정지 사유"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              style={{ width: 200 }}
            />
            <Button
              danger
              disabled={!suspendReason.trim()}
              onClick={() =>
                showConfirm({
                  title: '사용자 정지',
                  content: `이 사용자를 정지하시겠습니까?\n사유: ${suspendReason}`,
                  onConfirm: () => suspendMut.mutate(suspendReason),
                })
              }
            >
              정지
            </Button>
          </Space>
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
          {user.suspendedReason && (
            <Descriptions.Item label="정지 사유">{user.suspendedReason}</Descriptions.Item>
          )}
          <Descriptions.Item label="온보딩">{user.isOnboarded ? '완료' : '미완료'}</Descriptions.Item>
          <Descriptions.Item label="최근 접속">{formatDateTime(user.lastLoginAt)}</Descriptions.Item>
          <Descriptions.Item label="수정일">{formatDateTime(user.updatedAt)}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="활동 요약" style={{ marginBottom: 16 }}>
        <Descriptions column={3}>
          <Descriptions.Item label="코칭 횟수">{user.activitySummary.coachingCount}</Descriptions.Item>
          <Descriptions.Item label="완료 횟수">{user.activitySummary.completionCount}</Descriptions.Item>
          <Descriptions.Item label="즐겨찾기">{user.activitySummary.favoriteCount}</Descriptions.Item>
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
                dataSource={coachingLogs?.content}
                size="small"
                pagination={{
                  current: coachingPage + 1,
                  pageSize: 10,
                  total: coachingLogs?.totalElements,
                  onChange: (p) => setCoachingPage(p - 1),
                }}
                columns={[
                  { title: '날짜', dataIndex: 'startedAt', render: (v: string) => formatDateTime(v) },
                  {
                    title: '레시피 ID',
                    dataIndex: 'recipeIds',
                    render: (v: number[]) => v?.join(', '),
                  },
                  { title: '모드', dataIndex: 'mode' },
                  {
                    title: '예상시간',
                    dataIndex: 'estimatedSeconds',
                    render: (v?: number) => (v ? `${Math.round(v / 60)}분` : '-'),
                  },
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
                  {
                    title: '완료일',
                    dataIndex: 'completedAt',
                    render: (v?: string) => (v ? formatDateTime(v) : '-'),
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
                dataSource={completions?.content}
                size="small"
                pagination={{
                  current: completionPage + 1,
                  pageSize: 10,
                  total: completions?.totalElements,
                  onChange: (p) => setCompletionPage(p - 1),
                }}
                columns={[
                  { title: '날짜', dataIndex: 'createdAt', render: (v: string) => formatDate(v) },
                  { title: '레시피 ID', dataIndex: 'recipeId', width: 80 },
                  { title: '레시피', dataIndex: 'recipeName' },
                  {
                    title: '사진',
                    dataIndex: 'photoUrl',
                    render: (v?: string) =>
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
                dataSource={favorites?.content}
                size="small"
                pagination={{
                  current: favoritePage + 1,
                  pageSize: 10,
                  total: favorites?.totalElements,
                  onChange: (p) => setFavoritePage(p - 1),
                }}
                columns={[
                  { title: '레시피 ID', dataIndex: 'recipeId', width: 80 },
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
                dataSource={searchHistory?.content}
                size="small"
                pagination={{
                  current: searchPage + 1,
                  pageSize: 10,
                  total: searchHistory?.totalElements,
                  onChange: (p) => setSearchPage(p - 1),
                }}
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

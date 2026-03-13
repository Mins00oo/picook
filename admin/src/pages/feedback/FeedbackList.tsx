import { useState } from 'react';
import { Button, Input, Select, Space, Table, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getFeedbackList } from '@/api/feedbackApi';
import { formatDate } from '@/utils/format';
import type { FeedbackItem } from '@/types/feedback';
import type { ColumnsType } from 'antd/es/table';

const STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'unread', label: '미확인' },
  { value: 'read', label: '확인' },
  { value: 'resolved', label: '처리' },
];

const RATING_OPTIONS = [
  { value: '', label: '전체 평가' },
  { value: 'easy', label: '쉬움' },
  { value: 'adequate', label: '적절' },
  { value: 'difficult', label: '어려움' },
];

const statusColors: Record<string, string> = {
  unread: 'orange',
  read: 'blue',
  resolved: 'green',
};

const ratingColors: Record<string, string> = {
  easy: 'green',
  adequate: 'blue',
  difficult: 'red',
};

export default function FeedbackList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');
  const [keyword, setKeyword] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['feedback', page, status, rating, keyword],
    queryFn: () =>
      getFeedbackList({
        page,
        size: 10,
        status: status || undefined,
        rating: rating || undefined,
        keyword: keyword || undefined,
      }),
  });

  const columns: ColumnsType<FeedbackItem> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '레시피', dataIndex: 'recipeName', ellipsis: true },
    { title: '사용자', dataIndex: 'userName', width: 100 },
    {
      title: '평가',
      dataIndex: 'rating',
      width: 80,
      render: (v: string) => <Tag color={ratingColors[v]}>{v}</Tag>,
    },
    { title: '코멘트', dataIndex: 'comment', ellipsis: true },
    {
      title: '상태',
      dataIndex: 'status',
      width: 80,
      render: (v: string) => <Tag color={statusColors[v]}>{v}</Tag>,
    },
    { title: '등록일', dataIndex: 'createdAt', width: 100, render: (v: string) => formatDate(v) },
    {
      title: '액션',
      width: 80,
      render: (_: unknown, record: FeedbackItem) => (
        <Button size="small" onClick={() => navigate(`/feedback/${record.id}`)}>
          상세
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2>피드백 관리</h2>
      <Space style={{ marginBottom: 16 }}>
        <Select options={STATUS_OPTIONS} value={status} onChange={setStatus} style={{ width: 120 }} />
        <Select options={RATING_OPTIONS} value={rating} onChange={setRating} style={{ width: 120 }} />
        <Input.Search placeholder="레시피명 검색" onSearch={setKeyword} style={{ width: 200 }} allowClear />
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

import { useState } from 'react';
import { Button, Input, Select, Space, Table, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '@/api/userApi';
import { formatDate } from '@/utils/format';
import type { AdminUserListItem } from '@/types/user';
import type { ColumnsType } from 'antd/es/table';

const STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'active', label: '활성' },
  { value: 'suspended', label: '정지' },
];

const statusColors: Record<string, string> = {
  active: 'green',
  suspended: 'red',
  deleted: 'default',
};

export default function UserList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, status, keyword],
    queryFn: () =>
      getUsers({ page, size: 10, status: status || undefined, keyword: keyword || undefined }),
  });

  const columns: ColumnsType<AdminUserListItem> = [
    { title: 'ID', dataIndex: 'id', width: 80, ellipsis: true },
    { title: '닉네임', dataIndex: 'displayName' },
    { title: '이메일', dataIndex: 'email', ellipsis: true },
    { title: '로그인', dataIndex: 'loginType', width: 80 },
    { title: '실력', dataIndex: 'cookingLevel', width: 80 },
    { title: '완료', dataIndex: 'completedCookingCount', width: 60 },
    {
      title: '상태',
      dataIndex: 'status',
      width: 80,
      render: (v: string) => <Tag color={statusColors[v]}>{v}</Tag>,
    },
    { title: '가입일', dataIndex: 'createdAt', width: 100, render: (v: string) => formatDate(v) },
    {
      title: '액션',
      width: 80,
      render: (_: unknown, record: AdminUserListItem) => (
        <Button size="small" onClick={() => navigate(`/users/${record.id}`)}>
          상세
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2>사용자 관리</h2>
      <Space style={{ marginBottom: 16 }}>
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={setStatus}
          style={{ width: 120 }}
        />
        <Input.Search
          placeholder="닉네임/이메일 검색"
          onSearch={setKeyword}
          style={{ width: 250 }}
          allowClear
        />
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

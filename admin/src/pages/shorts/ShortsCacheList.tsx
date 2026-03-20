import { useState } from 'react';
import { Button, Input, Space, Table, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getShortsCacheList, deleteShortCache, clearAllShortsCache } from '@/api/shortsApi';
import { showConfirm } from '@/components/common/ConfirmModal';
import { usePermission } from '@/hooks/usePermission';
import { formatDate } from '@/utils/format';
import type { ShortsCacheItem } from '@/types/shorts';
import type { ColumnsType } from 'antd/es/table';

export default function ShortsCacheList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isSuperAdmin, canWrite } = usePermission();
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['shorts-cache', page, keyword],
    queryFn: () => getShortsCacheList({ page, size: 10, keyword: keyword || undefined }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteShortCache,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['shorts-cache'] });
    },
  });

  const clearAllMut = useMutation({
    mutationFn: clearAllShortsCache,
    onSuccess: () => {
      message.success('전체 캐시가 초기화되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['shorts-cache'] });
    },
  });

  const columns: ColumnsType<ShortsCacheItem> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'URL', dataIndex: 'youtubeUrl', ellipsis: true },
    { title: '제목', dataIndex: 'title', ellipsis: true },
    { title: '모델 버전', dataIndex: 'aiModelVersion', width: 130 },
    { title: '생성일', dataIndex: 'createdAt', width: 100, render: (v: string) => formatDate(v) },
    {
      title: '액션',
      width: 160,
      render: (_: unknown, record: ShortsCacheItem) => (
        <Space size="small">
          <Button size="small" onClick={() => navigate(`/shorts/${record.id}`)}>
            보기
          </Button>
          {canWrite && (
            <Button
              size="small"
              danger
              onClick={() =>
                showConfirm({
                  title: '캐시 삭제',
                  content: '이 캐시를 삭제하시겠습니까?',
                  onConfirm: () => deleteMut.mutate(record.id),
                })
              }
            >
              삭제
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="URL 키워드 검색"
          onSearch={setKeyword}
          style={{ width: 300 }}
          allowClear
        />
        {isSuperAdmin && (
          <Button
            danger
            onClick={() =>
              showConfirm({
                title: '전체 초기화',
                content: '모든 쇼츠 캐시를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
                onConfirm: () => clearAllMut.mutate(),
              })
            }
          >
            전체 초기화
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

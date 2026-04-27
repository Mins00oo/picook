import { useMemo } from 'react';
import { Button, Card, Descriptions, Space, Table, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getShortsCacheDetail, reconvertShorts, deleteShortCache } from '@/api/shortsApi';
import { showConfirm } from '@/components/common/ConfirmModal';
import { usePermission } from '@/hooks/usePermission';
import { formatDateTime } from '@/utils/format';
import type { ShortsConvertResult } from '@/types/shorts';

export default function ShortsCacheDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canWrite } = usePermission();

  const { data, isLoading } = useQuery({
    queryKey: ['shorts-cache-detail', id],
    queryFn: () => getShortsCacheDetail(Number(id)),
  });

  const reconvertMut = useMutation({
    mutationFn: () => reconvertShorts(Number(id)),
    onSuccess: () => {
      message.success('재변환이 완료되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['shorts-cache-detail', id] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteShortCache(Number(id)),
    onSuccess: () => {
      message.success('삭제되었습니다.');
      navigate('/shorts');
    },
  });

  const parsedResult = useMemo<ShortsConvertResult | null>(() => {
    if (!data?.result) return null;
    try {
      return JSON.parse(data.result) as ShortsConvertResult;
    } catch {
      return null;
    }
  }, [data?.result]);

  if (isLoading || !data) return null;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate('/shorts')}>목록</Button>
        {canWrite && (
          <>
            <Button onClick={() => reconvertMut.mutate()} loading={reconvertMut.isPending}>
              재변환
            </Button>
            <Button
              danger
              onClick={() =>
                showConfirm({
                  title: '삭제',
                  content: '이 캐시를 삭제하시겠습니까?',
                  onConfirm: () => deleteMut.mutate(),
                })
              }
            >
              삭제
            </Button>
          </>
        )}
      </Space>

      <Card title="쇼츠 변환 결과" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="URL">{data.youtubeUrl}</Descriptions.Item>
          <Descriptions.Item label="제목">{data.title ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="AI 모델">{data.aiModelVersion}</Descriptions.Item>
          <Descriptions.Item label="URL 해시">{data.urlHash}</Descriptions.Item>
          <Descriptions.Item label="생성일">{formatDateTime(data.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="수정일">{formatDateTime(data.updatedAt)}</Descriptions.Item>
        </Descriptions>
      </Card>

      {parsedResult?.ingredients && parsedResult.ingredients.length > 0 && (
        <Card title="추출 재료" style={{ marginBottom: 16 }}>
          <Table
            rowKey="name"
            dataSource={parsedResult.ingredients}
            pagination={false}
            size="small"
            columns={[
              { title: '재료명', dataIndex: 'name' },
              { title: '수량', dataIndex: 'amount' },
              { title: '단위', dataIndex: 'unit' },
            ]}
          />
        </Card>
      )}

      {parsedResult?.steps && parsedResult.steps.length > 0 && (
        <Card title="변환 단계">
          <Table
            rowKey="stepNumber"
            dataSource={parsedResult.steps}
            pagination={false}
            size="small"
            columns={[
              { title: '순서', dataIndex: 'stepNumber', width: 60 },
              { title: '설명', dataIndex: 'description' },
            ]}
          />
        </Card>
      )}

      {!parsedResult && (
        <Card title="변환 결과 (원본)">
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{data.result}</pre>
        </Card>
      )}
    </div>
  );
}

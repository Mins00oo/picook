import { Button, Space, Table, Tag, Image, Popconfirm, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { deleteOutfit, getOutfits } from '@/api/outfitApi';
import type { AdminOutfit, OutfitSlot } from '@/types/outfit';

const SLOT_LABEL: Record<OutfitSlot, string> = {
  head: '머리',
  top: '상의',
  bottom: '하의',
  shoes: '신발',
  leftHand: '왼손',
  rightHand: '오른손',
};

export default function OutfitList() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-outfits'],
    queryFn: getOutfits,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOutfit(id),
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin-outfits'] });
    },
    onError: (err: { message?: string }) => {
      message.error(err?.message ?? '삭제에 실패했습니다.');
    },
  });

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <h2>의상 관리</h2>
        <Link to="/outfits/new">
          <Button type="primary">신규 등록</Button>
        </Link>
      </Space>

      <Table<AdminOutfit>
        rowKey="id"
        loading={isLoading}
        dataSource={data ?? []}
        pagination={false}
        columns={[
          {
            title: '이미지',
            dataIndex: 'imageUrl',
            width: 80,
            render: (url: string) => (url ? <Image src={url} width={48} height={48} /> : '-'),
          },
          { title: '이름', dataIndex: 'name' },
          {
            title: '슬롯',
            dataIndex: 'slot',
            render: (slot: OutfitSlot) => <Tag>{SLOT_LABEL[slot]}</Tag>,
          },
          {
            title: '가격',
            dataIndex: 'pricePoints',
            render: (p: number) => (p > 0 ? `${p.toLocaleString()} P` : '-'),
          },
          {
            title: '해금 레벨',
            dataIndex: 'unlockLevel',
            render: (lv: number | null) => (lv ? `Lv.${lv}` : '-'),
          },
          {
            title: '기본 지급',
            dataIndex: 'isDefault',
            render: (v: boolean) => (v ? <Tag color="blue">기본</Tag> : '-'),
          },
          {
            title: '활성',
            dataIndex: 'isActive',
            render: (v: boolean) => (v ? <Tag color="green">활성</Tag> : <Tag>비활성</Tag>),
          },
          { title: '정렬', dataIndex: 'sortOrder', width: 60 },
          {
            title: '',
            width: 160,
            render: (_, row) => (
              <Space>
                <Link to={`/outfits/${row.id}/edit`}>
                  <Button size="small">수정</Button>
                </Link>
                <Popconfirm
                  title="삭제하시겠어요?"
                  onConfirm={() => deleteMutation.mutate(row.id)}
                >
                  <Button size="small" danger>
                    삭제
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
}

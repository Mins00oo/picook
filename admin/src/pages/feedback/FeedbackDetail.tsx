import { Button, Card, Descriptions, Form, Input, Select, Space, Tag, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeedback, updateFeedbackStatus } from '@/api/feedbackApi';
import { usePermission } from '@/hooks/usePermission';
import { formatDateTime } from '@/utils/format';
import type { FeedbackStatus } from '@/types/feedback';

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

export default function FeedbackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canWrite } = usePermission();
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['feedback', id],
    queryFn: () => getFeedback(Number(id)),
  });

  const updateMut = useMutation({
    mutationFn: (values: { status: FeedbackStatus; adminMemo?: string }) =>
      updateFeedbackStatus(Number(id), values),
    onSuccess: () => {
      message.success('업데이트되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['feedback', id] });
    },
  });

  if (isLoading || !data) return null;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate('/feedback')}>목록</Button>
      </Space>

      <Card title="피드백 상세" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="레시피">{data.recipeTitle}</Descriptions.Item>
          <Descriptions.Item label="카테고리">{data.recipeCategory}</Descriptions.Item>
          <Descriptions.Item label="사용자">{data.userName}</Descriptions.Item>
          <Descriptions.Item label="이메일">{data.userEmail ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="평가">
            <Tag color={ratingColors[data.rating]}>{data.rating}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="상태">
            <Tag color={statusColors[data.status]}>{data.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="등록일">{formatDateTime(data.createdAt)}</Descriptions.Item>
        </Descriptions>
        {data.comment && (
          <Descriptions>
            <Descriptions.Item label="코멘트">{data.comment}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      {canWrite && (
        <Card title="관리자 처리">
          <Form
            form={form}
            layout="vertical"
            initialValues={{ status: data.status, adminMemo: data.adminMemo }}
            onFinish={(values) => updateMut.mutate(values)}
            style={{ maxWidth: 500 }}
          >
            <Form.Item name="status" label="상태 변경">
              <Select
                options={[
                  { value: 'unread', label: '미확인' },
                  { value: 'read', label: '확인' },
                  { value: 'resolved', label: '처리 완료' },
                ]}
              />
            </Form.Item>
            <Form.Item name="adminMemo" label="관리자 메모">
              <Input.TextArea rows={4} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={updateMut.isPending}>
              저장
            </Button>
          </Form>
        </Card>
      )}
    </div>
  );
}

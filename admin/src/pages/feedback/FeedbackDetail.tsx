import { useEffect } from 'react';
import { Button, Card, Descriptions, Input, Select, Space, Tag, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getFeedback, updateFeedbackStatus, updateFeedbackNote } from '@/api/feedbackApi';
import { usePermission } from '@/hooks/usePermission';
import { formatDateTime } from '@/utils/format';
import { feedbackSchema, type FeedbackFormValues } from '@/schemas/feedbackSchema';
import FormField from '@/components/common/FormField';


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

  const { control, handleSubmit, reset } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['feedback', id],
    queryFn: () => getFeedback(Number(id)),
  });

  useEffect(() => {
    if (data) {
      reset({ status: data.adminStatus, adminNote: data.adminNote ?? '' });
    }
  }, [data, reset]);

  const statusMut = useMutation({
    mutationFn: (status: string) =>
      updateFeedbackStatus(Number(id), { status }),
    onSuccess: () => {
      message.success('상태가 업데이트되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['feedback', id] });
    },
  });

  const noteMut = useMutation({
    mutationFn: (note: string) =>
      updateFeedbackNote(Number(id), { note }),
    onSuccess: () => {
      message.success('메모가 저장되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['feedback', id] });
    },
  });

  if (isLoading || !data) return null;

  const onSubmit = async (values: FeedbackFormValues) => {
    const promises: Promise<void>[] = [];

    if (values.status !== data.adminStatus) {
      promises.push(statusMut.mutateAsync(values.status));
    }

    const newNote = values.adminNote ?? '';
    const oldNote = data.adminNote ?? '';
    if (newNote !== oldNote) {
      promises.push(noteMut.mutateAsync(newNote));
    }

    if (promises.length === 0) {
      message.info('변경사항이 없습니다.');
      return;
    }

    await Promise.all(promises);
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => navigate('/feedback')}>목록</Button>
      </Space>

      <Card title="피드백 상세" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="레시피">{data.recipeTitle}</Descriptions.Item>
          <Descriptions.Item label="사용자">{data.userDisplayName}</Descriptions.Item>
          <Descriptions.Item label="이메일">{data.userEmail ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="평가">
            <Tag color={ratingColors[data.rating]}>{data.rating}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="상태">
            <Tag color={statusColors[data.adminStatus]}>{data.adminStatus}</Tag>
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
          <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 500 }}>
            <FormField label="상태 변경">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={[
                      { value: 'unread', label: '미확인' },
                      { value: 'read', label: '확인' },
                      { value: 'resolved', label: '처리 완료' },
                    ]}
                  />
                )}
              />
            </FormField>
            <FormField label="관리자 메모">
              <Controller
                name="adminNote"
                control={control}
                render={({ field }) => (
                  <Input.TextArea {...field} value={field.value ?? ''} rows={4} />
                )}
              />
            </FormField>
            <Button type="primary" htmlType="submit" loading={statusMut.isPending || noteMut.isPending}>
              저장
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}

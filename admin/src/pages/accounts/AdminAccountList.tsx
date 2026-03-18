import { useState } from 'react';
import { Button, Input, Modal, Select, Space, Table, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getAdminAccounts, createAdmin, updateAdminRole, deleteAdmin } from '@/api/accountApi';
import { showConfirm } from '@/components/common/ConfirmModal';
import { adminAccountSchema, type AdminAccountFormValues } from '@/schemas/adminAccountSchema';
import FormField from '@/components/common/FormField';
import type { AdminInfo, AdminRole } from '@/types/admin';
import type { ColumnsType } from 'antd/es/table';

const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: '슈퍼관리자' },
  { value: 'CONTENT_ADMIN', label: '콘텐츠관리자' },
  { value: 'VIEWER', label: '뷰어' },
];

export default function AdminAccountList() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<AdminAccountFormValues>({
    resolver: zodResolver(adminAccountSchema),
    defaultValues: { email: '', password: '', role: undefined as unknown as AdminAccountFormValues['role'] },
  });

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['admin-accounts'],
    queryFn: getAdminAccounts,
  });

  const createMut = useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      message.success('관리자가 추가되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      setModalOpen(false);
      reset();
    },
    onError: (err: { message?: string }) => {
      message.error(err?.message ?? '추가에 실패했습니다.');
    },
  });

  const updateRoleMut = useMutation({
    mutationFn: ({ id, role }: { id: number; role: AdminRole }) => updateAdminRole(id, role),
    onSuccess: () => {
      message.success('역할이 변경되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      message.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
    },
  });

  const onSubmit = (values: AdminAccountFormValues) => {
    createMut.mutate(values);
  };

  const columns: ColumnsType<AdminInfo> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '이메일', dataIndex: 'email' },
    {
      title: '역할',
      dataIndex: 'role',
      width: 140,
      render: (role: AdminRole, record: AdminInfo) => (
        <Select
          value={role}
          options={ROLE_OPTIONS}
          style={{ width: 130 }}
          onChange={(newRole: AdminRole) => updateRoleMut.mutate({ id: record.id, role: newRole })}
        />
      ),
    },
    {
      title: '액션',
      width: 80,
      render: (_: unknown, record: AdminInfo) => (
        <Button
          size="small"
          danger
          onClick={() =>
            showConfirm({
              title: '관리자 삭제',
              content: `"${record.email}"을(를) 삭제하시겠습니까?`,
              onConfirm: () => deleteMut.mutate(record.id),
            })
          }
        >
          삭제
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>관리자 계정</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          관리자 추가
        </Button>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={accounts}
        loading={isLoading}
        pagination={false}
      />
      <Modal
        title="관리자 추가"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          reset();
        }}
        onOk={handleSubmit(onSubmit)}
        confirmLoading={createMut.isPending}
      >
        <form>
          <FormField label="이메일" error={errors.email?.message} required>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} status={errors.email ? 'error' : undefined} />
              )}
            />
          </FormField>
          <FormField label="비밀번호" error={errors.password?.message} required>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password {...field} status={errors.password ? 'error' : undefined} />
              )}
            />
          </FormField>
          <FormField label="역할" error={errors.role?.message} required>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={ROLE_OPTIONS}
                  status={errors.role ? 'error' : undefined}
                />
              )}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}

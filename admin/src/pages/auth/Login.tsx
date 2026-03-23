import { App, Button, Card, Input, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { login } from '@/api/authApi';
import { useAuthStore } from '@/stores/authStore';
import { loginSchema, type LoginFormValues } from '@/schemas/loginSchema';
import FormField from '@/components/common/FormField';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { message } = App.useApp();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@picook.com', password: '!@#admina' },
  });

  const mutation = useMutation({
    mutationFn: (data: LoginFormValues) => login(data),
    onSuccess: (res) => {
      setAuth(res.accessToken, res.admin);
      if (res.refreshToken) {
        localStorage.setItem('refreshToken', res.refreshToken);
      }
      message.success('로그인 성공');
      navigate('/dashboard');
    },
    onError: (err: { message?: string }) => {
      message.error(err?.message ?? '로그인에 실패했습니다.');
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5',
      }}
    >
      <Card style={{ width: 400 }}>
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
          Picook 백오피스
        </Typography.Title>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField error={errors.email?.message}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<MailOutlined />}
                  placeholder="이메일"
                  size="large"
                  status={errors.email ? 'error' : undefined}
                />
              )}
            />
          </FormField>
          <FormField error={errors.password?.message}>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined />}
                  placeholder="비밀번호"
                  size="large"
                  status={errors.password ? 'error' : undefined}
                />
              )}
            />
          </FormField>
          <Button type="primary" htmlType="submit" block size="large" loading={mutation.isPending}>
            로그인
          </Button>
        </form>
      </Card>
    </div>
  );
}

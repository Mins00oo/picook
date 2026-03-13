import { Button, Card, Form, Input, message, Typography } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/api/authApi';
import { useAuthStore } from '@/stores/authStore';
import type { AdminLoginRequest } from '@/types/admin';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const mutation = useMutation({
    mutationFn: (data: AdminLoginRequest) => login(data),
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

  const handleFinish = (values: AdminLoginRequest) => {
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
        <Form layout="vertical" onFinish={handleFinish}>
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: '이메일을 입력해주세요' }]}>
            <Input prefix={<MailOutlined />} placeholder="이메일" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="비밀번호" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={mutation.isPending}>
              로그인
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

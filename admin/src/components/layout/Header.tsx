import { Button, Space, Tag, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const roleLabels: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: '슈퍼관리자', color: 'red' },
  CONTENT_ADMIN: { label: '콘텐츠관리자', color: 'blue' },
  VIEWER: { label: '뷰어', color: 'default' },
};

export default function AppHeader() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleInfo = admin?.role ? roleLabels[admin.role] : null;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        Picook 백오피스
      </Typography.Title>
      <Space>
        <Typography.Text>{admin?.email}</Typography.Text>
        {roleInfo && <Tag color={roleInfo.color}>{roleInfo.label}</Tag>}
        <Button icon={<LogoutOutlined />} onClick={handleLogout}>
          로그아웃
        </Button>
      </Space>
    </div>
  );
}

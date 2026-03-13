import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppHeader from './Header';

const { Sider, Header, Content } = Layout;

export default function AppLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px', textAlign: 'center', fontWeight: 700, fontSize: 18 }}>
          Picook
        </div>
        <Sidebar />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
          <AppHeader />
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

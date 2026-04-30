import { Menu } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  TeamOutlined,
  MessageOutlined,
  BarChartOutlined,
  SettingOutlined,
  SkinOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermission } from '@/hooks/usePermission';
import type { MenuProps } from 'antd';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, canAccessMenu } = usePermission();

  const items: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '대시보드',
    },
    {
      key: 'recipes',
      icon: <FileTextOutlined />,
      label: '레시피 관리',
      children: [{ key: '/recipes', label: '레시피 목록' }],
    },
    {
      key: 'ingredients',
      icon: <AppstoreOutlined />,
      label: '재료 관리',
      children: [
        { key: '/ingredients', label: '재료 목록' },
        { key: '/ingredients/overview', label: '재료 통계' },
        { key: '/ingredients/categories', label: '카테고리 관리' },
        { key: '/ingredients/subcategories', label: '서브카테고리 관리' },
      ],
    },
    ...(isSuperAdmin || canAccessMenu('recipes') || canAccessMenu('ingredients')
      ? [
          {
            key: 'data',
            icon: <DatabaseOutlined />,
            label: '데이터 관리',
            children: [
              ...(isSuperAdmin
                ? [{ key: '/seed', label: '시드 데이터 (전체)' }]
                : []),
              ...(canAccessMenu('recipes')
                ? [{ key: '/recipes/bulk-upload', label: '레시피 일괄등록' }]
                : []),
              ...(canAccessMenu('ingredients')
                ? [{ key: '/ingredients/bulk-upload', label: '재료 일괄등록·다운로드' }]
                : []),
            ],
          },
        ]
      : []),
    ...(isSuperAdmin
      ? [
          {
            key: '/users',
            icon: <TeamOutlined />,
            label: '사용자 관리',
          },
        ]
      : []),
    {
      key: '/feedback',
      icon: <MessageOutlined />,
      label: '피드백 관리',
    },
    {
      key: '/outfits',
      icon: <SkinOutlined />,
      label: '의상 관리',
    },
    {
      key: 'stats',
      icon: <BarChartOutlined />,
      label: '통계',
      children: [
        { key: '/stats/users', label: '사용자 통계' },
        { key: '/stats/recipes', label: '레시피 통계' },
        { key: '/stats/ingredients', label: '재료 통계' },
        { key: '/stats/ranking', label: '등급 통계' },
      ],
    },
    ...(isSuperAdmin
      ? [
          {
            key: '/accounts',
            icon: <SettingOutlined />,
            label: '관리자 계정',
          },
        ]
      : []),
  ];

  const selectedKey = location.pathname;
  const openKeys = items
    .filter(
      (item) =>
        item &&
        'children' in item &&
        item.children?.some(
          (child) => child && 'key' in child && location.pathname.startsWith(child.key as string),
        ),
    )
    .map((item) => item!.key as string);

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      defaultOpenKeys={openKeys}
      items={items}
      onClick={({ key }) => navigate(key)}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
}

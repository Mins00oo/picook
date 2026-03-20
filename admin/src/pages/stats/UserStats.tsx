import { Card, Col, Empty, Row, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { Line, Pie } from '@ant-design/charts';
import { getUserStats } from '@/api/statsApi';
import StatsCard from '@/components/common/StatsCard';

export default function UserStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['stats-users'],
    queryFn: () => getUserStats('30d'),
  });

  if (isLoading) return <Spin />;
  if (isError || !data) return <Empty description="데이터를 불러올 수 없습니다." />;

  const loginTypeData = Object.entries(data.loginTypeDistribution).map(([type, count]) => ({ type, count }));

  return (
    <div>
      <h2>사용자 통계</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><StatsCard title="총 사용자" value={data.totalUsers} /></Col>
        <Col span={6}><StatsCard title="활성 사용자" value={data.activeUsers} /></Col>
        <Col span={6}><StatsCard title="DAU" value={data.dau} /></Col>
        <Col span={6}><StatsCard title="MAU" value={data.mau} /></Col>
      </Row>
      <Row gutter={16}>
        <Col span={16}>
          <Card title="가입 추이">
            <Line data={data.signupTrend} xField="date" yField="count" height={300} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="로그인 방식">
            <Pie
              data={loginTypeData}
              angleField="count"
              colorField="type"
              height={300}
              innerRadius={0.6}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

import { Card, Col, Empty, Row, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { Line, Column } from '@ant-design/charts';
import { getCoachingStats } from '@/api/statsApi';
import StatsCard from '@/components/common/StatsCard';

export default function CoachingStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['stats-coaching'],
    queryFn: () => getCoachingStats('30d'),
  });

  if (isLoading) return <Spin />;
  if (isError || !data) return <Empty description="데이터를 불러올 수 없습니다." />;

  return (
    <div>
      <h2>코칭 통계</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <StatsCard title="이용률" value={`${(data.usageRate * 100).toFixed(1)}%`} />
        </Col>
        <Col span={8}>
          <StatsCard title="완료율" value={`${(data.completionRate * 100).toFixed(1)}%`} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="일별 코칭 추이">
            <Line data={data.dailyTrend} xField="date" yField="count" height={300} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="시간대별 분포">
            <Column data={data.hourlyDistribution} xField="hour" yField="count" height={300} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

import { Card, Col, Empty, Row, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { Line } from '@ant-design/charts';
import { getShortsStats } from '@/api/statsApi';
import StatsCard from '@/components/common/StatsCard';

export default function ShortsStatsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['stats-shorts-page'],
    queryFn: getShortsStats,
  });

  if (isLoading) return <Spin />;
  if (isError || !data) return <Empty description="데이터를 불러올 수 없습니다." />;

  return (
    <div>
      <h2>쇼츠 통계</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <StatsCard title="총 변환" value={data.totalConversions} />
        </Col>
        <Col span={8}>
          <StatsCard title="성공률" value={`${(data.successRate * 100).toFixed(1)}%`} />
        </Col>
      </Row>
      <Card title="변환 추이">
        <Line data={data.conversionTrend} xField="date" yField="count" height={300} />
      </Card>
    </div>
  );
}

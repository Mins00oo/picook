import { Card, Col, Empty, Row, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { Column } from '@ant-design/charts';
import StatsCard from '@/components/common/StatsCard';
import { getShortsStats } from '@/api/statsApi';

export default function ShortsStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['shorts-stats'],
    queryFn: getShortsStats,
  });

  if (isLoading) return <Spin />;
  if (isError || !data) return <Empty description="데이터를 불러올 수 없습니다." />;

  return (
    <div>
      <h2>쇼츠 통계</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <StatsCard title="총 변환 수" value={data.totalConversions} />
        </Col>
        <Col span={8}>
          <StatsCard title="성공률" value={`${(data.successRate * 100).toFixed(1)}%`} />
        </Col>
      </Row>
      <Card title="일별 변환 추이">
        <Column
          data={data.conversionTrend}
          xField="date"
          yField="count"
          seriesField="type"
          height={300}
        />
      </Card>
    </div>
  );
}

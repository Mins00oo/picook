import { Card, Col, Empty, Row, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { Pie } from '@ant-design/charts';
import { getShortsStats } from '@/api/statsApi';
import StatsCard from '@/components/common/StatsCard';

export default function ShortsStatsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['stats-shorts-page'],
    queryFn: getShortsStats,
  });

  if (isLoading) return <Spin />;
  if (isError || !data) return <Empty description="데이터를 불러올 수 없습니다." />;

  const modelVersionData = Object.entries(data.modelVersionDistribution).map(([model, count]) => ({ model, count }));

  return (
    <div>
      <h2>쇼츠 통계</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <StatsCard title="총 변환" value={data.totalConversions} />
        </Col>
        <Col span={8}>
          <StatsCard title="캐시 항목" value={data.totalCacheEntries} />
        </Col>
      </Row>
      <Card title="모델 버전별 분포">
        <Pie
          data={modelVersionData}
          angleField="count"
          colorField="model"
          height={300}
          innerRadius={0.6}
        />
      </Card>
    </div>
  );
}

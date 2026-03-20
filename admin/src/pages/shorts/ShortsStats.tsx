import { Col, Empty, Row, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import StatsCard from '@/components/common/StatsCard';
import { getShortsStats } from '@/api/shortsApi';

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
        <Col span={6}>
          <StatsCard title="총 캐시 수" value={data.totalCacheCount} />
        </Col>
        <Col span={6}>
          <StatsCard title="총 변환 수" value={data.totalConversionCount} />
        </Col>
        <Col span={6}>
          <StatsCard title="성공" value={data.successCount} />
        </Col>
        <Col span={6}>
          <StatsCard title="실패" value={data.failureCount} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={6}>
          <StatsCard title="성공률" value={`${(data.successRate * 100).toFixed(1)}%`} />
        </Col>
        <Col span={6}>
          <StatsCard title="실패율" value={`${(data.failureRate * 100).toFixed(1)}%`} />
        </Col>
      </Row>
    </div>
  );
}

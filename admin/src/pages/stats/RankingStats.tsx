import { Card, Col, Empty, Row, Spin, Table } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { Column } from '@ant-design/charts';
import { getRankingStats } from '@/api/statsApi';
import StatsCard from '@/components/common/StatsCard';

export default function RankingStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['stats-ranking'],
    queryFn: getRankingStats,
  });

  if (isLoading) return <Spin />;
  if (isError || !data) return <Empty description="데이터를 불러올 수 없습니다." />;

  return (
    <div>
      <h2>등급 통계</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <StatsCard title="사진 업로드율" value={`${(data.photoUploadRate * 100).toFixed(1)}%`} />
        </Col>
      </Row>
      <Card title="레벨 분포">
        <Column
          data={data.levelDistribution}
          xField="title"
          yField="count"
          height={300}
        />
      </Card>
      <Card title="레벨별 상세" style={{ marginTop: 16 }}>
        <Table
          rowKey="level"
          dataSource={data.levelDistribution}
          pagination={false}
          size="small"
          columns={[
            { title: '레벨', dataIndex: 'level' },
            { title: '등급명', dataIndex: 'title' },
            { title: '인원', dataIndex: 'count' },
          ]}
        />
      </Card>
    </div>
  );
}

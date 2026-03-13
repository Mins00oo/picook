import { Card, Col, Empty, List, Row, Spin, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { Pie } from '@ant-design/charts';
import { getRecipeStats } from '@/api/statsApi';
import StatsCard from '@/components/common/StatsCard';

export default function RecipeStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['stats-recipes'],
    queryFn: getRecipeStats,
  });

  if (isLoading) return <Spin />;
  if (isError || !data) return <Empty description="데이터를 불러올 수 없습니다." />;

  return (
    <div>
      <h2>레시피 통계</h2>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}><StatsCard title="총 레시피" value={data.totalRecipes} /></Col>
        <Col span={8}>
          <StatsCard title="코칭 준비율" value={`${(data.coachingReadyRate * 100).toFixed(1)}%`} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="카테고리별 분포">
            <Pie
              data={data.categoryDistribution}
              angleField="count"
              colorField="category"
              height={300}
              innerRadius={0.6}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="인기 레시피 TOP 10">
            <List
              size="small"
              dataSource={data.popularRecipes}
              renderItem={(item, i) => (
                <List.Item>
                  <Typography.Text>{i + 1}. {item.name}</Typography.Text>
                  <Tag>{item.count}회</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

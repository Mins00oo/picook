import { Card, Col, Empty, List, Row, Spin, Table, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { getIngredientStats } from '@/api/statsApi';

export default function IngredientStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['stats-ingredients'],
    queryFn: getIngredientStats,
  });

  if (isLoading) return <Spin />;
  if (isError || !data) return <Empty description="데이터를 불러올 수 없습니다." />;

  return (
    <div>
      <h2>재료 통계</h2>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="인기 재료 TOP 10">
            <List
              size="small"
              dataSource={data.popularIngredients}
              renderItem={(item, i) => (
                <List.Item>
                  <Typography.Text>{i + 1}. {item.name}</Typography.Text>
                  <Tag>{item.count}회</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="미사용 재료">
            <Table
              rowKey="id"
              dataSource={data.unusedIngredients}
              pagination={false}
              size="small"
              columns={[
                { title: 'ID', dataIndex: 'id', width: 60 },
                { title: '재료명', dataIndex: 'name' },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

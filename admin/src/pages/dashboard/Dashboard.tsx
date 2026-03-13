import { useState } from 'react';
import { Card, Col, Empty, List, Radio, Row, Spin, Table, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { Line } from '@ant-design/charts';
import { getDashboardStats } from '@/api/dashboardApi';
import StatsCard from '@/components/common/StatsCard';
import { formatNumber } from '@/utils/format';

export default function Dashboard() {
  const [period, setPeriod] = useState('7d');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => getDashboardStats(period),
  });

  if (isLoading) return <Spin style={{ display: 'block', textAlign: 'center', marginTop: 100 }} />;
  if (isError || !data) return <Empty description="대시보드 데이터를 불러올 수 없습니다." />;

  const trendData = (data.dailyTrend ?? []).flatMap((d) => [
    { date: d.date, value: d.signups, type: '가입' },
    { date: d.date, value: d.searches, type: '검색' },
    { date: d.date, value: d.coachingSessions, type: '코칭' },
    { date: d.date, value: d.shortsConversions, type: '쇼츠' },
  ]);

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}><StatsCard title="총 사용자" value={formatNumber(data.totalUsers)} /></Col>
        <Col span={6}><StatsCard title="오늘 가입" value={formatNumber(data.todaySignups)} /></Col>
        <Col span={6}><StatsCard title="DAU" value={formatNumber(data.dau)} /></Col>
        <Col span={6}><StatsCard title="MAU" value={formatNumber(data.mau)} /></Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={6}><StatsCard title="총 레시피" value={formatNumber(data.totalRecipes)} /></Col>
        <Col span={6}><StatsCard title="공개중" value={formatNumber(data.publishedRecipes)} /></Col>
        <Col span={6}><StatsCard title="코칭 이용률" value={`${(data.coachingUsageRate * 100).toFixed(1)}%`} /></Col>
        <Col span={6}><StatsCard title="쇼츠 변환" value={formatNumber(data.totalShortsConversions)} /></Col>
      </Row>

      <Card
        title="일별 추이"
        style={{ marginTop: 24 }}
        extra={
          <Radio.Group value={period} onChange={(e) => setPeriod(e.target.value)} size="small">
            <Radio.Button value="7d">7일</Radio.Button>
            <Radio.Button value="30d">30일</Radio.Button>
            <Radio.Button value="90d">90일</Radio.Button>
          </Radio.Group>
        }
      >
        {trendData.length > 0 ? (
          <Line data={trendData} xField="date" yField="value" seriesField="type" height={280} />
        ) : (
          <Empty />
        )}
      </Card>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="인기 레시피 TOP 10" size="small">
            <List
              size="small"
              dataSource={data.popularRecipes ?? []}
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
          <Card title="인기 재료 TOP 10" size="small">
            <List
              size="small"
              dataSource={data.popularIngredients ?? []}
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

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="인기 코칭 TOP 5" size="small">
            <List
              size="small"
              dataSource={data.popularCoaching ?? []}
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
          <Card title="최근 피드백 5건" size="small">
            <List
              size="small"
              dataSource={data.recentFeedback ?? []}
              renderItem={(item) => (
                <List.Item>
                  <Typography.Text>
                    <Tag color={item.rating === 'easy' ? 'green' : item.rating === 'difficult' ? 'red' : 'blue'}>
                      {item.rating}
                    </Tag>
                    {item.recipeName} - {item.comment ?? '코멘트 없음'}
                  </Typography.Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card title="등급 분포" style={{ marginTop: 16 }}>
        <Table
          rowKey="level"
          dataSource={data.levelDistribution ?? []}
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

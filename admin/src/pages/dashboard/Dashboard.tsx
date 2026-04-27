import { useState } from 'react';
import { Card, Col, Empty, List, Radio, Row, Spin, Table, Tag, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { Line } from '@ant-design/charts';
import { getDashboardData } from '@/api/dashboardApi';
import StatsCard from '@/components/common/StatsCard';
import { formatNumber } from '@/utils/format';
import type { DailyCount } from '@/types/stats';

const LEVEL_TITLES: Record<string, string> = {
  LV1: '병아리',
  LV2: '요리 입문',
  LV3: '집밥 견습',
  LV4: '집밥 장인',
  LV5: '요리 고수',
  LV6: '마스터 셰프',
  LV7: '전설',
};

export default function Dashboard() {
  const [period, setPeriod] = useState('7d');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => getDashboardData(period),
  });

  if (isLoading) return <Spin style={{ display: 'block', textAlign: 'center', marginTop: 100 }} />;
  if (isError || !data) return <Empty description="대시보드 데이터를 불러올 수 없습니다." />;

  // Merge chart series by date
  const dateMap = new Map<string, { signups: number; shorts: number }>();
  const mergeSeries = (items: DailyCount[], key: 'signups' | 'shorts') => {
    for (const item of items) {
      const entry = dateMap.get(item.date) ?? { signups: 0, shorts: 0 };
      entry[key] = item.count;
      dateMap.set(item.date, entry);
    }
  };
  mergeSeries(data.charts.userSignups ?? [], 'signups');
  mergeSeries(data.charts.shortsConversions ?? [], 'shorts');

  const trendData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([date, v]) => [
      { date, value: v.signups, type: '가입' },
      { date, value: v.shorts, type: '쇼츠' },
    ]);

  // Level distribution from rankDistribution object
  const levelDistribution = Object.entries(data.summary.rankDistribution ?? {})
    .map(([key, count]) => {
      const levelNum = parseInt(key.replace(/\D/g, ''), 10) || 0;
      return { level: levelNum, title: LEVEL_TITLES[key] ?? key, count };
    })
    .sort((a, b) => a.level - b.level);

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}><StatsCard title="총 사용자" value={formatNumber(data.summary.totalUsers)} /></Col>
        <Col span={6}><StatsCard title="활성 사용자" value={formatNumber(data.summary.activeUsers)} /></Col>
        <Col span={6}><StatsCard title="총 레시피" value={formatNumber(data.summary.totalRecipes)} /></Col>
        <Col span={6}><StatsCard title="쇼츠 변환" value={formatNumber(data.summary.totalShortsConversions)} /></Col>
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
              dataSource={data.rankings.topRecipesByViews ?? []}
              renderItem={(item, i) => (
                <List.Item>
                  <Typography.Text>{i + 1}. {item.title}</Typography.Text>
                  <Tag>{item.viewCount}회</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="인기 재료 TOP 10" size="small">
            <List
              size="small"
              dataSource={data.rankings.topIngredientsByUsage ?? []}
              renderItem={(item, i) => (
                <List.Item>
                  <Typography.Text>{i + 1}. {item.ingredientName}</Typography.Text>
                  <Tag>{item.usageCount}회</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="최근 피드백" size="small">
            <List
              size="small"
              dataSource={data.rankings.recentFeedback ?? []}
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
        <Col span={12}>
          <Card title="등급 분포" size="small">
            <Table
              rowKey="level"
              dataSource={levelDistribution}
              pagination={false}
              size="small"
              columns={[
                { title: '레벨', dataIndex: 'level' },
                { title: '등급명', dataIndex: 'title' },
                { title: '인원', dataIndex: 'count' },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

import { Card, Col, Progress, Row, Space, Statistic, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getIngredientStats } from '@/api/ingredientApi';
import type { IngredientStatsResponse } from '@/types/ingredient';

function coveragePct(total: number, missing: number): number {
  if (total <= 0) return 0;
  return Math.round(((total - missing) / total) * 100);
}

export default function IngredientOverview() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery<IngredientStatsResponse>({
    queryKey: ['ingredient-stats'],
    queryFn: getIngredientStats,
  });

  if (isLoading || !data) {
    return <div style={{ padding: 32, textAlign: 'center' }}>Loading...</div>;
  }

  const emojiCoverage = coveragePct(data.total, data.missingEmoji);
  const subCoverage = coveragePct(data.total, data.missingSubcategory);
  const synonymCoverage = coveragePct(data.total, data.missingSynonyms);
  const usedCoverage = coveragePct(data.total, data.unusedInRecipes);

  return (
    <div>
      <h2>재료 통계</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="총 재료 수" value={data.total} />
            <Typography.Text type="secondary">
              최근 30일 추가 {data.last30DaysAdded.reduce((acc, d) => acc + d.count, 0)}건
            </Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => navigate('/ingredients')}>
            <Statistic
              title="서브카테고리 미할당"
              value={data.missingSubcategory}
              valueStyle={{
                color: data.missingSubcategory > 0 ? '#cf1322' : undefined,
              }}
            />
            <Progress percent={subCoverage} size="small" />
            <Typography.Text type="secondary">
              커버리지 {subCoverage}%
            </Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable onClick={() => navigate('/ingredients')}>
            <Statistic
              title="이모지 미할당"
              value={data.missingEmoji}
              valueStyle={{
                color: data.missingEmoji > 0 ? '#fa8c16' : undefined,
              }}
            />
            <Progress percent={emojiCoverage} size="small" />
            <Typography.Text type="secondary">
              커버리지 {emojiCoverage}%
            </Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="동의어 미등록" value={data.missingSynonyms} />
            <Progress percent={synonymCoverage} size="small" />
            <Typography.Text type="secondary">
              커버리지 {synonymCoverage}%
            </Typography.Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title="레시피 사용 현황">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Text>
                레시피에서 사용되지 않는 재료: <b>{data.unusedInRecipes}</b>건
              </Typography.Text>
              <Progress percent={usedCoverage} />
              <Typography.Text type="secondary">
                {usedCoverage}% 재료가 하나 이상의 레시피에서 사용 중
              </Typography.Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="최근 30일 등록 추이">
            {data.last30DaysAdded.length === 0 ? (
              <Typography.Text type="secondary">데이터 없음</Typography.Text>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                {data.last30DaysAdded.slice(-7).map((d) => (
                  <div
                    key={d.date}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <span style={{ color: '#666' }}>{d.date}</span>
                    <b>{d.count}</b>
                  </div>
                ))}
              </Space>
            )}
          </Card>
        </Col>
      </Row>

      <Card title="카테고리별 재료 수" style={{ marginBottom: 16 }}>
        {data.byCategory.length === 0 ? (
          <Typography.Text type="secondary">데이터 없음</Typography.Text>
        ) : (
          data.byCategory.map((c) => (
            <div key={c.categoryId} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{c.categoryName}</span>
                <b>{c.count}</b>
              </div>
              <Progress
                percent={data.total > 0 ? Math.round((c.count / data.total) * 100) : 0}
                size="small"
                showInfo={false}
              />
            </div>
          ))
        )}
      </Card>

      <Card title="서브카테고리별 재료 수">
        {data.bySubcategory.length === 0 ? (
          <Typography.Text type="secondary">데이터 없음</Typography.Text>
        ) : (
          <div>
            {data.bySubcategory.map((s) => (
              <div
                key={s.subcategoryId}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '6px 0',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <span style={{ width: 100, color: '#666' }}>{s.categoryName}</span>
                <span style={{ flex: 1 }}>{s.subcategoryName}</span>
                <b>{s.count}</b>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

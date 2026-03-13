import { Card, Statistic } from 'antd';

interface Props {
  title: string;
  value: number | string;
  suffix?: string;
  loading?: boolean;
}

export default function StatsCard({ title, value, suffix, loading }: Props) {
  return (
    <Card>
      <Statistic title={title} value={value} suffix={suffix} loading={loading} />
    </Card>
  );
}

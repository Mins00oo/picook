import { Tag } from 'antd';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: '임시저장' },
  published: { color: 'green', label: '공개' },
  hidden: { color: 'red', label: '숨김' },
};

export default function StatusBadge({ status }: { status: string }) {
  const info = STATUS_MAP[status] ?? { color: 'default', label: status };
  return <Tag color={info.color}>{info.label}</Tag>;
}

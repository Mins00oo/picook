export function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('ko-KR');
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleString('ko-KR');
}

export function formatNumber(value?: number | null): string {
  if (value == null) return '-';
  return value.toLocaleString('ko-KR');
}

export function getCategorySearchStatusText({
  query,
  count,
  isFetching,
}: {
  query: string;
  count: number;
  isFetching: boolean;
}): string | null {
  if (query.trim().length === 0 || isFetching) return null;
  return `${count.toLocaleString()}개 찾았어요`;
}

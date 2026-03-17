const YOUTUBE_SHORTS_REGEX =
  /^https?:\/\/(www\.|m\.)?(youtube\.com\/shorts\/|youtu\.be\/)[a-zA-Z0-9_-]+/;

export function isValidShortsUrl(url: string): boolean {
  return YOUTUBE_SHORTS_REGEX.test(url.trim());
}

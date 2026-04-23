import * as ImageManipulator from 'expo-image-manipulator';

/**
 * 업로드 전 이미지 리사이즈.
 * 원본 폰 사진(4032×3024 등)을 1600px 긴 변 + JPEG 0.8로 압축.
 * 4장 합쳐도 멀티파트 요청이 3~5MB 이내로 들어와 서버 쪽 max-file-size 여유.
 *
 * 실패하면 원본 URI를 그대로 반환 — 업로드 자체는 시도함.
 */
export async function resizeForUpload(uri: string, maxWidth = 1600): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
    );
    return result.uri;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[resizeForUpload] failed, falling back to original', e);
    return uri;
  }
}

/** 여러 장 병렬 리사이즈. Promise.all 실패 시 부분 성공 필요하므로 allSettled. */
export async function resizeManyForUpload(uris: string[], maxWidth = 1600): Promise<string[]> {
  const results = await Promise.allSettled(uris.map((u) => resizeForUpload(u, maxWidth)));
  return results.map((r, i) => (r.status === 'fulfilled' ? r.value : uris[i]));
}

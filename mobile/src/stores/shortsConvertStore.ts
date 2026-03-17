import { create } from 'zustand';
import { shortsApi } from '../api/shortsApi';
import { queryClient } from '../lib/queryClient';
import type { ShortsConvertResponse } from '../types/shorts';

type ConvertStatus = 'idle' | 'converting' | 'done' | 'error';

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_YOUTUBE_URL: '유튜브 쇼츠 URL을 입력해주세요.',
  AUDIO_EXTRACTION_FAILED: '영상 음성을 추출할 수 없어요.',
  NO_AUDIO_CONTENT: '음성이 없는 영상이에요.',
  NOT_COOKING_VIDEO: '요리 영상이 아닌 것 같아요.',
  CONVERSION_TIMEOUT: '변환 시간이 너무 오래 걸려요.\n다시 시도해주세요.',
  RATE_LIMIT_EXCEEDED: '요청이 너무 많아요.\n잠시 후 시도해주세요.',
};

interface ShortsConvertState {
  status: ConvertStatus;
  url: string | null;
  startedAt: number | null;
  result: ShortsConvertResponse | null;
  errorMessage: string | null;

  startConvert: (url: string) => void;
  retry: () => void;
  reset: () => void;
}

export const useShortsConvertStore = create<ShortsConvertState>((set, get) => ({
  status: 'idle',
  url: null,
  startedAt: null,
  result: null,
  errorMessage: null,

  startConvert: (url: string) => {
    set({
      status: 'converting',
      url,
      startedAt: Date.now(),
      result: null,
      errorMessage: null,
    });

    shortsApi
      .convert(url)
      .then((res) => {
        const data = res.data.data;

        // react-query 캐시에 저장 (result 화면 history 모드에서도 사용)
        queryClient.setQueryData(['shorts', String(data.cacheId)], data);
        queryClient.invalidateQueries({ queryKey: ['shorts-history'] });

        set({ status: 'done', result: data });
      })
      .catch((error: any) => {
        const code = error?.response?.data?.error?.code;
        const message =
          ERROR_MESSAGES[code] ?? '변환에 실패했어요.\n다시 시도해주세요.';
        set({ status: 'error', errorMessage: message });
      });
  },

  retry: () => {
    const { url } = get();
    if (url) get().startConvert(url);
  },

  reset: () => {
    set({
      status: 'idle',
      url: null,
      startedAt: null,
      result: null,
      errorMessage: null,
    });
  },
}));

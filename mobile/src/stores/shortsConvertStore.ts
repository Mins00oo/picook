import { create } from 'zustand';
import { shortsApi } from '../api/shortsApi';
import { setSuppressNetworkAlerts } from '../api/client';
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

function cacheAndFinish(data: ShortsConvertResponse, set: Function) {
  queryClient.setQueryData(['shorts', String(data.cacheId)], data);
  queryClient.invalidateQueries({ queryKey: ['shorts-history'] });
  set({ status: 'done', result: data, needsRecovery: false });
}

interface ShortsConvertState {
  status: ConvertStatus;
  url: string | null;
  startedAt: number | null;
  result: ShortsConvertResponse | null;
  errorMessage: string | null;
  needsRecovery: boolean;

  startConvert: (url: string) => void;
  retry: () => void;
  recoverFromBackground: () => Promise<void>;
  reset: () => void;
}

export const useShortsConvertStore = create<ShortsConvertState>((set, get) => ({
  status: 'idle',
  url: null,
  startedAt: null,
  result: null,
  errorMessage: null,
  needsRecovery: false,

  startConvert: (url: string) => {
    set({
      status: 'converting',
      url,
      startedAt: Date.now(),
      result: null,
      errorMessage: null,
      needsRecovery: false,
    });

    shortsApi
      .convert(url)
      .then((res) => {
        cacheAndFinish(res.data.data, set);
      })
      .catch((error: any) => {
        const isNetworkError = !error.response;

        if (isNetworkError) {
          // 백그라운드 전환으로 iOS가 TCP 끊었을 가능성 높음.
          // status를 'converting'으로 유지 → 프로그레스 UI 그대로 유지 (0% 리셋 방지)
          // needsRecovery 플래그만 설정 → AppState 리스너 또는 타이머가 복구 처리
          set({ needsRecovery: true });

          // 포그라운드에서 발생한 네트워크 에러 대비: 2초 후 자동 복구 시도
          // 백그라운드면 이 호출도 실패하지만, AppState 리스너가 재시도함
          setTimeout(() => {
            if (get().needsRecovery) {
              get().recoverFromBackground();
            }
          }, 2000);
          return;
        }

        // 서버 에러 (4xx, 5xx) → 에러 화면 표시
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

  /**
   * 앱이 백그라운드 → 포그라운드로 돌아왔을 때 호출.
   * 서버가 이미 변환을 완료했는지 recent history에서 확인 후,
   * 완료됐으면 결과를 가져오고, 아니면 재시도.
   */
  recoverFromBackground: async () => {
    const { url, needsRecovery } = get();
    if (!needsRecovery || !url) return;

    // 중복 호출 방지
    set({ needsRecovery: false });

    // recovery 중 모든 네트워크 에러 Alert 억제
    setSuppressNetworkAlerts(true);
    try {
      // 서버에 이미 변환 완료된 결과가 있는지 확인
      const recentRes = await shortsApi.getRecent();
      const match = recentRes.data.data.find((h) => h.youtubeUrl === url);

      if (match) {
        // 서버가 이미 완료 → 상세 데이터 조회
        const detailRes = await shortsApi.getDetail(match.cacheId);
        cacheAndFinish(detailRes.data.data, set);
      } else {
        // 서버도 미완료 → 재시도
        setSuppressNetworkAlerts(false);
        get().startConvert(url);
      }
    } catch {
      // recovery API 호출도 실패 → 에러 화면
      set({
        status: 'error',
        errorMessage: '변환에 실패했어요.\n다시 시도해주세요.',
      });
    } finally {
      setSuppressNetworkAlerts(false);
    }
  },

  reset: () => {
    set({
      status: 'idle',
      url: null,
      startedAt: null,
      result: null,
      errorMessage: null,
      needsRecovery: false,
    });
  },
}));

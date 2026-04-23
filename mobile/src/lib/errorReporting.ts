/**
 * 에러 리포팅 어댑터.
 * 실제 Sentry(또는 다른 APM) 초기화는 네이티브 빌드 + DSN 설정이 필요.
 * 지금은 콘솔 로그 + 환경 변수 체크로 대체해두고,
 * EAS Build 시 아래 TODO를 채워 교체한다.
 *
 * 설치 가이드 (나중):
 *   1) npx expo install @sentry/react-native
 *   2) app.json plugins 에 "@sentry/react-native/expo" 추가
 *   3) expo-constants로 SENTRY_DSN 환경 변수 주입
 *   4) 이 파일 init/captureException/captureMessage 를 Sentry 호출로 교체
 */

let _initialized = false;

export function initErrorReporting() {
  if (_initialized) return;
  _initialized = true;

  // TODO: 실제 Sentry init
  // import * as Sentry from '@sentry/react-native';
  // Sentry.init({
  //   dsn: Constants.expoConfig?.extra?.sentryDsn,
  //   enableInExpoDevelopment: false,
  //   tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  //   environment: __DEV__ ? 'development' : 'production',
  // });

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.info('[errorReporting] dev mode — Sentry placeholder active');
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.error('[captureException]', error, context);
  // TODO: Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, context?: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.warn('[captureMessage]', message, context);
  // TODO: Sentry.captureMessage(message, { extra: context });
}

export function setUser(user: { id: string; email?: string | null } | null) {
  // TODO: Sentry.setUser(user ?? null);
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.info('[setUser]', user?.id ?? 'anon');
  }
}

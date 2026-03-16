import Constants from 'expo-constants';

function getDevApiUrl(): string {
  const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:8080`;
  }
  // fallback
  return 'http://localhost:8080';
}

export const Config = {
  API_BASE_URL: __DEV__ ? getDevApiUrl() : 'https://api.picook.com',
  QUERY_STALE_TIME: 5 * 60 * 1000,
  MAX_FAVORITES: 20,
  MAX_RECOMMEND_RESULTS: 10,
  MIN_MATCH_RATE: 30,
  JWT_ACCESS_KEY: 'picook_access_token',
  JWT_REFRESH_KEY: 'picook_refresh_token',
  USER_KEY: 'picook_user',
  ONBOARDING_KEY: 'picook_onboarding_done',
};

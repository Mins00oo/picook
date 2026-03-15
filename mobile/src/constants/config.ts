export const Config = {
  API_BASE_URL: __DEV__ ? 'http://localhost:8080' : 'https://api.picook.com',
  QUERY_STALE_TIME: 5 * 60 * 1000,
  MAX_FAVORITES: 20,
  MAX_RECOMMEND_RESULTS: 10,
  MIN_MATCH_RATE: 30,
  JWT_ACCESS_KEY: 'picook_access_token',
  JWT_REFRESH_KEY: 'picook_refresh_token',
  USER_KEY: 'picook_user',
  ONBOARDING_KEY: 'picook_onboarding_done',
};

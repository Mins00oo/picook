# 모바일 — React Native (Expo)

## 기술 스택 (확정 버전 — 반드시 준수)

**핵심 런타임 (SDK 54 기준, 절대 임의 변경 금지)**
| 패키지 | 버전 | 비고 |
|--------|------|------|
| expo | ~54.0.0 (54.0.33) | SDK 54 — Expo Go 최신 지원 |
| react | 19.1.0 | SDK 54 호환 |
| react-native | 0.81.5 | SDK 54 호환 |
| react-dom | 19.1.0 | 웹 번들링용 |
| react-native-web | ~0.21.0 (0.21.2) | 웹 번들링용 |
| typescript | ~5.9.2 (5.8.3 설치됨, minor 차이 빌드무관) | |
| @types/react | ~19.1.0 (19.1.17) | react-native 0.81.5 peer dep |

**Expo 패키지 (SDK 54 호환 — `npx expo install --fix`로 확인된 버전)**
| 패키지 | 버전 | 비고 |
|--------|------|------|
| expo-router | ~6.0.23 | 파일 기반 라우팅 |
| expo-dev-client | ~6.0.20 | 개발 빌드 (expo doctor 권장 버전) |
| expo-constants | ~18.0.13 | expo-router peer dep (필수) |
| expo-secure-store | ~15.0.8 | JWT 토큰 저장 |
| expo-image | ~3.0.11 | 이미지 렌더링 |
| expo-image-picker | ~17.0.10 | 완성 사진 촬영 |
| expo-clipboard | ~8.0.8 | 쇼츠 URL 붙여넣기 |
| expo-notifications | ~0.32.16 | 로컬 푸시 |
| expo-av | ~16.0.8 | 오디오 |
| expo-apple-authentication | ~8.0.8 | Apple 로그인 |
| expo-linking | ~8.0.11 | 딥링크 |
| expo-splash-screen | ~31.0.13 | 스플래시 |
| expo-status-bar | ~3.0.9 | 상태바 |
| expo-task-manager | ~14.0.9 | 백그라운드 태스크 |

**서드파티 패키지**
| 패키지 | 버전 | 비고 |
|--------|------|------|
| @react-native-seoul/kakao-login | ~5.4.0 (5.4.2) | 카카오 로그인 (커스텀 config plugin 사용) |
| @shopify/flash-list | 2.0.2 | 고성능 리스트 |
| @tanstack/react-query | ~5.75.0 (5.75.7) | 서버 상태 |
| axios | ~1.9.0 | HTTP 클라이언트 |
| zustand | ~5.0.5 (5.0.11) | 클라이언트 상태 |
| react-native-reanimated | ~4.1.1 (4.1.6) | 애니메이션 |
| react-native-safe-area-context | ~5.6.0 (5.6.2) | SafeArea |
| react-native-screens | ~4.16.0 | 네이티브 스크린 |
| react-native-worklets | 0.5.1 | reanimated 의존 (expo doctor 권장) |

## 패키지 버전 관리 규칙
1. **새 패키지 추가 시**: 반드시 `npx expo install {패키지명}`으로 설치하여 SDK 호환 버전 자동 결정
2. **SDK 업그레이드 시**: `npx expo install --fix`로 모든 expo 패키지 일괄 업데이트
3. **버전 확인**: 수동 추측 금지. 반드시 `npx expo-doctor`로 권장 버전 확인 후 `npx expo install`로 설치
4. **`*` 또는 `^` 버전 사용 금지**: 반드시 `~`로 고정
5. **.npmrc**: `legacy-peer-deps=true` 유지 (EAS 빌드 서버 호환)

## 알려진 제약사항
- **@react-native-seoul/kakao-login**: Expo Go에서 동작 안 함 → 네이티브 빌드 필수. `@expo/config-plugins`의 `codeMod` 모듈 제거 이슈로 커스텀 플러그인(`plugins/withKakaoLogin.js`) 사용.
- **expo-notifications**: Expo Go에서 Android 원격 푸시 미지원 (SDK 53+). 로컬 알림은 동작.
- **Windows 개발**: 폰 테스트 시 공유기 AP 격리 주의 → 폰 핫스팟으로 우회. 방화벽 포트 8081 인바운드 허용 필요.

## 탭 구조 (하단 4탭)
홈 / 쇼츠 / 즐겨찾기 / 마이페이지

## 디렉토리 구조
```
app/
├── _layout.tsx                # 루트 (QueryClient, 인증 체크, axios 설정)
├── (auth)/
│   ├── onboarding.tsx         # 3페이지 스와이프 소개
│   ├── login.tsx              # Apple + 카카오
│   └── setup.tsx              # 닉네임/캐릭터 설정
├── (tabs)/
│   ├── _layout.tsx            # 4탭
│   ├── home/
│   │   ├── index.tsx          # 홈 (등급뱃지, CTA, 최근검색, 인기)
│   │   ├── select.tsx         # 재료 선택 (카테고리별 체크)
│   │   ├── confirm.tsx        # 추천 전 확인 (재료 + 시간/난이도/인분 필터)
│   │   └── results.tsx        # 추천 결과 TOP 10
│   ├── shorts/
│   │   ├── index.tsx          # URL 입력 + 최근 변환 목록
│   │   └── result.tsx         # 변환 결과 (단계별)
│   ├── favorites/index.tsx    # 즐겨찾기 목록
│   ├── mypage/
│   │   ├── index.tsx          # 등급 표시, 메뉴
│   │   ├── profile.tsx        # 닉네임, 실력 수정
│   │   ├── settings.tsx       # 앱 설정
│   │   └── delete-account.tsx # 회원 탈퇴
│   ├── recipe/[id].tsx        # 레시피 상세
│   └── cooking/
│       └── complete.tsx       # 완료 + 사진 + 등급
src/
├── api/                       # axios 래퍼 (컴포넌트에서 직접 호출 금지)
│   ├── client.ts              # axios 인스턴스 (JWT 자동 첨부, baseURL)
│   ├── authApi.ts
│   ├── userApi.ts
│   ├── ingredientApi.ts
│   ├── recipeApi.ts
│   ├── favoriteApi.ts
│   ├── shortsApi.ts
│   └── searchHistoryApi.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useRecipes.ts          # useRecommendations, useRecipeDetail
│   ├── useIngredients.ts      # 전체 재료 로드 + 로컬 검색
│   ├── useFavorites.ts
│   ├── useShortsConvert.ts
│   └── useRanking.ts          # 등급 조회
├── stores/
│   ├── authStore.ts           # JWT 토큰, 사용자 정보
│   ├── selectionStore.ts      # 선택된 재료 목록
│   └── filterStore.ts         # 시간/난이도/인분 필터
├── components/
│   ├── common/                # Button, Input, Toast, Loading, ErrorScreen
│   ├── recipe/                # RecipeCard, StepList
│   ├── ingredient/            # IngredientChip, CategoryTab, IngredientGrid
│   ├── shorts/                # ShortsInput, ConvertResult, RecentList
│   └── ranking/               # RankBadge, LevelUpAnimation, ProgressBar
├── types/
│   ├── recipe.ts, ingredient.ts, user.ts
│   ├── shorts.ts, ranking.ts, api.ts
├── utils/
│   ├── search.ts              # 초성 검색 + 동의어 매칭
│   ├── format.ts              # 시간, 숫자 포맷
│   └── validation.ts          # URL 검증 등
├── constants/
│   ├── colors.ts, config.ts, levels.ts
└── i18n/                      # Phase 2
```

## 온보딩 (MVP)
```
캐릭터 선택 + 닉네임 입력 → 홈
```

Phase 2 추가 예정: 알레르기 입력, 조리 도구 선택

## 추천 흐름 (MVP)
```
재료 선택 (카테고리별 체크)
  → 추천 전 확인 (재료 목록 + 시간/난이도/인분 필터)
  → POST /api/v1/recipes/recommend
  → 결과: TOP 10 (매칭률순)
  → 레시피 선택 → 상세
```

MVP에서 제외: 조리 도구 필터, 알레르기 필터 (Phase 2)

## 재료 검색
앱 시작 시 GET /api/v1/ingredients로 전체 로드 → 로컬 캐싱.
검색은 서버 없이 로컬 처리 (초성 + 동의어).
```typescript
// 초성 검색 + 동의어 매칭
const searchIngredients = (query, ingredients) => {
  return ingredients.filter(ing =>
    ing.name.includes(query) ||
    (isChosung(query) && getChosung(ing.name).includes(query)) ||
    ing.synonyms?.some(s => s.includes(query))
  );
};
```

## 등급 표시
```typescript
const LEVELS = [
  { level: 1, title: '요리 병아리', emoji: '🐣', min: 0 },
  { level: 2, title: '주방 탐험가', emoji: '🔍', min: 3 },
  { level: 3, title: '냉장고 파이터', emoji: '💪', min: 6 },
  { level: 4, title: '집밥 장인', emoji: '🍳', min: 11 },
  { level: 5, title: '요리 마스터', emoji: '👨‍🍳', min: 21 },
  { level: 6, title: '셀프 셰프', emoji: '⭐', min: 36 },
  { level: 7, title: '전설의 요리사', emoji: '🏆', min: 51 },
];
```
마이페이지: 레벨 + 칭호 + 진행률 바. 홈: 뱃지. 레벨업 시 애니메이션.

## API 베이스 설정
```typescript
// src/api/client.ts
const api = axios.create({
  baseURL: __DEV__ ? 'http://localhost:8080' : 'https://api.picook.com',
});
// JWT 자동 첨부 인터셉터
```

## 개발 진행 상황

### 2단계: 인증 + 온보딩
- ✅ API 클라이언트 (axios + JWT 인터셉터 + 토큰 리프레시)
- ✅ authStore (Zustand + SecureStore)
- ✅ 루트 레이아웃 (인증 분기 + QueryClient)
- ✅ 온보딩 3페이지 (스와이프)
- ✅ 로그인 화면 (카카오 + Apple)
- ✅ 셋업 (캐릭터/닉네임 → PUT /api/v1/users/me)
- ✅ 하단 4탭 레이아웃 (홈/쇼츠/즐겨찾기/마이)

### 3단계: 재료 선택 + 추천 + 상세
- ✅ 재료 데이터 로드 (react-query + ingredientApi)
- ✅ 재료 선택 화면 (카테고리탭 + 그리드 + 초성검색)
- ✅ selectionStore (Zustand)
- ✅ 추천 전 확인 (시간/난이도/인분 필터)
- ✅ 추천 결과 TOP 10
- ✅ 레시피 상세 (재료 + 단계 + 즐겨찾기)

### 4단계: 즐겨찾기 + 마이페이지
- ✅ 즐겨찾기 탭 (목록 + 삭제 확인)
- ✅ 즐겨찾기 추가/삭제 (하트 토글 + 낙관적 업데이트)
- ✅ 마이페이지 (프로필 + 등급 뱃지 + 진행률)
- ✅ 프로필 수정
- ✅ 앱 설정 + 로그아웃
- ✅ 회원 탈퇴

### 5단계: 쇼츠 변환
- ✅ URL 입력 화면 (붙여넣기 + 검증 + 최근 목록)
- ✅ useShortsConvert (mutation + polling)
- ✅ 변환 결과 화면 (단계별 레시피)

### 8단계: UI 품질 개선 (PIC-20)
- ✅ 재료 선택: 카테고리-그리드 간 거대 여백 제거 (ScrollView flexGrow:0)
- ✅ 재료 선택: 비활성 버튼 색상 변경 (#E5E7EB + #9CA3AF), 빈 상태 분리
- ✅ 쇼츠 탭: URL 중복 제거 (같은 youtubeUrl 최신 1건만)
- ✅ 쇼츠 탭: 카드 디자인 (썸네일 80x60 + 제목 + URL + 상대시간 + 화살표)
- ✅ 쇼츠 탭: 빈 상태 (🎬 + 안내), URL 검증 (✅/❌ + 테두리 색상)
- ✅ 앱 아이콘 교체 (프라이팬+계란+허브, scripts/generate-icon.py)
- ✅ 쇼츠 탭: 개별 삭제 (스와이프 → Swipeable), 전체 삭제 ([전체 삭제] + 확인 다이얼로그)
- ✅ 쇼츠 탭: 채널명(channelName) 표시, 타입 Swagger 동기화

### 빌드 및 환경 설정
- ✅ Expo SDK 55 → 54 다운그레이드 (Expo Go 최신 버전 호환)
- ✅ react-native-web + react-dom 설치 (웹 번들링 지원)
- ✅ react-native-worklets 설치 (reanimated 의존)
- ✅ EAS Build 설정 (eas.json — development/preview/production 프로필)
- ✅ expo-dev-client 설치 (개발 빌드용)
- ✅ 카카오 로그인 커스텀 config plugin (plugins/withKakaoLogin.js — @expo/config-plugins codeMod 호환 문제 해결)
- ✅ 카카오 네이티브 앱 키 연동 (app.json plugins + iOS URL scheme/queries schemes)
- ✅ Apple Sign-In 설정 (usesAppleSignIn: true)
- ✅ .npmrc legacy-peer-deps=true (EAS 빌드 서버 peer dependency 충돌 해결)
- ✅ @types/react ~19.1.0 업그레이드 (react-native 0.81.5 peer dep 호환)
- ✅ Windows 방화벽 포트 8081 인바운드 규칙 추가
- ✅ Expo Go 테스트: 폰 핫스팟 연결로 AP 격리 우회 확인
- ⬜ EAS 네이티브 빌드 성공 대기 중 (iOS development profile)
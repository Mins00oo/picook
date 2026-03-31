# Picook Mobile

> React Native (Expo SDK 54) + TypeScript 기반 iOS 앱

## 소개

Picook 모바일 앱은 냉장고 재료 기반 레시피 추천, 음성 코칭 모드, 유튜브 쇼츠 레시피 변환을 제공하는 iOS 앱입니다. Expo 기반으로 빠른 개발 사이클을 유지하면서도, 네이티브 모듈(카카오 로그인, 음성 인식)을 Config Plugin으로 통합했습니다.

---

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | React Native (Expo) | SDK 54 / RN 0.81.5 |
| 언어 | TypeScript | 5.9 |
| 라우팅 | expo-router | 6.0 (파일 기반) |
| 상태 관리 | Zustand | 5.0 |
| 서버 상태 | TanStack React Query | 5.75 |
| HTTP | Axios | 1.9 |
| TTS | expo-speech | 14.0 |
| STT | @react-native-voice/voice | 3.2 (네이티브 빌드 전용) |
| 소셜 로그인 | expo-apple-authentication + @react-native-seoul/kakao-login | |
| 리스트 | @shopify/flash-list | 2.0 |
| 애니메이션 | react-native-reanimated | 4.1 |
| 보안 저장소 | expo-secure-store | (JWT 토큰 암호화 저장) |

---

## 화면 구조 (32개 route)

### 인증 플로우
```
(auth)/
├── onboarding.tsx       ← 3페이지 스와이프 소개 (Expo Go 호환)
├── login.tsx            ← Apple Sign-In + 카카오 로그인
└── setup.tsx            ← 2단계 온보딩 (요리 레벨 → 코칭 설정)
```

### 메인 4탭
```
(tabs)/
├── home/                ← 레시피 추천
│   ├── index.tsx        ← 홈 (인사말, 등급 뱃지, CTA, 레벨 카드, 검색 이력)
│   ├── select.tsx       ← 재료 선택 (카테고리 + 그리드 + 초성 검색)
│   ├── confirm.tsx      ← 추천 전 확인 (시간/난이도/인분 필터)
│   └── results.tsx      ← TOP 10 추천 결과 (매칭률, 부족 재료)
│
├── shorts/              ← 쇼츠 변환
│   ├── index.tsx        ← URL 입력 + 최근 변환 (URL별 중복 제거)
│   └── result.tsx       ← 변환 결과 (단계별 레시피)
│
├── favorites/
│   └── index.tsx        ← 즐겨찾기 목록 + 삭제 확인
│
├── mypage/              ← 마이페이지
│   ├── index.tsx        ← 등급 표시, 메뉴
│   ├── profile.tsx      ← 닉네임 + 요리 레벨 수정
│   ├── coaching-settings.tsx  ← 코칭 토글, 속도, 알림
│   ├── cooking-history.tsx    ← 과거 조리 이력
│   ├── cooking-detail/[id].tsx ← 조리 상세 (사진 포함)
│   ├── settings.tsx     ← 앱 설정, 로그아웃
│   └── delete-account.tsx ← 계정 삭제
│
└── recipe/[id].tsx      ← 레시피 상세 (재료, 단계, 코칭 CTA, 즐겨찾기)
```

### 코칭 모드 (탭 밖)
```
cooking/
├── single/[id].tsx      ← 싱글 코칭 (전체화면, 타이머, 단계 진행)
├── multi-preview.tsx    ← 멀티 코칭 타임라인 미리보기
├── multi-cooking.tsx    ← 멀티 코칭 (미니 상태바, 레시피 전환)
└── complete.tsx         ← 완료 (사진 업로드 최대 5장, 레벨업 애니메이션)
```

---

## 핵심 엔진

### CoachingEngine (`src/engines/CoachingEngine.ts`)

싱글 레시피 코칭을 위한 **상태 머신**.

```
상태: IDLE → PLAYING → WAITING → PAUSED → COMPLETED
         ↑_______↓       ↑____↓
```

- `PLAYING` (active 단계): TTS 안내 → 사용자 "다음" 확인 대기
- `WAITING` (wait 단계): 타이머 자동 시작 → 완료 알림 → 사용자 확인
- 이벤트 기반: `STEP_CHANGED`, `STATUS_CHANGED`, `TIMER_TICK`, `TIMER_DONE`, `COMPLETED`
- 메서드: `init(steps)`, `start()`, `next()`, `prev()`, `repeat()`, `pause()`, `resume()`

### TimelineEngine (`src/engines/TimelineEngine.ts`)

2개 이상 레시피를 **동시에 조리**하기 위한 타임라인 통합 엔진.

- 레시피 A의 `wait` 단계(대기 시간)에 레시피 B의 `active` 단계를 삽입
- 총 예상 시간 계산: 통합 타임라인 기반
- 정적 메서드: `generate(recipes)`, `getEstimatedTotalTime(timeline)`

### TimerManager (`src/engines/TimerManager.ts`)

백그라운드에서도 동작하는 타이머 관리.

- 앱 백그라운드 전환 시에도 타이머 유지
- 타이머 완료 시 로컬 푸시 알림 (expo-notifications)
- 조리 중 화면 꺼짐 방지 (expo-keep-awake)

---

## 서비스 레이어

### TTSService (`src/services/TTSService.ts`)
- expo-speech 래퍼
- 한국어 음성 안내, 속도 조절 (0.5 ~ 2.0)
- iOS 무음 모드 대응 (`ensureAudioMode()`)
- `speak()`, `pause()`, `resume()`, `stop()`

### STTService (`src/services/STTService.ts`)
- @react-native-voice/voice 래퍼 (네이티브 빌드 전용)
- **레이지 로딩**: Expo Go에서 모듈 미로드 시 graceful fallback
- 인식 명령어: "다음"/"next" → `next`, "반복"/"repeat"/"다시" → `repeat`

### AudioService (`src/services/AudioService.ts`)
- expo-audio 기반 알림 사운드 재생
- 타이머 완료 시 알림음

---

## 상태 관리 (Zustand)

### authStore
사용자 인증 상태 + JWT 토큰 관리
- `user`, `isAuthenticated`, `isOnboardingDone`
- 토큰 expo-secure-store 암호화 저장/복원

### selectionStore
재료 선택 상태 (최대 30개)
- `selectedIds: Set<number>`, `toggle()`, `clear()`

### filterStore
추천 필터 (시간, 난이도, 인분수)
- `maxCookTimeMinutes`, `difficulty`, `servings`

### coachingStore
현재 코칭 세션 상태
- `recipeId`, `currentStep`, `totalSteps`, `status`, `remainingSeconds`
- 쇼츠 기반 코칭 데이터 전달용 `shortsCookingData`

### shortsConvertStore
쇼츠 변환 진행 상태 + 백그라운드 복구
- `status: idle | converting | done | error`
- 앱 백그라운드 → 포그라운드 전환 시 상태 복구

---

## API 레이어 (10개 모듈)

| 파일 | 담당 |
|------|------|
| `client.ts` | Axios 인스턴스 + JWT 자동 주입 + 401 토큰 리프레시 인터셉터 |
| `authApi.ts` | Apple/카카오 로그인, 로그아웃 |
| `userApi.ts` | 프로필 조회/수정 |
| `ingredientApi.ts` | 전체 재료 목록 (앱 시작 시 캐시) |
| `recipeApi.ts` | 추천, 레시피 상세 |
| `favoriteApi.ts` | 즐겨찾기 CRUD |
| `coachingApi.ts` | 코칭 시작/완료 |
| `cookingApi.ts` | 사진 업로드 |
| `shortsApi.ts` | 쇼츠 변환, 즐겨찾기, 이력 |
| `searchHistoryApi.ts` | 검색 이력 |

---

## 실행 방법

### Expo Go (빠른 테스트)

```bash
npm install
npx expo start
# QR 코드 스캔으로 즉시 실행
# 카카오 로그인, STT는 동작하지 않음 (네이티브 모듈)
```

### 네이티브 개발 빌드 (전체 기능)

```bash
npm install
npx expo prebuild
npx expo run:ios
# 또는 EAS Build
eas build --platform ios --profile development
```

### 환경 설정

API 서버 주소는 `src/constants/config.ts`에서 관리:
- 개발: Expo Constants `debuggerHost`에서 자동 추출
- 프로덕션: `https://api.picook.co.kr`

---

## 디렉토리 구조

```
mobile/
├── app/                          ← expo-router 화면 (32개)
│   ├── _layout.tsx               ← 루트 (QueryClient, 인증 체크, axios 설정)
│   ├── index.tsx                 ← 네비게이션 분기 (인증/미인증)
│   ├── (auth)/                   ← 비보호 라우트 (3개)
│   ├── (tabs)/                   ← 보호 라우트 (4탭, 24개)
│   └── cooking/                  ← 코칭 모드 (4개)
├── src/
│   ├── api/                      ← 서버 API (10개 모듈)
│   ├── engines/                  ← CoachingEngine, TimelineEngine, TimerManager
│   ├── services/                 ← TTS, STT, Audio
│   ├── stores/                   ← Zustand (5개)
│   ├── types/                    ← 타입 정의 (8개)
│   ├── components/               ← 공통 + 코칭 + 쇼츠 컴포넌트
│   ├── constants/                ← 색상, 테마, 레벨, 설정
│   ├── utils/                    ← 초성 검색, 포맷, URL 검증
│   └── lib/                      ← QueryClient 인스턴스
├── plugins/
│   └── withKakaoLogin.js         ← 카카오 네이티브 Config Plugin
├── assets/                       ← 앱 아이콘, 스플래시
├── app.json                      ← Expo 설정 (Bundle ID: com.picook.app)
├── eas.json                      ← EAS Build 프로필
└── package.json                  ← 46개 의존성
```

---

## 주요 구현 특징

### JWT 토큰 관리
- expo-secure-store에 암호화 저장
- Axios 인터셉터로 모든 요청에 자동 주입
- 401 응답 시 자동 리프레시 + 실패 요청 재시도 큐

### 재료 검색 (오프라인)
- 앱 시작 시 전체 재료 목록 1회 다운로드
- 초성(ㄱㄴㄷ) 검색 + 동의어 매칭
- 서버 라운드트립 없이 로컬 필터링

### 쇼츠 변환 백그라운드 복구
- 변환 소요 120초 → 앱 백그라운드 전환 가능
- 포그라운드 복귀 시 shortsConvertStore에서 상태 복구
- 네트워크 에러 알림 억제 (백그라운드 복구 중)

### 등급 시스템 (7단계)
코칭 완료 + 사진 업로드 = 1카운트

| 레벨 | 이름 | 최소 횟수 |
|------|------|-----------|
| Lv.1 | 병아리 | 0 |
| Lv.2 | 탐험가 | 3 |
| Lv.3 | 파이터 | 6 |
| Lv.4 | 장인 | 11 |
| Lv.5 | 마스터 | 21 |
| Lv.6 | 셰프 | 36 |
| Lv.7 | 전설 | 51 |

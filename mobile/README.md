# Picook Mobile

> React Native (Expo SDK 54) + TypeScript — Picook iOS 앱

냉장고 재료로 추천받고, 요리한 기록을 모아 캐릭터를 키우는 iOS 앱입니다. Expo 기반으로 빠른 개발 사이클을 유지하면서 카카오 로그인 같은 네이티브 모듈은 Config Plugin으로 통합했습니다.

---

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | React Native (Expo) | SDK 54 / RN 0.81.5 |
| 언어 | TypeScript | 5.9 |
| 라우팅 | expo-router (파일 기반) | 6.0 |
| 클라이언트 상태 | Zustand | 5.0 |
| 서버 상태 | TanStack React Query | 5.75 |
| HTTP | Axios | 1.9 |
| 소셜 로그인 | expo-apple-authentication + @react-native-seoul/kakao-login | |
| 보안 저장소 | expo-secure-store (JWT 암호화) | |
| 이미지 | expo-image · expo-image-picker | |
| 애니메이션 | react-native-reanimated | 4.1 |

---

## 화면 구조

```
app/
├── _layout.tsx                  루트 (QueryClient · 인증 체크 · axios 설정)
├── index.tsx                    분기 (인증/미인증)
│
├── (auth)/                      비보호
│   ├── login.tsx                Apple · 카카오
│   └── setup.tsx                캐릭터 선택(MIN/ROO/HARU) + 닉네임
│
├── (tabs)/                      4탭 (보호)
│   ├── home/                    🏠 홈 — 메인 추천
│   │   ├── index.tsx            인사말 · 시간대 추천 · 카테고리 카드 · 저칼로리
│   │   ├── select.tsx           재료 선택 (카테고리 + 그리드 + 검색)
│   │   └── results.tsx          매칭률 추천 결과 TOP 10
│   │
│   ├── fridge/                  🧊 냉장고
│   │   └── index.tsx            보유 재료 토글 (검색 + 카테고리 그룹)
│   │
│   ├── cookbook/                📖 요리북
│   │   ├── index.tsx            카드/그리드 뷰 + 연·월 필터 + 4종 정렬
│   │   └── [id].tsx             요리 기록 상세
│   │
│   └── mypage/                  👤 마이
│       ├── index.tsx            캐릭터 + 레벨 + 메뉴
│       ├── profile.tsx          프로필 수정
│       ├── attendance.tsx       출석체크 캘린더
│       ├── closet.tsx           의상 옷장 (장착/구매)
│       ├── favorites.tsx        즐겨찾기 목록
│       ├── settings.tsx         앱 설정 · 로그아웃
│       └── delete-account.tsx   탈퇴
│
├── category/[name].tsx          카테고리별 레시피 페이지
├── recipe/[id].tsx              레시피 상세 (재료/단계)
├── cooking/complete.tsx         요리 완료 인증 (별점/메모/사진)
├── points.tsx                   포인트 이력
└── shop.tsx                     의상 상점
```

---

## 메인 화면 — 4가지 추천이 보이는 곳

홈 화면 한 화면에 추천 4종이 다 들어있습니다.

```
┌────────────────────────────────┐
│ 안녕하세요, ○○○님              │
│ 지금은 점심 시간이에요          │  ← 시간대 인사
├────────────────────────────────┤
│ ☀️ 점심에 어울리는 메뉴 (TOP 5) │  ← 시간대 추천
│ [recipe] [recipe] [recipe] ... │     /api/v1/recipes/recommend-by-time
├────────────────────────────────┤
│ 🥬 냉장고에서 골라보기          │  ← 매칭 추천 진입
│ [재료 선택하기 →]               │
├────────────────────────────────┤
│ 카테고리별 둘러보기              │  ← 카테고리 카드
│ [한식] [양식]                   │     /api/v1/recipes/category-counts
│ [일식] [기타]                   │
├────────────────────────────────┤
│ 가볍게 먹고 싶은 날 🥗 저칼로리 │  ← 저칼로리 추천
│ [TOP 5 ≤300kcal]                │     /api/v1/recipes/recommend-low-calorie
└────────────────────────────────┘
```

시간대 4슬롯은 클라이언트 시간(`getCurrentPeriod`) 기준:

| 시간 | 슬롯 | 호출 값 |
|------|------|---------|
| 06–10 | 아침 | `breakfast` |
| 10–15 | 점심 | `lunch` |
| 15–21 | 저녁 | `dinner` |
| 21–06 | 야식 | `midnight` |

---

## 게임화 시스템

### 캐릭터 (3종 · 가입 시 선택)

| 코드 | 이름 |
|------|------|
| `MIN` | 민 |
| `ROO` | 루 |
| `HARU` | 하루 |

`users.character_type`에 저장. `setup` 화면에서 한 번 선택 후 변경 가능.

### 레벨 (7단계)

`users.total_exp` 누적값 기준 — 요리북 인증(사진 1장+) 시 +80 EXP.

| Lv | 이름 | 누적 EXP |
|----|------|----------|
| 1 | 병아리 | 0 |
| 2 | 탐험가 | (단계별 컷오프) |
| 3 | 파이터 | |
| 4 | 장인 | |
| 5 | 마스터 | |
| 6 | 셰프 | |
| 7 | 전설 | |

> 구체 컷오프는 `src/constants/levels.ts` 참조. 레벨업 시 `LevelRewardLog`에 기록되고, 해당 레벨에 묶인 의상이 자동 지급됩니다.

### 의상 옷장 (6 슬롯)

| 슬롯 | 위치 |
|------|------|
| `head` | 머리 |
| `top` | 상의 |
| `bottom` | 하의 |
| `shoes` | 신발 |
| `leftHand` | 왼손 |
| `rightHand` | 오른손 |

- **DEFAULT** — 가입 시 자동 (앞치마 + 나무 주걱)
- **LEVEL_REWARD** — 레벨 도달 자동 (Lv.3 요리 모자, Lv.5 프라이팬·뒤집개, Lv.7 셰프 의상)
- **SHOP** — 포인트로 구매

마이페이지 → 옷장(`closet`)에서 슬롯별로 장착 변경. 슬롯당 1개, NULL이면 해제.

### 포인트

| 적립 사유 | 금액 |
|-----------|------|
| 일일 출석 (`DAILY_CHECK`) | +10 |
| 요리북 인증 (`COOKBOOK_ENTRY`, 사진 1장+) | +50 |
| 의상 구매 (`SHOP_PURCHASE`) | -가격 |

`PointLedger`에 모든 변동이 기록되며 `users.point_balance`는 잔액 캐시.

### 출석체크

홈 진입 시 미출석이면 모달 자동 오픈 + 즉시 자동 mutate. 사용자가 X든 확인이든 어떻게 닫아도 포인트는 이미 적립된 상태. 7일 스트릭 + 캘린더로 표시.

---

## 상태 관리 (Zustand)

| 스토어 | 책임 |
|--------|------|
| `authStore` | 사용자/JWT/온보딩 상태. expo-secure-store 암호화 저장 |
| `selectionStore` | 재료 선택 상태 (`Set<number>`, 추천 입력용) |
| `filterStore` | 추천 필터 (시간/난이도/인분) |

서버 상태는 React Query — 재료/추천/요리북/의상 등 모든 GET은 Query Key로 캐시.

---

## API 레이어 (`src/api/`)

| 파일 | 담당 |
|------|------|
| `client.ts` | Axios + JWT 자동 주입 + 401 리프레시 인터셉터 + 토큰 재시도 큐 |
| `authApi.ts` | Apple · 카카오 · 로그아웃 |
| `userApi.ts` | 프로필 |
| `ingredientApi.ts` | 재료/카테고리 |
| `recipeApi.ts` | 추천 4종 + 상세 |
| `favoriteApi.ts` | 즐겨찾기 |
| `cookbookApi.ts` | 요리 인증 |
| `fridgeApi.ts` | 냉장고 |
| `pointApi.ts` | 포인트 |
| `attendanceApi.ts` | 출석체크 |
| `outfitApi.ts` | 의상 |
| `searchHistoryApi.ts` | 검색 이력 |

---

## 실행

### Expo Go (빠른 확인 · 카카오 로그인 X)

```bash
cd mobile
npm install
npx expo start
# QR 스캔
```

### 네이티브 개발 빌드 (전체 기능)

```bash
npx expo prebuild
npx expo run:ios
# 또는 EAS Build:
eas build --platform ios --profile development
```

### API 서버 주소

`src/constants/config.ts`:
- 개발 — Expo Constants `debuggerHost` 자동 추출 (같은 네트워크의 Mac/PC)
- 프로덕션 — `https://api.picook.co.kr` (테스트 단계라 서버는 비공개)

---

## 디렉토리 구조

```
mobile/
├── app/                         expo-router 화면 (위 구조 참조)
├── src/
│   ├── api/                     서버 API 클라이언트
│   ├── stores/                  Zustand
│   ├── hooks/                   useAttendance · useFridge · useTimeRecipes ·
│   │                            useCategoryRecipes · useOutfits · useCookbook ...
│   ├── components/              common · attendance · cookbook · outfit · ...
│   ├── constants/               theme(컬러/폰트) · levels · config
│   ├── utils/                   timePeriod · format · 검증
│   ├── types/                   ingredient · recipe · ...
│   └── lib/                     QueryClient
├── plugins/
│   └── withKakaoLogin.js        카카오 네이티브 Config Plugin
├── assets/                      앱 아이콘 / 스플래시
├── app.json                     Expo 설정 (Bundle ID: com.picook.app)
└── eas.json                     EAS Build 프로필
```

---

## 주요 구현

### JWT 토큰 관리
expo-secure-store 암호화 저장. Axios 인터셉터로 모든 요청에 자동 주입. 401 응답 시 자동 리프레시 + 실패 요청 재시도 큐.

### 재료 검색 (오프라인)
앱 시작 시 전체 재료 1회 다운로드 → 로컬 필터링. 초성(ㄱㄴㄷ) 검색 + 동의어 매칭. 서버 라운드트립 없음. 카테고리/검색 변경 시 RAF로 한 프레임 미뤄 layout 재계산 후 스크롤 리셋.

### emoji 서버 응답 활용
재료/카테고리의 `resolvedEmoji` 필드를 그대로 사용 — 클라이언트 휴리스틱 없음. 서버가 이모지 정책의 단일 소스.

### 화면 가상화
재료 목록처럼 길어질 수 있는 리스트는 `FlatList` + `initialNumToRender 20` + `windowSize 10` + `removeClippedSubviews` 조합으로 안정화.

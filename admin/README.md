# Picook Admin (백오피스)

> React 19 + Vite 7 + Ant Design 5 기반 관리자 웹 애플리케이션

## 소개

Picook 백오피스는 레시피/재료 데이터 관리, 유저 관리, 통계 대시보드, 쇼츠 캐시 관리 등 서비스 운영에 필요한 모든 관리 기능을 제공합니다. 3등급 역할 기반 접근 제어(RBAC)로 관리자별 권한을 세분화합니다.

---

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | React | 19.2 |
| 빌드 | Vite | 7.3 |
| 언어 | TypeScript | 5.9 |
| UI 라이브러리 | Ant Design | 5.26 |
| 라우팅 | React Router | 7.6 |
| 상태 관리 | Zustand | 5.0 |
| 서버 상태 | TanStack React Query | 5.75 |
| 폼 검증 | React Hook Form + Zod | 7.71 / 4.3 |
| 차트 | @ant-design/charts | 2.3 |
| 엑셀 | SheetJS xlsx | 0.18 |
| HTTP | Axios | 1.9 |

---

## 기능 모듈 (8개)

### 1. 대시보드
- 8개 핵심 지표 카드 (총 유저, 활성 유저, 레시피 수, 쇼츠 변환 등)
- 기간별 추이 차트 (7일/30일/90일)
- TOP 10 인기 레시피 + 재료
- 최근 피드백 목록

### 2. 레시피 관리
- 목록 (필터: 상태, 카테고리, 난이도, 코칭 준비 여부)
- 생성/수정: 조리 단계 에디터 (active/wait 타입, 시간, 병렬 가능 여부)
- 재료 매퍼 (자동완성 + 수량/단위)
- 상태 변경 (draft → published → hidden)
- **엑셀 일괄 등록** + 템플릿 다운로드

### 3. 재료 관리
- 목록 (카테고리 필터, 사용 횟수 표시)
- 생성/수정 (이름, 카테고리, 아이콘, 동의어)
- **엑셀 일괄 등록** + 템플릿 다운로드

### 4. 카테고리 관리
- CRUD + **드래그 앤 드롭 정렬**

### 5. 쇼츠 캐시 관리
- 캐시 목록/상세 (AI 모델 버전, YouTube 메타데이터)
- 수동 재변환
- 전체 캐시 초기화 (SUPER_ADMIN 전용)
- 변환 통계

### 6. 유저 관리 (SUPER_ADMIN 전용)
- 유저 목록 (상태, 로그인 타입, 레벨 필터)
- 상세: 프로필 + 탭 뷰 (코칭 로그, 완료 이력, 즐겨찾기, 검색 이력)
- 계정 정지/활성화

### 7. 피드백 관리
- 목록 (상태: 미읽음/읽음/해결, 평점 필터)
- 상태 변경 + 관리자 메모

### 8. 통계 (6개 페이지)
- 유저 통계: 가입 추이, DAU/MAU, 로그인 방법 분포
- 레시피 통계: 카테고리별, TOP 20, 코칭 준비율
- 재료 통계: 인기 재료 TOP 20, 미사용 재료
- 코칭 통계: 이용률, 완료율, 시간대별 분포
- 쇼츠 통계: 변환 추이, 성공률
- 랭킹 통계: 레벨 분포, 사진 업로드율

---

## 권한 체계 (3등급)

| 역할 | 접근 가능 메뉴 | 쓰기 권한 |
|------|---------------|-----------|
| **SUPER_ADMIN** | 전체 | 전체 (유저 관리, 계정 관리, 캐시 전체 초기화 포함) |
| **CONTENT_ADMIN** | 대시보드, 레시피, 재료, 카테고리, 쇼츠, 피드백, 통계 | 레시피/재료/카테고리/피드백 쓰기 |
| **VIEWER** | 대시보드, 통계 | 읽기 전용 |

---

## 실행 방법

```bash
npm install
npm run dev
# http://localhost:5173
# /api → http://localhost:8080 프록시 (Vite devServer)
```

### 빌드

```bash
npm run build
# dist/ 디렉토리에 정적 파일 생성
```

### 기본 로그인 정보

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| admin@picook.com | !@#admina | SUPER_ADMIN |

---

## 라우팅 구조

```
/login                              ← 로그인 (공개)
/                                   ← ProtectedRoute 래퍼
├── /dashboard                      ← 대시보드 (홈)
├── /recipes                        ← 레시피 목록
│   ├── /recipes/new                ← 레시피 생성
│   ├── /recipes/:id                ← 레시피 상세
│   ├── /recipes/:id/edit           ← 레시피 수정
│   └── /recipes/bulk-upload        ← 엑셀 일괄 등록
├── /ingredients                    ← 재료 목록
│   ├── /ingredients/new            ← 재료 생성
│   ├── /ingredients/:id/edit       ← 재료 수정
│   ├── /ingredients/categories     ← 카테고리 관리
│   └── /ingredients/bulk-upload    ← 엑셀 일괄 등록
├── /shorts                         ← 쇼츠 캐시 목록
│   ├── /shorts/:id                 ← 캐시 상세
│   └── /shorts/stats               ← 쇼츠 통계
├── /users                          ← 유저 목록 (SUPER_ADMIN)
│   └── /users/:id                  ← 유저 상세
├── /feedback                       ← 피드백 목록
│   └── /feedback/:id               ← 피드백 상세
├── /stats
│   ├── /stats/users                ← 유저 통계
│   ├── /stats/recipes              ← 레시피 통계
│   ├── /stats/ingredients          ← 재료 통계
│   ├── /stats/coaching             ← 코칭 통계
│   ├── /stats/shorts               ← 쇼츠 통계
│   └── /stats/ranking              ← 랭킹 통계
└── /accounts                       ← 관리자 계정 (SUPER_ADMIN)
```

---

## 디렉토리 구조

```
admin/
├── src/
│   ├── pages/                      ← 페이지 컴포넌트
│   │   ├── auth/Login.tsx
│   │   ├── dashboard/Dashboard.tsx
│   │   ├── recipes/                ← RecipeList, RecipeForm, RecipeDetail, RecipeBulkUpload
│   │   ├── ingredients/            ← IngredientList, IngredientForm, IngredientBulkUpload, CategoryManage
│   │   ├── shorts/                 ← ShortsCacheList, ShortsCacheDetail, ShortsStats
│   │   ├── users/                  ← UserList, UserDetail
│   │   ├── feedback/               ← FeedbackList, FeedbackDetail
│   │   ├── stats/                  ← UserStats, RecipeStats, IngredientStats, CoachingStats, ShortsStats, RankingStats
│   │   └── accounts/               ← AdminAccountList
│   │
│   ├── api/                        ← API 클라이언트 (12개)
│   │   ├── client.ts               ← Axios 인스턴스 + JWT 인터셉터
│   │   ├── authApi.ts              ← 로그인, 토큰 갱신, 비밀번호 변경
│   │   ├── recipeApi.ts            ← CRUD, 상태 변경, 벌크 업로드, 템플릿
│   │   ├── ingredientApi.ts        ← CRUD, 벌크 업로드
│   │   ├── categoryApi.ts          ← CRUD, 정렬
│   │   ├── shortsApi.ts            ← 캐시 관리, 재변환, 통계
│   │   ├── userApi.ts              ← 유저 목록/상세, 정지/활성화, 하위 리소스
│   │   ├── feedbackApi.ts          ← 목록/상세, 상태/메모 수정
│   │   ├── statsApi.ts             ← 6종 통계
│   │   ├── accountApi.ts           ← 관리자 계정 CRUD
│   │   └── dashboardApi.ts         ← 대시보드 3종 데이터
│   │
│   ├── components/
│   │   ├── layout/                 ← AppLayout, Sidebar (역할별 메뉴), Header
│   │   ├── common/                 ← FormField, ExcelUpload, ImageUpload, ConfirmModal, StatsCard, StatusBadge
│   │   └── recipe/                 ← RecipeStepEditor, IngredientMapper, CoachingReadyIndicator
│   │
│   ├── stores/
│   │   └── authStore.ts            ← JWT + 역할 정보 (localStorage 영속화)
│   │
│   ├── schemas/                    ← Zod 검증 스키마 (6개)
│   │   ├── loginSchema.ts
│   │   ├── recipeSchema.ts         ← 중첩 배열 (steps + ingredients)
│   │   ├── ingredientSchema.ts
│   │   ├── categorySchema.ts
│   │   ├── feedbackSchema.ts
│   │   └── adminAccountSchema.ts
│   │
│   ├── types/                      ← TypeScript 타입 (8개)
│   ├── utils/                      ← 포맷, 권한 유틸
│   └── App.tsx                     ← 라우터 + ProtectedRoute
│
├── vite.config.ts                  ← @/ 별칭, /api 프록시
├── tsconfig.app.json               ← ES2022, strict, JSX
└── package.json
```

---

## 주요 구현 특징

### JWT 인증 + 자동 로그아웃
- Axios 인터셉터로 Bearer 토큰 자동 주입
- 401 응답 시 localStorage 클리어 + `/login` 리다이렉트
- Zustand 스토어에서 `hasRole()`, `canWrite()` 메서드로 권한 체크

### 엑셀 일괄 등록
- SheetJS로 클라이언트 사이드 파싱 + 미리보기
- 서버 사이드 Apache POI로 검증 + 벌크 INSERT
- 에러 발생 시 행 번호 + 에러 메시지 반환

### 레시피 단계 에디터
- 동적 필드 배열 (React Hook Form useFieldArray)
- step_type (active/wait) 선택, duration_seconds 입력
- can_parallel 플래그 토글
- 모든 단계에 시간 입력 시 coaching_ready 자동 활성화 (DB 트리거)

### 카테고리 드래그 정렬
- Ant Design DnD 기반
- 서버에 sort_order 일괄 업데이트

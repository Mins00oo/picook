# Picook Admin

> React 19 + Vite 7 + Ant Design 5 — Picook 백오피스 웹

레시피·재료 관리, 시드 일괄 업로드, 의상 카탈로그, 유저 관리, 통계 대시보드 등 운영에 필요한 모든 기능을 제공합니다. 3등급 역할 기반 접근 제어(RBAC)로 권한을 분리합니다.

---

## 기술 스택

| 분류 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | React | 19.2 |
| 빌드 | Vite | 7.3 |
| 언어 | TypeScript | 5.9 |
| UI | Ant Design | 5.26 |
| 라우팅 | React Router | 7.6 |
| 상태 | Zustand | 5.0 |
| 서버 상태 | TanStack React Query | 5.75 |
| 폼 | React Hook Form + Zod | 7.71 / 4.3 |
| 차트 | @ant-design/charts | 2.3 |
| 엑셀 | SheetJS xlsx (클라이언트 검증/미리보기) | 0.18 |
| HTTP | Axios | 1.9 |

---

## 기능 모듈

### 1. 대시보드
8개 핵심 지표 카드 + 기간별 추이 차트(7/30/90일) + 인기 레시피·재료 TOP + 최근 피드백.

### 2. 레시피 관리
- 목록 (필터: 상태 / 카테고리 / 난이도)
- 생성/수정 — 조리 단계 에디터 + 재료 매퍼 (자동완성 · 수량/단위)
- 상태 변경 (`draft` → `published` → `hidden`)
- **엑셀 일괄 등록 + 템플릿 다운로드**

### 3. 재료 관리
- 목록 (카테고리 필터, 사용 횟수 표시)
- 생성/수정 — 이름 · 카테고리 · 서브카테고리 · 부모 재료 · 양념 여부 · 동의어 · 아이콘
- 카테고리/서브카테고리 관리 화면 별도 (`CategoryManage` / `SubcategoryManage`)
- 재료 통계 개요 (`IngredientOverview`)
- **엑셀 일괄 등록 + 템플릿 다운로드**

### 4. 시드 일괄 업로드 (`SeedManagement`)
**`picook_seed.xlsx`** — 카테고리/서브카테고리/재료/단위환산/레시피/재료매핑/조리단계 7시트를 한 파일로 패키징해 한 번에 INSERT. LLM 정제 결과 갱신 시 운영자가 새 엑셀로 갈아끼우는 통로.

- 업로드 전 dryRun 검증 가능
- 단일 트랜잭션 — 어느 시트든 치명 에러 시 전체 롤백
- 시트별 success/failed 카운트 + 행 번호 단위 에러 리포트

### 5. 의상 카탈로그 관리 (`outfits`)
- 6 슬롯(`head/top/bottom/shoes/leftHand/rightHand`)
- 가격(0이면 비매품) · 잠금 레벨(NULL이면 상점 전용) · is_default · is_active
- 모바일 옷장/상점에 즉시 반영

### 6. 유저 관리 — `SUPER_ADMIN` 전용
- 목록 (상태/로그인 타입/레벨 필터)
- 상세 — 프로필 + 탭 뷰(요리북 / 즐겨찾기 / 검색 이력)
- 계정 정지/활성화

### 7. 피드백 관리
- 목록 (상태 `PENDING` / `REVIEWED` / `RESOLVED`, 평점 필터)
- 상태 변경 + 관리자 메모

### 8. 통계 (4종)

| 페이지 | 내용 |
|--------|------|
| 유저 통계 | 가입 추이 · DAU/MAU · 로그인 방식 분포 · 리텐션 |
| 레시피 통계 | 카테고리별 · 난이도별 · 인기 TOP 20 |
| 재료 통계 | 인기 재료 TOP 20 · 미사용 재료 |
| 랭킹 통계 | 레벨 분포 · 평균 레벨 · 레벨업 추이 · 사진 업로드율 |

### 9. 관리자 계정 — `SUPER_ADMIN` 전용
관리자 CRUD + 역할 변경 + 잠금 해제.

---

## 권한 체계 (RBAC)

| 역할 | 접근 가능 | 쓰기 권한 |
|------|----------|-----------|
| **SUPER_ADMIN** | 전체 | 전체 (유저 관리 · 관리자 계정 포함) |
| **CONTENT_ADMIN** | 대시보드 · 레시피 · 재료 · 카테고리 · 의상 · 시드 · 피드백 · 통계 | 콘텐츠 쓰기 (유저/계정 제외) |
| **VIEWER** | 대시보드 · 통계 | 읽기 전용 |

Zustand `authStore`의 `hasRole()` / `canWrite()`로 클라이언트 권한 체크 + 서버에서 한 번 더 검증.

### 잠금 정책
- 로그인 5회 실패 → 15분 잠금
- `SUPER_ADMIN`이 `/api/admin/accounts/{id}/unlock`으로 즉시 해제 가능

---

## 라우팅 구조

```
/login                              로그인 (공개)
/                                   ProtectedRoute 래퍼
├── /dashboard                      대시보드
│
├── /recipes                        레시피 목록
│   ├── /recipes/new                생성
│   ├── /recipes/:id                상세
│   ├── /recipes/:id/edit           수정
│   └── /recipes/bulk-upload        엑셀 일괄
│
├── /ingredients                    재료 목록
│   ├── /ingredients/new            생성
│   ├── /ingredients/:id/edit       수정
│   ├── /ingredients/overview       전체 통계
│   ├── /ingredients/categories     대카테고리 관리
│   ├── /ingredients/subcategories  서브카테고리 관리
│   └── /ingredients/bulk-upload    엑셀 일괄
│
├── /seed                           시드 일괄 업로드 (picook_seed.xlsx)
│
├── /outfits                        의상 카탈로그
│   ├── /outfits/new                등록
│   └── /outfits/:id/edit           수정
│
├── /users                          유저 (SUPER_ADMIN)
│   └── /users/:id                  유저 상세
│
├── /feedback                       피드백
│   └── /feedback/:id               피드백 상세
│
├── /stats
│   ├── /stats/users                유저 통계
│   ├── /stats/recipes              레시피 통계
│   ├── /stats/ingredients          재료 통계
│   └── /stats/ranking              랭킹 통계
│
└── /accounts                       관리자 계정 (SUPER_ADMIN)
```

---

## 디렉토리 구조

```
admin/
├── src/
│   ├── pages/
│   │   ├── auth/Login.tsx
│   │   ├── dashboard/Dashboard.tsx
│   │   ├── recipes/        RecipeList · RecipeForm · RecipeDetail · RecipeBulkUpload
│   │   ├── ingredients/    IngredientList · IngredientForm · IngredientOverview
│   │   │                   IngredientBulkUpload · CategoryManage · SubcategoryManage
│   │   ├── seed/           SeedManagement
│   │   ├── outfits/        OutfitList · OutfitForm
│   │   ├── users/          UserList · UserDetail
│   │   ├── feedback/       FeedbackList · FeedbackDetail
│   │   ├── stats/          UserStats · RecipeStats · IngredientStats · RankingStats
│   │   └── accounts/       AdminAccountList
│   │
│   ├── api/                12개 API 클라이언트
│   │   ├── client.ts       Axios + JWT + 401 리다이렉트
│   │   ├── authApi · accountApi · dashboardApi
│   │   ├── recipeApi · ingredientApi · categoryApi · subcategoryApi
│   │   ├── outfitApi · seedApi
│   │   └── userApi · feedbackApi · statsApi
│   │
│   ├── components/
│   │   ├── layout/         AppLayout · Sidebar(역할별 메뉴) · Header
│   │   ├── common/         FormField · ExcelUpload · ImageUpload · ConfirmModal · StatusBadge
│   │   └── recipe/         RecipeStepEditor · IngredientMapper
│   │
│   ├── stores/
│   │   └── authStore.ts    JWT + 역할 (localStorage 영속화)
│   │
│   ├── schemas/            Zod 검증 스키마
│   ├── types/              TypeScript 타입
│   └── App.tsx             라우터 + ProtectedRoute
│
├── vite.config.ts          @/ 별칭 + /api 프록시 → localhost:8080
└── tsconfig.app.json
```

---

## 실행

```bash
cd admin
npm install
npm run dev
# → http://localhost:5173
# /api/* → http://localhost:8080 (Vite devServer 프록시)
```

빌드:

```bash
npm run build
# dist/ 정적 파일 생성
```

### 기본 로그인

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| admin@picook.com | `!@#admina` | SUPER_ADMIN |

> Flyway `V2__seed_admin_outfits.sql`로 자동 시드되는 계정. 운영 환경에선 즉시 비밀번호를 변경해야 합니다.

---

## 주요 구현

### JWT 인증 + 자동 로그아웃
Axios 인터셉터로 Bearer 토큰 자동 주입. 401 응답 시 localStorage 클리어 + `/login` 리다이렉트. `authStore.hasRole(...)`, `canWrite()`로 메뉴/액션 권한 체크.

### 엑셀 일괄 등록
SheetJS로 클라이언트에서 시트 미리보기 + 1차 검증 → 서버(Apache POI)에서 풀 검증 + 단일 트랜잭션 INSERT. 서버 응답에 시트별 success/failed/error[행번호] 포함 → 화면에 행 단위로 표시.

### 시드 관리 (전사 일괄 갱신)
LLM 정제 결과(`picook_seed.xlsx`)를 한 번에 갈아끼우는 운영 도구. 카테고리부터 레시피 단계까지 7시트를 FK 의존 순서로 처리. 백엔드 `SeedImportService`가 단일 트랜잭션으로 동작하므로, 잘못된 행 하나 때문에 부분 적용되는 일이 없음.

### 레시피 단계 에디터
React Hook Form `useFieldArray` 기반 동적 필드 — 단계 설명 · 이미지 URL · 팁(선택). 재료 매퍼는 자동완성 + 수량/단위 + 필수 여부 토글.

### 카테고리 드래그 정렬
Ant Design DnD로 카테고리 순서 변경 → 서버에 `sort_order` 일괄 업데이트.

# 백오피스 — React

## 기술 스택
- React 18+ / Vite 6.x / TypeScript
- Ant Design 5.x (테이블, 폼, 차트)
- @ant-design/charts (대시보드 차트)
- SheetJS xlsx (엑셀 파싱/다운로드)
- axios + @tanstack/react-query
- Zustand (상태)
- React Router 7.x

## 디렉토리
```
src/
├── pages/
│   ├── auth/
│   │   └── Login.tsx                      # 관리자 로그인
│   ├── dashboard/
│   │   └── Dashboard.tsx                  # 주요 지표 + 차트 + 랭킹
│   ├── recipes/
│   │   ├── RecipeList.tsx                 # 목록 (상태 뱃지)
│   │   ├── RecipeForm.tsx                 # 등록/수정
│   │   ├── RecipeDetail.tsx               # 상세 보기 (미리보기)
│   │   └── RecipeBulkUpload.tsx           # 엑셀 일괄등록
│   ├── ingredients/
│   │   ├── IngredientList.tsx             # 목록 (카테고리별, 사용 레시피 수)
│   │   ├── IngredientForm.tsx             # 등록/수정 (동의어 + 아이콘)
│   │   ├── IngredientBulkUpload.tsx       # 엑셀 일괄등록
│   │   └── CategoryManage.tsx             # 카테고리 CRUD + 드래그앤드롭 순서
│   ├── shorts/
│   │   ├── ShortsCacheList.tsx            # 캐시 목록 (모델 버전, 생성일)
│   │   ├── ShortsCacheDetail.tsx          # 변환 결과 미리보기
│   │   └── ShortsStats.tsx               # 쇼츠 통계 (히트율, 실패율 등)
│   ├── users/
│   │   ├── UserList.tsx                   # 사용자 목록 (등급, 상태)
│   │   └── UserDetail.tsx                 # 상세 (프로필+활동+완료+즐겨찾기)
│   ├── feedback/
│   │   ├── FeedbackList.tsx               # 목록 (상태별 필터)
│   │   └── FeedbackDetail.tsx             # 상세 (레시피+사용자+관리자 메모)
│   ├── stats/
│   │   ├── UserStats.tsx                  # 가입추이, DAU/MAU, 로그인방식
│   │   ├── RecipeStats.tsx                # 카테고리별, 인기 TOP
│   │   ├── IngredientStats.tsx            # 인기 재료, 미사용 재료
│   │   ├── ShortsStats.tsx                # 변환추이, 성공률
│   │   └── RankingStats.tsx               # 레벨 분포, 사진 업로드율
│   └── accounts/
│       └── AdminAccountList.tsx           # 관리자 계정 관리 (SUPER_ADMIN)
├── api/
│   ├── client.ts                          # axios 인스턴스 (JWT 자동 첨부)
│   ├── authApi.ts                         # 관리자 인증
│   ├── dashboardApi.ts                    # 대시보드
│   ├── recipeApi.ts                       # 레시피 CRUD + 일괄등록
│   ├── ingredientApi.ts                   # 재료 CRUD + 일괄등록
│   ├── categoryApi.ts                     # 카테고리
│   ├── shortsApi.ts                       # 쇼츠 캐시 관리
│   ├── userApi.ts                         # 사용자 관리
│   ├── feedbackApi.ts                     # 피드백
│   ├── statsApi.ts                        # 통계
│   └── accountApi.ts                      # 관리자 계정
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx                  # 사이드바 + 헤더 + 콘텐츠
│   │   ├── Sidebar.tsx                    # 메뉴 (역할별 표시 제어)
│   │   └── Header.tsx                     # 관리자 이름 + 로그아웃
│   ├── common/
│   │   ├── DataTable.tsx                  # 공통 테이블 (정렬, 필터, 페이지네이션)
│   │   ├── ExcelUpload.tsx                # 공통 엑셀 업로드 컴포넌트
│   │   ├── ImageUpload.tsx                # 이미지 업로드 (S3 프리사인 URL)
│   │   ├── StatusBadge.tsx                # 상태 뱃지 (draft/published/hidden)
│   │   ├── ConfirmModal.tsx               # 삭제/상태변경 확인
│   │   └── StatsCard.tsx                  # 대시보드 지표 카드
│   └── recipe/
│       ├── RecipeStepEditor.tsx            # 조리 순서 편집
│       └── IngredientMapper.tsx            # 재료 매핑 (자동완성 + 수량/단위)
├── hooks/
│   ├── useAuth.ts                         # 로그인 상태 관리
│   └── usePermission.ts                   # 역할 기반 접근 제어
├── stores/
│   └── authStore.ts                       # Zustand (관리자 세션)
├── types/
│   ├── recipe.ts
│   ├── ingredient.ts
│   ├── user.ts
│   ├── shorts.ts
│   ├── feedback.ts
│   ├── stats.ts
│   └── admin.ts
└── utils/
    ├── format.ts                          # 날짜, 숫자 포맷
    └── permission.ts                      # 역할별 메뉴/버튼 표시 헬퍼
```

## 사이드바 메뉴 구조
```
📊 대시보드
📋 레시피 관리
   ├─ 레시피 목록
   └─ 엑셀 일괄등록
🥬 재료 관리
   ├─ 재료 목록
   ├─ 카테고리 관리
   └─ 엑셀 일괄등록
🎬 쇼츠 관리
   ├─ 캐시 목록
   └─ 쇼츠 통계
👥 사용자 관리          (SUPER_ADMIN)
💬 피드백 관리
📈 통계
   ├─ 사용자 통계
   ├─ 레시피 통계
   ├─ 재료 통계
   ├─ 쇼츠 통계
   └─ 등급 통계
⚙️ 관리자 계정          (SUPER_ADMIN)
```

## 역할별 접근 제어 (프론트)
| 메뉴 | SUPER_ADMIN | CONTENT_ADMIN | VIEWER |
|------|------------|--------------|--------|
| 대시보드 | ✅ | ✅ | ✅ |
| 레시피 CRUD | ✅ | ✅ | 읽기만 |
| 재료 CRUD | ✅ | ✅ | 읽기만 |
| 카테고리 | ✅ | ✅ | 읽기만 |
| 쇼츠 캐시 | ✅ | ✅ | 읽기만 |
| 쇼츠 전체 초기화 | ✅ | ❌ | ❌ |
| 사용자 관리 | ✅ | ❌ | ❌ |
| 피드백 | ✅ | ✅ | 읽기만 |
| 통계 | ✅ | ✅ | ✅ |
| 관리자 계정 | ✅ | ❌ | ❌ |

## 레시피 등록 폼 핵심
- 기본: 요리명, 카테고리, 난이도, 시간(분), 인분, 대표이미지, 상태
- 재료 매핑: 검색(자동완성) + 수량 + 단위 + 필수/선택. [재료 추가] 버튼, 각 행 [삭제]
- 조리 순서: 번호 + 설명(텍스트에리어) + 이미지(선택)
- 순서 변경: 드래그앤드롭
- 저장: [임시저장(draft)] + [저장+공개(published)]

## 엑셀 일괄등록 흐름
1. [템플릿 다운로드] → SheetJS로 생성한 .xlsx 양식 (컬럼 설명 포함)
2. 사용자가 양식에 데이터 입력
3. [파일 업로드] → 서버 전송 (POST /bulk-upload)
4. 서버 검증 결과 수신: `{ total, success, failed, errors: [{ row, reason }] }`
5. 결과 화면: 정상 N건 초록, 오류 N건 빨강 + 오류 행별 사유 표시
6. [정상 건만 등록] 또는 [취소] 선택
7. 등록 시 전체 status: "draft"

## 대시보드 구성
```
┌──────────┬──────────┬──────────┬──────────┐
│ 총 사용자 │ 오늘 가입 │  DAU     │  MAU     │
│  1,234   │   15     │   89     │  456     │
└──────────┴──────────┴──────────┴──────────┘
┌──────────┬──────────┬──────────┬──────────┐
│ 총 레시피 │ 공개중   │ 쇼츠 변환 │  활성 유저│
│   500    │  420     │  234건   │   89     │
└──────────┴──────────┴──────────┴──────────┘

[차트: 일별 가입자/쇼츠 추이 — 기간 필터 7d/30d/90d]

┌─────────────────┬─────────────────┐
│ 인기 레시피 TOP10│ 인기 재료 TOP10  │
│ 1. 된장찌개 ...  │ 1. 계란 ...     │
│ 2. 김치볶음밥 ...│ 2. 양파 ...     │
└─────────────────┴─────────────────┘
┌─────────────────────────────────────┐
│ 최근 피드백 5건                      │
│ 🟢 맛있음 / ...                      │
└─────────────────────────────────────┘
┌────────────────────────────────────┐
│ 등급 분포: Lv1 ████ Lv2 ███ ...   │
└────────────────────────────────────┘
```

## 쇼츠 캐시 관리 화면
```
[검색: URL 키워드] [필터: 모델 버전] [전체 초기화 (SUPER_ADMIN)]

테이블:
| No | URL (썸네일) | 제목 | 모델 버전 | 단계 수 | 생성일 | 액션 |
|----|------------|------|---------|--------|-------|------|
| 1  | youtube... | 된장찌개 | gpt-4o-2025 | 8단계 | 03-12 | [보기] [재변환] [삭제] |

[보기] → 변환 결과 미리보기 (단계별 레시피 + 추출 재료)
[재변환] → 현재 AI 모델로 다시 변환
[삭제] → 캐시 삭제 (다음 사용자 요청 시 재변환됨)
```

## 사용자 상세 화면 (SUPER_ADMIN)
```
┌─ 기본 정보 ──────────────────────┐
│ 닉네임: 홍길동                     │
│ 이메일: hong@kakao.com            │
│ 로그인: 카카오 | 가입: 2026-03-01  │
│ 실력: 초급                         │
│ 등급: Lv.4 집밥 장인 🍳 (15/20)   │
│ 상태: 활성 | [정지] 버튼            │
└──────────────────────────────────┘

탭:
[요리 완료] — 날짜, 레시피명, 완성 사진 썸네일
[즐겨찾기] — 레시피 목록
[검색 기록] — 날짜, 선택 재료, 결과 수
```

## 피드백 관리 화면
```
[필터: 상태(전체/미확인/확인/처리)] [필터: 평가] [검색: 레시피명]

테이블:
| No | 레시피 | 사용자 | 평가 | 코멘트 | 상태 | 등록일 | 액션 |
|----|-------|-------|------|-------|------|-------|------|
| 1  | 된장찌개 | 홍길동 | 어려움 | "된장 양이..." | 미확인 | 03-12 | [상세] |

[상세] → 레시피 정보 + 사용자 정보 + 관리자 메모 입력 + 상태 변경
```
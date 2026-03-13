## 프롬프트 (복사해서 사용)

```
CLAUDE.md를 읽고 이 프로젝트의 전체 컨텍스트를 파악해줘.

이 프로젝트는 "Picook" — 냉장고 재료 기반 레시피 추천 + 음성 코칭 + 쇼츠 변환 iOS 앱이야.
모노레포, Spring Boot 4.0.3 백엔드, React Native 모바일, React 백오피스.
지금부터 프로젝트 초기 세팅을 처음부터 해줘.

### 1단계: 디렉토리 구조 생성
CLAUDE.md에 정의된 모노레포 구조대로 모든 디렉토리를 생성해.

### 2단계: CLAUDE.md 배치
루트의 *-CLAUDE.md 파일들을 각 디렉토리로 이동:
- backend-CLAUDE.md → backend/CLAUDE.md
- mobile-CLAUDE.md → mobile/CLAUDE.md
- admin-CLAUDE.md → admin/CLAUDE.md
- database-CLAUDE.md → database/CLAUDE.md

### 3단계: 백엔드 프로젝트 초기화 (Spring Boot 4.0.3)
backend/ 디렉토리에 Gradle 프로젝트 생성.

build.gradle.kts 작성:
- Spring Boot 4.0.3 + Java 21
- 의존성:
  - spring-boot-starter-web
  - spring-boot-starter-security
  - spring-boot-starter-data-jpa
  - spring-boot-starter-validation
  - postgresql
  - flyway-core, flyway-database-postgresql
  - io.jsonwebtoken:jjwt-api, jjwt-impl, jjwt-jackson (0.12.x)
  - org.projectlombok:lombok
  - software.amazon.awssdk:s3 (AWS SDK v2)
  - org.apache.poi:poi-ooxml (엑셀)
  - spring-boot-starter-test

settings.gradle.kts:
- rootProject.name = "picook-backend"

application.yml:
- spring.datasource: PostgreSQL 로컬 연결 (localhost:5432/picook_db)
- spring.jpa: hibernate ddl-auto=validate, show-sql=true
- spring.flyway: enabled=true
- jwt.secret, jwt.access-expiration, jwt.refresh-expiration
- cloud.aws.s3 설정 (플레이스홀더)
- openai.api-key (플레이스홀더)

application-local.yml: 로컬 개발용 오버라이드

docker-compose.yml:
- PostgreSQL 15 (picook_db / picook_user / picook_local_pw)
- 포트 5432, volume picook_pgdata

패키지 구조 생성 (com.picook):
  config/ (SecurityConfig, JwtProvider, JwtAuthenticationFilter, CorsConfig, S3Config)
  domain/auth/ (controller, service, dto)
  domain/user/ (controller, service, repository, entity, dto)
  domain/ingredient/ (controller, service, repository, entity, dto)
  domain/recipe/ (controller, service, repository, entity, dto)
  domain/coaching/ (controller, service, entity, dto)
  domain/shorts/ (controller, service, entity, dto)
  domain/favorite/ (controller, service, entity, dto)
  domain/file/ (controller, service)
  domain/admin/auth/ (controller, service, entity, dto)
  domain/admin/dashboard/ (controller, service, dto)
  domain/admin/recipe/ (controller, service, dto)
  domain/admin/ingredient/ (controller, service, dto)
  domain/admin/category/ (controller, service, dto)
  domain/admin/shorts/ (controller, service, dto)
  domain/admin/user/ (controller, service, dto)
  domain/admin/feedback/ (controller, service, dto)
  domain/admin/stats/ (controller, service, dto)
  domain/admin/account/ (controller, service, dto)
  global/response/ (ApiResponse)
  global/exception/ (GlobalExceptionHandler, BusinessException, ErrorCode)
  global/util/ (PageResponse)
각 패키지에 빈 클래스나 placeholder는 넣지 말고 디렉토리만 생성해.

PicookApplication.java 메인 클래스 생성.

### 4단계: Flyway 마이그레이션
backend/src/main/resources/db/migration/ 에 SQL 작성.

V1__init_schema.sql:
  backend/CLAUDE.md와 docs/05_백엔드_기술문서.md 참고하여 MVP 테이블 전체 생성.
  MVP 포함: users, ingredients, ingredient_categories, ingredient_synonyms,
  recipes, recipe_ingredients, recipe_steps,
  favorites, feedback, search_history,
  coaching_logs, cooking_completions,
  shorts_cache, admin_users, daily_stats.
  
  MVP 제외 (Phase 2): allergy 관련 테이블, cooking_tools 관련 테이블은 생성하지 마.

V2__seed_categories.sql:
  ingredient_categories에 9종 INSERT:
  채소, 과일, 육류, 해산물, 유제품/계란, 곡류/면, 양념/소스, 기타

V3__triggers.sql:
  - coaching_ready 자동 갱신 트리거 (recipe_steps 변경 시)
  - completed_cooking_count 자동 증가 트리거 (cooking_completions INSERT 시)

### 5단계: 모바일 프로젝트 초기화
mobile/ 디렉토리에서 Expo 프로젝트 생성.
```bash
cd mobile
npx create-expo-app@latest . --template expo-template-blank-typescript
```
package.json에 의존성 추가 (설치는 나중에):
- expo-router, expo-image, expo-speech, expo-keep-awake, expo-av
- expo-notifications, expo-task-manager, expo-image-picker, expo-clipboard
- @react-native-voice/voice, @react-native-seoul/kakao-login
- expo-apple-authentication, react-native-reanimated
- zustand, @shopify/flash-list, @tanstack/react-query, axios

mobile/CLAUDE.md에 정의된 디렉토리 구조대로 app/, src/ 하위 폴더 생성.

### 6단계: 백오피스 프로젝트 초기화
admin/ 디렉토리에서:
```bash
cd admin
npm create vite@latest . -- --template react-ts
```
package.json에 의존성 추가:
- antd, @ant-design/charts, axios, zustand
- @tanstack/react-query, react-router-dom, xlsx

admin/CLAUDE.md에 정의된 디렉토리 구조대로 src/ 하위 폴더 생성.

### 7단계: 데이터 정제 스크립트
database/scripts/ 에 이미 완성된 Python 스크립트와 프롬프트가 배치되어 있음.
      이 파일들은 건드리지 말고 존재 확인만 해.
      없으면 알려줘.
- 00_extract_ingredients.py — 원본에서 재료명 추출 → Claude로 카테고리 분류
- 01_fetch_recipes.py — 식품안전나라 API 전체 수집
- 02_refine_with_claude.py — Claude로 레시피 1차 정제
- 03_export_to_excel.py — 정제 결과 → 검수용 엑셀

database/scripts/prompts/ 에:
- ingredient_classify.txt — 재료 분류 프롬프트
- recipe_refine.txt — 레시피 정제 프롬프트
database/CLAUDE.md에 정의된 프롬프트 내용을 참고하여 작성.

### 8단계: 인프라 파일
infra/ 에:
- docker-compose.yml (전체 로컬 개발: PostgreSQL — backend/docker-compose.yml과 동일해도 됨)
- nginx/nginx.conf (리버스 프록시 기본 설정: / → React, /api → Spring Boot)
- scripts/deploy.sh (EC2 배포 셸 스크립트 템플릿)
- scripts/backup.sh (PostgreSQL 백업 스크립트 템플릿)

### 9단계: 공유 타입
shared/types/ 에 TypeScript 파일 생성:
- recipe.ts (Recipe, RecipeStep, RecipeIngredient 등)
- ingredient.ts (Ingredient, IngredientCategory, IngredientSynonym)
- user.ts (User, UserProfile, UserRanking)
- coaching.ts (CoachingState, TimelineItem, StepType)
- shorts.ts (ShortsConvertRequest, ShortsResult)
- ranking.ts (Level, LEVELS 배열)
- api.ts (ApiResponse, PageResponse, ErrorResponse)

docs/05_백엔드_기술문서.md의 DB 스키마와 mobile/CLAUDE.md의 타입 정의를 참고.

### 10단계: Git 설정
.gitignore:
- Java: build/, .gradle/, *.class, *.jar
- Node: node_modules/, .expo/, dist/
- IDE: .idea/, .vscode/, *.iml
- 환경: .env, .env.local, application-local.yml
- Docker: pgdata/
- OS: .DS_Store, Thumbs.db

README.md:
- 프로젝트 소개 (Picook 한 줄 설명)
- 기술 스택 요약
- 모노레포 구조 설명
- 로컬 개발 환경 셋업 가이드:
  1. Docker PostgreSQL 실행
  2. Spring Boot 실행
  3. Expo 모바일 실행
  4. Vite 백오피스 실행

### 11단계: GitHub Actions CI/CD
.github/workflows/ 에 3개 워크플로우:

backend.yml:
- on: push paths 'backend/**'
- Gradle 빌드 + 테스트

mobile.yml:
- on: push paths 'mobile/**'
- npm ci + tsc + jest

admin.yml:
- on: push paths 'admin/**'
- npm ci + vite build

각 워크플로우는 해당 디렉토리 변경 시에만 실행 (paths 필터).

모든 단계를 순서대로 실행해줘. 각 단계 완료 후 간단히 알려줘.
```

---

## 초기 세팅 완료 후 다음 단계 프롬프트

### 첫 번째: 백엔드 인증 개발
```
backend/CLAUDE.md를 읽어.

인증 도메인(domain/auth)부터 개발을 시작하자.

1. User 엔티티 (docs/05 참고)
2. JwtProvider (토큰 생성/검증, 액세스 1h, 리프레시 30d)
3. JwtAuthenticationFilter (요청마다 토큰 검증)
4. SecurityConfig (URL 패턴별 접근 제어 — backend/CLAUDE.md의 Security 설정 참고)
5. 토큰 갱신 API (POST /api/auth/refresh)
6. 카카오 로그인 API (POST /api/auth/kakao — kapi.kakao.com 검증)
7. 관리자 로그인 API (POST /api/admin/auth/login — 5회 실패 잠금)
8. 각 단계마다 테스트 코드도 함께

순서대로 진행해줘.
```

### 두 번째: 재료/카테고리 CRUD
```
재료 도메인을 개발하자.

1. Ingredient, IngredientCategory, IngredientSynonym 엔티티
2. 사용자 API: GET /api/v1/ingredients (전체 목록, 카테고리+동의어 포함)
3. 사용자 API: GET /api/v1/ingredients/categories
4. 관리자 API: 재료 CRUD (POST/PUT/DELETE /api/admin/ingredients)
5. 관리자 API: 카테고리 CRUD + 순서변경 (PUT /api/admin/categories/reorder)
6. 관리자 API: 재료 엑셀 일괄등록 (POST /api/admin/ingredients/bulk-upload)
7. 관리자 API: 엑셀 템플릿 다운로드 (GET /api/admin/ingredients/bulk-template)

backend/CLAUDE.md의 API 명세를 참고해서 작성해줘.
```

### 세 번째: 레시피 + 추천
```
레시피 도메인을 개발하자.

1. Recipe, RecipeIngredient, RecipeStep 엔티티
2. RecommendService: 매칭률 계산 + TOP 10 반환
   - 매칭률 = 보유필수재료 교집합 / 전체필수재료
   - 시간/난이도/인분 필터
   - 매칭률 30%+ 만 반환
   - 매칭률 DESC 정렬, TOP 10
   - 부족 재료 목록 포함
3. 사용자 API: POST /api/v1/recipes/recommend
4. 사용자 API: GET /api/v1/recipes/{id} (상세)
5. 관리자 API: 레시피 CRUD + 상태변경
6. 관리자 API: 엑셀 일괄등록
7. RecommendService 단위 테스트 (다양한 매칭 시나리오)

```

### 즐겨찾기 + 검색기록 + 파일업로드
즐겨찾기, 검색기록, 파일업로드 도메인을 개발하자.

1. Favorite 엔티티 + FavoriteRepository
2. 사용자 API: GET /api/v1/favorites (내 즐겨찾기 목록)
3. 사용자 API: POST /api/v1/favorites (추가, 중복 방지)
4. 사용자 API: DELETE /api/v1/favorites/{id} (삭제)
5. 무료 사용자 20개 제한 로직

6. SearchHistory 엔티티 + Repository
7. 사용자 API: GET /api/v1/search-history (내 검색 기록)
8. 사용자 API: DELETE /api/v1/search-history/{id} (개별 삭제)
9. 사용자 API: DELETE /api/v1/search-history (전체 삭제)
10. 추천 API 호출 시 자동 저장 로직

11. S3Config 설정 (AWS SDK v2)
12. S3FileService (업로드, 프리사인 URL 생성, 삭제)
13. FileController: POST /api/v1/files/upload (이미지 업로드 → S3 URL 반환)
14. 파일 크기 제한 (10MB), 허용 타입 (JPG/PNG/HEIC/WebP)

각 단계마다 테스트 코드 포함.


### 코칭과 등급 도메인을 개발하자.

1. CoachingLog 엔티티 (mode: single/multi, recipe_ids, estimated/actual seconds, completed)
2. CookingCompletion 엔티티 (user_id, recipe_id, coaching_log_id, photo_url)
3. completed_cooking_count 트리거는 DB에 이미 있으므로 JPA에서 확인만

4. 사용자 API: POST /api/v1/coaching/start → 코칭 시작 로그 생성
5. 사용자 API: PATCH /api/v1/coaching/{id}/complete → 완료 (actual_seconds 기록)
6. 사용자 API: POST /api/v1/coaching/{id}/photo → 완성 사진 업로드 (S3) → CookingCompletion 생성 → 등급 +1

7. UserService에 등급 조회 로직:
   - completedCookingCount로 현재 레벨/칭호 계산
   - GET /api/v1/users/me 응답에 level, title, emoji, nextLevelAt 포함

8. 등급 체계:
   Lv.1(0~2), Lv.2(3~5), Lv.3(6~10), Lv.4(11~20), Lv.5(21~35), Lv.6(36~50), Lv.7(51+)

테스트: 코칭 시작→완료→사진→등급 증가 전체 흐름 테스트.

### 쇼츠 변환 도메인을 개발하자.

1. ShortsCache 엔티티 (youtube_url, url_hash, ai_model_version, title, thumbnail_url, result JSONB)
2. ShortsCacheService (캐시 조회/저장/삭제)

3. ShortsConvertService 구현:
   a. url_hash(SHA-256) 생성
   b. shorts_cache에서 hash + 현재 ai_model_version 조회
   c. 캐시 히트 → 즉시 반환
   d. 캐시 미스:
      - yt-dlp로 음성 추출 (ProcessBuilder로 외부 명령 실행)
      - Whisper API 호출 (RestClient/WebClient) → STT
      - GPT-4o 호출 → 단계별 레시피 JSON 구조화
      - 결과를 shorts_cache에 저장

4. AI 모델 교체 대비 인터페이스 추상화:
   - RecipeStructurizer 인터페이스
   - OpenAiStructurizer 구현체
   - application.yml에서 모델 버전 관리

5. 사용자 API: POST /api/v1/shorts/convert (URL → 변환 결과)
6. 사용자 API: GET /api/v1/shorts/recent (내 최근 변환 목록)

7. 변환 실패 처리 (음성 없는 영상, 요리 아닌 영상 등)

테스트: 캐시 히트/미스 로직, URL 해시 생성. 
yt-dlp/Whisper/GPT 실제 호출은 Mock으로 처리.

### 관리자 나머지 API
관리자 나머지 API를 전부 개발하자. backend/CLAUDE.md의 API 명세 참고.

1. 대시보드 API:
   - GET /api/admin/dashboard/summary (주요 지표)
   - GET /api/admin/dashboard/charts (차트 데이터, period 파라미터)
   - GET /api/admin/dashboard/rankings (인기 레시피/재료/코칭 TOP)

2. 쇼츠 캐시 관리 API:
   - GET /api/admin/shorts/cache (목록, 페이지네이션)
   - GET /api/admin/shorts/cache/{id} (상세)
   - DELETE /api/admin/shorts/cache/{id} (개별 삭제)
   - DELETE /api/admin/shorts/cache/clear-all (전체 초기화, SUPER_ADMIN)
   - POST /api/admin/shorts/cache/{id}/reconvert (수동 재변환)
   - GET /api/admin/shorts/stats (쇼츠 통계)

3. 사용자 관리 API (SUPER_ADMIN):
   - GET /api/admin/users (목록, 필터)
   - GET /api/admin/users/{id} (상세 + 등급 + 활동)
   - PATCH /api/admin/users/{id}/suspend (정지)
   - PATCH /api/admin/users/{id}/activate (해제)
   - GET /api/admin/users/{id}/coaching-logs
   - GET /api/admin/users/{id}/completions
   - GET /api/admin/users/{id}/favorites

4. 피드백 관리 API:
   - GET /api/admin/feedback (목록)
   - GET /api/admin/feedback/{id} (상세)
   - PATCH /api/admin/feedback/{id}/status (상태 변경)
   - PUT /api/admin/feedback/{id}/note (메모)
   - GET /api/admin/feedback/summary (요약 통계)

5. 통계 API:
   - GET /api/admin/stats/users
   - GET /api/admin/stats/recipes
   - GET /api/admin/stats/ingredients
   - GET /api/admin/stats/coaching
   - GET /api/admin/stats/shorts
   - GET /api/admin/stats/ranking

6. 관리자 계정 관리 (SUPER_ADMIN):
   - GET /api/admin/accounts
   - POST /api/admin/accounts
   - PUT /api/admin/accounts/{id}
   - DELETE /api/admin/accounts/{id}
   - PATCH /api/admin/accounts/{id}/unlock
   

### 네 번째: 백오피스 웹
```
admin/CLAUDE.md를 읽어.

백오피스 웹을 개발하자. 순서:
1. 공통: AppLayout (사이드바+헤더+콘텐츠), 라우팅 설정, axios 클라이언트 (JWT 자동 첨부)
2. 관리자 로그인 화면
3. 대시보드 (API 연동, 지표 카드 + 차트 + 랭킹)
4. 재료 관리: 목록 + 등록/수정 폼 + 카테고리 관리 (드래그앤드롭 순서)
5. 재료 엑셀 일괄등록 (템플릿 다운로드 + 업로드 + 검증 결과)
6. 레시피 관리: 목록 (코칭준비 표시) + 등록/수정 폼 (active/wait + duration 입력)
7. 레시피 엑셀 일괄등록
8. 쇼츠 캐시 관리: 목록 + 상세 미리보기 + 재변환 + 삭제
9. 사용자 관리: 목록 + 상세 (등급/코칭이력/완료이력 탭)
10. 피드백 관리: 목록 + 상세 (상태변경 + 메모)
11. 통계 페이지 6개 (사용자/레시피/재료/코칭/쇼츠/등급)
12. 관리자 계정 관리

admin/CLAUDE.md의 화면 구성, 사이드바 메뉴, 역할별 접근 제어를 참고해줘.
이 백오피스가 완성되어야 데이터 입력을 시작할 수 있으니 중요해.
```

### 모바일 - 인증 + 온보딩
mobile/CLAUDE.md를 읽어.

모바일 앱 개발을 시작하자. 인증과 온보딩부터.

1. axios 클라이언트 설정 (src/api/client.ts)
   - baseURL: __DEV__ ? localhost:8080 : api.picook.com
   - JWT 자동 첨부 인터셉터
   - 401 시 토큰 갱신 → 실패 시 로그인으로

2. authStore (Zustand + expo-secure-store)
   - accessToken, refreshToken, user 정보 저장
   - login, logout, refreshToken 액션

3. 스플래시 → 토큰 확인 → 홈 또는 온보딩 분기

4. 온보딩 화면 (3페이지 스와이프)
   - 페이지1: 재료 추천 / 페이지2: 음성 코칭 / 페이지3: 쇼츠 변환

5. 로그인 화면
   - [카카오로 로그인] — @react-native-seoul/kakao-login
   - [Apple로 로그인] — expo-apple-authentication
   - 토큰 받아서 서버 /api/auth/kakao 또는 /api/auth/apple 호출

6. 기본 정보 입력 (2단계)
   - 스텝1: 요리 실력 (카드형)
   - 스텝2: 코칭 설정 (on/off + 음성 속도)
   - PUT /api/v1/users/me로 저장

7. 하단 탭바 레이아웃 (4탭: 홈/쇼츠/즐겨찾기/마이)

### 재료선택 + 추천 + 상세
재료 선택부터 레시피 상세까지 개발하자.

1. 재료 데이터 로드
   - 앱 시작 시 GET /api/v1/ingredients → 전체 로드 + 캐싱
   - GET /api/v1/ingredients/categories

2. 재료 선택 화면 (home/select.tsx)
   - 카테고리 가로탭
   - 그리드 2열 (아이콘+이름)
   - 검색: 초성 + 동의어 (로컬, src/utils/search.ts)
   - 하단: 선택된 재료 칩 + [다음]

3. selectionStore (Zustand): 선택 재료 관리 (최대 30개)

4. 추천 전 확인 화면 (home/confirm.tsx)
   - 선택 재료 칩 (삭제/추가)
   - 필터: 시간/난이도/인분
   - [추천받기] → POST /api/v1/recipes/recommend

5. 추천 결과 화면 (home/results.tsx)
   - TOP 10 카드 리스트 (매칭률+시간+난이도+부족재료)
   - [일반]/[멀티 코칭] 토글
   - 멀티 시 체크박스 (최대 2개)

6. 레시피 상세 화면 (recipe/[id].tsx)
   - GET /api/v1/recipes/{id}
   - 이미지, 기본정보, 재료(보유/미보유), 조리순서(active/wait 아이콘), 팁
   - [코칭 모드로 시작] + [즐겨찾기]
   
### 즐겨찾기  +마이페이지 
즐겨찾기와 마이페이지를 개발하자.

1. 즐겨찾기 탭 (favorites/index.tsx)
   - GET /api/v1/favorites
   - 레시피 카드 리스트 (정렬: 최신/이름)
   - 스와이프 삭제
   - 빈 상태 UI

2. 즐겨찾기 추가/삭제
   - 레시피 상세의 하트 버튼
   - POST/DELETE /api/v1/favorites
   - 낙관적 업데이트
   - 무료 20개 제한 안내

3. 마이페이지 (mypage/index.tsx)
   - 프로필: 이미지 + 닉네임 + 등급 뱃지 + 칭호
   - 등급 영역: 레벨 + 진행률 바 + 총 완료 수
   - 메뉴 리스트

4. 프로필 수정 (mypage/profile.tsx)
5. 코칭 설정 (mypage/coaching-settings.tsx)
6. 앱 설정 (mypage/settings.tsx)
7. 회원 탈퇴 (mypage/delete-account.tsx)

8. RankBadge 컴포넌트 (홈 + 마이페이지에서 사용)
9. ProgressBar 컴포넌트 (다음 레벨까지)


### 싱글코칭
싱글 코칭 모드를 개발하자. mobile/CLAUDE.md의 코칭 핵심 규칙 참고.

1. CoachingEngine (src/engines/CoachingEngine.ts)
   - 상태 머신: 현재 단계, 경과시간, 예상총시간, 일시정지
   - start(), next(), repeat(), pause(), resume(), stop()
   - 능동 단계: 사용자 확인 후에만 진행
   - 대기 단계: 타이머 자동 → 완료 알림 → 사용자 확인
   - 딜레이 시 예상 완료 시간 조용히 재계산

2. TTSService (src/services/TTSService.ts)
   - expo-speech 래핑
   - speak(text), stop(), setRate()

3. STTService (src/services/STTService.ts)
   - @react-native-voice/voice 래핑
   - "다음" → next, "반복" → repeat
   - TTS 출력 중 인식 중지

4. TimerManager (src/engines/TimerManager.ts)
   - 카운트다운 타이머
   - 백그라운드 동작 (expo-task-manager)
   - 완료 시 로컬 푸시 (expo-notifications)

5. 싱글 코칭 화면 (cooking/single/[id].tsx)
   - 전체화면 (탭바 숨김)
   - 화면잠금 방지 (expo-keep-awake)
   - 상단: 요리명 + 현재/전체 단계
   - 중앙: 현재 단계 설명 (큰 텍스트) + 이미지
   - 타이머: 대기→원형 카운트다운 / 능동→경과시간
   - 하단: 진행 바
   - 화면 탭: 능동→다음, 대기중→무시
   - 컨트롤: 일시정지, 닫기

6. 완료 화면 (cooking/complete.tsx)
   - "수고하셨어요! 🎉"
   - 예상 vs 실제 시간
   - [완성 사진 찍기] → POST /api/v1/coaching/{id}/photo
   - 등급 +1 → 레벨업 시 LevelUpAnimation
   - [사진 없이 완료]

7. POST /api/v1/coaching/start, PATCH complete 연동

### 멀티코칭
멀티 코칭 모드를 개발하자.

1. TimelineEngine (src/engines/TimelineEngine.ts)
   - 2개 레시피 단계 통합
   - primary(오래 걸리는 요리)의 wait(canParallel) 구간에 secondary의 active 배치
   - active 단계 미중복
   - 동시 완성 목표 역산

2. 타임라인 미리보기 화면 (cooking/multi-preview.tsx)
   - 2개 요리명 + 예상 총 시간
   - 세로 타임라인 (요리A 파랑 / 요리B 주황)
   - active/wait 아이콘
   - [코칭 시작] + [레시피 변경]

3. 멀티 코칭 화면 (cooking/multi-cooking.tsx)
   - CoachingEngine 확장 (멀티 모드)
   - 미니 상태바: 다른 요리 현재 상태
   - 요리 전환 멘트 TTS
   - 딜레이: 예상 완료만 조용히 업데이트, 재촉 없음
   - 대기 완료인데 능동 중이면 알림 후 작업 끝나면 전환

4. 멀티 완료 → cooking/complete.tsx 재사용 (2개 요리 표시)

### 쇼츠변환
쇼츠 변환 탭을 개발하자.

1. 쇼츠 URL 입력 화면 (shorts/index.tsx)
   - URL 텍스트 입력 + [붙여넣기] (expo-clipboard) + [변환하기]
   - URL 검증 (youtube.com/shorts/, youtu.be/)
   - 최근 변환 목록 (GET /api/v1/shorts/recent)

2. useShortsConvert 훅 (useMutation)
   - POST /api/v1/shorts/convert
   - 로딩 상태 관리 (10~30초 프로그레스)

3. 변환 결과 화면 (shorts/result.tsx)
   - 썸네일 + 제목 + 원본 링크
   - 단계별 레시피 (번호 + 설명 + 예상 시간)
   - AI 추출 재료 목록
   - [코칭 모드로 시작] → 싱글 코칭으로 연결
   - [즐겨찾기 저장] → POST /api/v1/favorites

4. 변환 실패 처리: "이 영상은 변환이 어려워요" + [다시 시도]
5. 캐싱: 같은 URL 재요청 시 즉시 결과 표시

### 통합테스트
전체 통합 점검.

1. 백엔드: 전체 API 동작 확인 (./gradlew test)
2. 백오피스: 레시피/재료 등록 → DB 확인
3. 모바일: 재료 선택 → 추천 → 상세 → 코칭 → 사진 → 등급 전체 흐름
4. 쇼츠: URL 입력 → 변환 → 코칭 연결
5. 에러 처리: 네트워크 끊김, 토큰 만료, 빈 결과
6. UI 폴리싱: 로딩 스켈레톤, 빈 상태, 토스트 메시지

---

## 주의사항
1. Spring Boot 프로젝트는 `spring init` CLI 대신 build.gradle.kts 직접 작성이 더 확실함
2. Expo 프로젝트 생성 시 네트워크 필요 (`npx create-expo-app`)
3. Flyway 마이그레이션은 한 번 적용되면 수정 불가 → V1은 신중히
4. MVP에서 allergy, cooking_tools 관련 테이블/코드는 생성하지 말 것
5. 데이터 정제 스크립트는 Claude API 키가 필요 (환경변수: ANTHROPIC_API_KEY)
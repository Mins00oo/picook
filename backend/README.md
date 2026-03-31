# Picook Backend

> Spring Boot 4.0.3 + Java 21 기반 REST API 서버

## 소개

Picook의 모든 비즈니스 로직을 처리하는 모놀리식 백엔드 서버입니다. 사용자 앱과 백오피스의 API를 단일 서버에서 제공하며, 쇼츠 변환 파이프라인(yt-dlp + Whisper + GPT), 재료 기반 추천 엔진, 음성 코칭 로그 관리 등 핵심 기능을 담당합니다.

---

## 기술 스택

| 분류 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Spring Boot 4.0.3 | Java 21 LTS |
| 빌드 | Gradle (Kotlin DSL) | |
| 데이터베이스 | PostgreSQL 15 | Docker 컨테이너 |
| ORM | Spring Data JPA + Hibernate | Fetch Join, @BatchSize 최적화 |
| 마이그레이션 | Flyway | 13개 버전 |
| 인증 | Spring Security + JWT | 액세스 1h, 리프레시 30d |
| API 문서 | SpringDoc OpenAPI 3.0 | Swagger UI |
| 캐싱 | Spring Cache | ConcurrentMapCacheManager |
| 엑셀 | Apache POI | 일괄 등록/템플릿 다운로드 |
| AI/외부 | WebFlux WebClient | Whisper API, GPT API |
| 음성 추출 | yt-dlp + ffmpeg | 쇼츠 오디오 추출 |
| 로깅 | Logback + Logstash Encoder | 구조화 JSON 로깅 |
| 메트릭 | Micrometer + Prometheus | 비즈니스 메트릭 |
| 테스트 | JUnit 5 + Mockito | 24개 테스트 파일 |

---

## 패키지 구조

```
src/main/java/com/picook/
├── config/                        ← 설정 (13개)
│   ├── SecurityConfig             ← Spring Security + JWT 필터 체인
│   ├── JwtProvider                ← JWT 토큰 생성/검증
│   ├── JwtAuthenticationFilter    ← 요청별 JWT 인증
│   ├── CorsConfig                 ← CORS 허용 설정
│   ├── WebConfig                  ← Web MVC 설정
│   ├── CacheConfig                ← Spring Cache 설정
│   ├── RateLimitFilter            ← 요청 빈도 제한
│   ├── ClientIpResolver           ← 프록시 뒤 실제 IP 추출
│   ├── MonitoringIpFilter         ← 모니터링 IP 필터
│   ├── RequestLoggingFilter       ← HTTP 요청/응답 로깅 + MDC
│   ├── PicookMetricsConfig        ← Prometheus 커스텀 메트릭
│   └── SwaggerConfig              ← OpenAPI/Swagger 설정
│
├── domain/
│   ├── auth/                      ← 인증 (Apple, 카카오, JWT)
│   │   ├── controller/AuthController
│   │   ├── service/AuthService, KakaoAuthService, AppleAuthService
│   │   └── dto/AuthResponse, KakaoLoginRequest, AppleLoginRequest, TokenRefreshRequest
│   │
│   ├── user/                      ← 사용자 (프로필, 등급)
│   │   ├── controller/UserController
│   │   ├── service/UserService
│   │   ├── entity/User, UserRank, CookingLevel, LoginType, UserStatus
│   │   ├── repository/UserRepository
│   │   └── dto/UserProfileResponse, UpdateProfileRequest, RankInfo
│   │
│   ├── ingredient/                ← 재료 (카테고리, 동의어)
│   │   ├── controller/IngredientController
│   │   ├── service/IngredientService
│   │   ├── entity/Ingredient, IngredientCategory, IngredientSynonym
│   │   ├── repository/IngredientRepository, IngredientCategoryRepository, IngredientSynonymRepository
│   │   └── dto/IngredientResponse, CategoryResponse
│   │
│   ├── recipe/                    ← 레시피 (CRUD, 추천)
│   │   ├── controller/RecipeController
│   │   ├── service/RecipeService, RecommendService
│   │   ├── entity/Recipe, RecipeIngredient, RecipeStep, RecipeCategory, Difficulty, StepType
│   │   ├── repository/RecipeRepository, RecipeIngredientRepository, RecipeStepRepository
│   │   └── dto/RecipeDetailResponse, RecommendRequest, RecommendResponse
│   │
│   ├── coaching/                  ← 코칭 (로그, 완료, 사진)
│   │   ├── controller/CoachingController, CookingHistoryController
│   │   ├── service/CoachingService, CookingHistoryService
│   │   ├── entity/CoachingLog, CookingCompletion, CoachingPhoto
│   │   ├── repository/CoachingLogRepository, CookingCompletionRepository, CoachingPhotoRepository
│   │   └── dto/StartCoachingRequest, CompleteCoachingRequest, CoachingLogResponse, ...
│   │
│   ├── shorts/                    ← 쇼츠 변환 (8개 서비스)
│   │   ├── controller/ShortsController
│   │   ├── service/
│   │   │   ├── ShortsConvertService    ← 변환 오케스트레이션
│   │   │   ├── ShortsCacheService      ← 캐시 관리 (url_hash + ai_model_version)
│   │   │   ├── ShortsFavoriteService   ← 쇼츠 즐겨찾기
│   │   │   ├── YtDlpService            ← yt-dlp 음성 추출
│   │   │   ├── WhisperService          ← OpenAI Whisper STT
│   │   │   ├── OpenAiStructurizer      ← GPT 레시피 구조화
│   │   │   ├── RecipeStructurizer      ← 결과 후처리
│   │   │   └── ShortsRateLimiter       ← 변환 빈도 제한
│   │   ├── entity/ShortsCache, ShortsConversionHistory, ShortsConversionLog, ShortsFavorite
│   │   └── dto/ShortsConvertRequest, ShortsConvertResponse, ...
│   │
│   ├── favorite/                  ← 즐겨찾기
│   ├── file/                      ← 파일 업로드 (로컬 저장소)
│   ├── searchhistory/             ← 검색 이력
│   ├── feedback/                  ← 피드백 (엔티티만, API는 admin)
│   ├── monitoring/                ← 운영 모니터링 (DAU/MAU/쇼츠 현황)
│   │
│   └── admin/                     ← 백오피스 API (10개 서브도메인)
│       ├── auth/                  ← 관리자 인증 (5 endpoints)
│       ├── dashboard/             ← 대시보드 (3 endpoints)
│       ├── recipe/                ← 레시피 관리 + 엑셀 벌크 (8 endpoints)
│       ├── ingredient/            ← 재료 관리 + 엑셀 벌크 (7 endpoints)
│       ├── category/              ← 카테고리 관리 (5 endpoints)
│       ├── user/                  ← 유저 관리 (8 endpoints, SUPER_ADMIN)
│       ├── feedback/              ← 피드백 관리 (5 endpoints)
│       ├── shorts/                ← 쇼츠 캐시 관리 (6 endpoints)
│       ├── stats/                 ← 통계 6종 (6 endpoints)
│       └── account/               ← 관리자 계정 (5 endpoints, SUPER_ADMIN)
│
└── global/                        ← 공통
    ├── ApiResponse                ← 표준 응답 래퍼
    ├── PageResponse               ← 페이지네이션 응답
    ├── GlobalExceptionHandler     ← 중앙 예외 처리
    ├── BusinessException          ← 커스텀 비즈니스 예외
    └── PerformanceLoggingAspect   ← AOP 성능 로깅
```

---

## 실행 방법

### 1. 데이터베이스

```bash
docker compose up -d
# PostgreSQL 15 → localhost:5432
# DB: picook_db, User: picook_user, Password: picook_local_pw
```

### 2. 백엔드 서버

```bash
./gradlew bootRun --args='--spring.profiles.active=local'
# API → http://localhost:8080
# Swagger UI → http://localhost:8080/swagger-ui.html
```

### 3. 테스트

```bash
./gradlew test
```

### 환경 프로필

| 프로필 | 용도 | DB | 특징 |
|--------|------|----|----|
| `local` | 로컬 개발 | localhost:5432 | 디버그 로깅, Swagger 활성화 |
| `prod` | 운영 | Docker 내부 | 구조화 JSON 로깅, 메트릭 활성화 |

### 주요 환경변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `DB_HOST` | PostgreSQL 호스트 | local 프로필은 기본값 있음 |
| `DB_PORT` | PostgreSQL 포트 | local 프로필은 기본값 있음 |
| `JWT_SECRET` | JWT 서명 키 (32바이트 이상) | local 프로필은 기본값 있음 |
| `OPENAI_API_KEY` | Whisper + GPT API 키 | 쇼츠 변환 사용 시 필수 |
| `FILE_UPLOAD_DIR` | 파일 업로드 디렉토리 | 기본: /data/picook/uploads |

---

## 인증/인가 흐름

### 사용자 인증 (JWT)

```
[Apple/카카오 로그인]
    │
    ▼
클라이언트: identityToken / kakaoAccessToken 전송
    │
    ▼
서버: Apple 공개키 검증 or 카카오 API (/v2/user/me) 검증
    │
    ▼
서버: User 조회 or 생성 → JWT 발급 (access 1h + refresh 30d)
    │
    ▼
클라이언트: Bearer 토큰으로 API 호출
    │
    ▼
401 발생 시: /api/auth/refresh → 새 토큰 발급
```

### 관리자 인증

- 이메일/비밀번호 로그인 (bcrypt)
- 3등급 역할: `SUPER_ADMIN` > `CONTENT_ADMIN` > `VIEWER`
- 로그인 실패 5회 → 15분 잠금
- 액세스 토큰 1h, 리프레시 8h

---

## API 엔드포인트 전체 목록

### Auth API — 공개 (4개)

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/kakao` | 카카오 소셜 로그인 |
| POST | `/api/auth/apple` | Apple 소셜 로그인 |
| POST | `/api/auth/refresh` | JWT 토큰 갱신 |
| POST | `/api/auth/logout` | 로그아웃 |

### User API — 인증 필요 (31개)

#### 사용자 (`/api/v1/users`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/users/me` | 내 프로필 조회 |
| PUT | `/api/v1/users/me` | 프로필 수정 (닉네임, 요리 레벨, 코칭 설정) |
| DELETE | `/api/v1/users/me` | 회원 탈퇴 (30일 유예) |

#### 재료 (`/api/v1/ingredients`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/ingredients` | 전체 재료 목록 (카테고리 + 동의어 포함, 캐시) |
| GET | `/api/v1/ingredients/categories` | 카테고리 목록 |

#### 레시피 (`/api/v1/recipes`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/recipes/recommend` | 재료 기반 추천 (매칭률 TOP 10) |
| GET | `/api/v1/recipes/{id}` | 레시피 상세 (재료 + 조리 단계) |

#### 즐겨찾기 (`/api/v1/favorites`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/favorites` | 즐겨찾기 목록 |
| POST | `/api/v1/favorites` | 즐겨찾기 추가 |
| DELETE | `/api/v1/favorites/{id}` | 즐겨찾기 삭제 |

#### 코칭 (`/api/v1/coaching`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/coaching/start` | 코칭 세션 시작 (싱글/멀티) |
| PATCH | `/api/v1/coaching/{id}/complete` | 코칭 완료 (실제 소요시간 기록) |
| POST | `/api/v1/coaching/{id}/photos` | 완성 사진 업로드 (최대 5장, multipart) |
| POST | `/api/v1/coaching/{id}/photo` | 단일 사진 업로드 (레거시) |
| DELETE | `/api/v1/coaching/photos/{photoId}` | 사진 삭제 |

#### 조리 이력 (`/api/v1/cooking`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/cooking/history` | 조리 이력 (페이지네이션) |
| GET | `/api/v1/cooking/history/{id}` | 이력 상세 (사진 포함) |
| GET | `/api/v1/cooking/stats` | 조리 통계 |

#### 쇼츠 (`/api/v1/shorts`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/shorts/convert` | 유튜브 쇼츠 URL → 레시피 변환 |
| GET | `/api/v1/shorts/recent` | 최근 변환 목록 (URL 중복 제거, 최대 20) |
| GET | `/api/v1/shorts/{cacheId}` | 변환 결과 상세 |
| DELETE | `/api/v1/shorts/history/{id}` | 변환 이력 삭제 |
| DELETE | `/api/v1/shorts/history` | 전체 이력 삭제 |
| GET | `/api/v1/shorts/favorites` | 쇼츠 즐겨찾기 목록 |
| POST | `/api/v1/shorts/favorites` | 쇼츠 즐겨찾기 추가 |
| DELETE | `/api/v1/shorts/favorites/{id}` | 쇼츠 즐겨찾기 삭제 |

#### 검색 이력 (`/api/v1/search-history`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/search-history` | 검색 이력 |
| DELETE | `/api/v1/search-history/{id}` | 이력 삭제 |
| DELETE | `/api/v1/search-history` | 전체 이력 삭제 |

#### 파일 (`/api/v1/files`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/files/upload` | 이미지 업로드 (카테고리 화이트리스트) |

### Admin API — 역할 기반 (56개)

#### 관리자 인증 (`/api/admin/auth`) — 5개
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| POST | `/api/admin/auth/login` | 공개 | 관리자 로그인 |
| POST | `/api/admin/auth/refresh` | 인증 | 토큰 갱신 |
| POST | `/api/admin/auth/logout` | 인증 | 로그아웃 |
| GET | `/api/admin/auth/me` | 인증 | 내 정보 |
| PUT | `/api/admin/auth/password` | 인증 | 비밀번호 변경 |

#### 대시보드 (`/api/admin/dashboard`) — 3개
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/dashboard/summary` | 전체 | 핵심 지표 |
| GET | `/api/admin/dashboard/charts` | 전체 | 차트 데이터 (?period=7d/30d/90d) |
| GET | `/api/admin/dashboard/rankings` | 전체 | 인기 레시피/재료/코칭 랭킹 |

#### 레시피 관리 (`/api/admin/recipes`) — 8개
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/recipes` | CONTENT+ | 목록 (필터: status, category, difficulty, coachingReady) |
| GET | `/api/admin/recipes/{id}` | CONTENT+ | 상세 |
| POST | `/api/admin/recipes` | CONTENT+ | 생성 |
| PUT | `/api/admin/recipes/{id}` | CONTENT+ | 수정 |
| DELETE | `/api/admin/recipes/{id}` | CONTENT+ | 삭제 (soft) |
| PATCH | `/api/admin/recipes/{id}/status` | CONTENT+ | 상태 변경 (draft/published/hidden) |
| POST | `/api/admin/recipes/bulk-upload` | CONTENT+ | 엑셀 일괄 등록 |
| GET | `/api/admin/recipes/bulk-template` | CONTENT+ | 엑셀 템플릿 다운로드 |

#### 재료 관리 (`/api/admin/ingredients`) — 7개
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/ingredients` | CONTENT+ | 목록 (필터: categoryId, keyword) |
| GET | `/api/admin/ingredients/{id}` | CONTENT+ | 상세 |
| POST | `/api/admin/ingredients` | CONTENT+ | 생성 |
| PUT | `/api/admin/ingredients/{id}` | CONTENT+ | 수정 |
| DELETE | `/api/admin/ingredients/{id}` | CONTENT+ | 삭제 |
| POST | `/api/admin/ingredients/bulk-upload` | CONTENT+ | 엑셀 일괄 등록 |
| GET | `/api/admin/ingredients/bulk-template` | CONTENT+ | 엑셀 템플릿 다운로드 |

#### 카테고리 관리 (`/api/admin/categories`) — 5개
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/categories` | CONTENT+ | 전체 목록 |
| POST | `/api/admin/categories` | CONTENT+ | 생성 |
| PUT | `/api/admin/categories/{id}` | CONTENT+ | 수정 |
| DELETE | `/api/admin/categories/{id}` | CONTENT+ | 삭제 |
| PUT | `/api/admin/categories/reorder` | CONTENT+ | 정렬 순서 변경 |

#### 유저 관리 (`/api/admin/users`) — 8개
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/users` | SUPER | 유저 목록 (필터: status, loginType, level) |
| GET | `/api/admin/users/{id}` | SUPER | 유저 상세 |
| PATCH | `/api/admin/users/{id}/suspend` | SUPER | 계정 정지 |
| PATCH | `/api/admin/users/{id}/activate` | SUPER | 계정 활성화 |
| GET | `/api/admin/users/{id}/coaching-logs` | SUPER | 코칭 로그 |
| GET | `/api/admin/users/{id}/completions` | SUPER | 완료 이력 |
| GET | `/api/admin/users/{id}/favorites` | SUPER | 즐겨찾기 |
| GET | `/api/admin/users/{id}/search-history` | SUPER | 검색 이력 |

#### 피드백 관리 (`/api/admin/feedback`) — 5개
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/feedback` | CONTENT+ | 목록 (필터: status, rating) |
| GET | `/api/admin/feedback/{id}` | CONTENT+ | 상세 |
| PATCH | `/api/admin/feedback/{id}/status` | CONTENT+ | 상태 변경 |
| PUT | `/api/admin/feedback/{id}/note` | CONTENT+ | 관리자 메모 수정 |
| GET | `/api/admin/feedback/summary` | CONTENT+ | 피드백 요약 통계 |

#### 쇼츠 관리 (`/api/admin/shorts`) — 6개
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/shorts/cache` | CONTENT+ | 캐시 목록 |
| GET | `/api/admin/shorts/cache/{id}` | CONTENT+ | 캐시 상세 |
| DELETE | `/api/admin/shorts/cache/{id}` | CONTENT+ | 캐시 삭제 |
| DELETE | `/api/admin/shorts/cache/clear-all` | SUPER | 전체 캐시 초기화 |
| POST | `/api/admin/shorts/cache/{id}/reconvert` | CONTENT+ | 수동 재변환 |
| GET | `/api/admin/shorts/stats` | CONTENT+ | 변환 통계 |

#### 통계 (`/api/admin/stats`) — 6개
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/stats/users` | VIEWER+ | 유저 통계 (가입 추이, DAU/MAU) |
| GET | `/api/admin/stats/recipes` | VIEWER+ | 레시피 통계 (카테고리별, TOP 20) |
| GET | `/api/admin/stats/ingredients` | VIEWER+ | 재료 통계 (인기 TOP 20, 미사용) |
| GET | `/api/admin/stats/coaching` | VIEWER+ | 코칭 통계 (이용률, 완료율) |
| GET | `/api/admin/stats/shorts` | VIEWER+ | 쇼츠 통계 (변환 추이, 성공률) |
| GET | `/api/admin/stats/ranking` | VIEWER+ | 랭킹 통계 (레벨 분포) |

#### 관리자 계정 (`/api/admin/accounts`) — 5개
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/accounts` | SUPER | 계정 목록 |
| POST | `/api/admin/accounts` | SUPER | 계정 생성 |
| PUT | `/api/admin/accounts/{id}` | SUPER | 역할 변경 |
| DELETE | `/api/admin/accounts/{id}` | SUPER | 계정 삭제 |
| PATCH | `/api/admin/accounts/{id}/unlock` | SUPER | 잠금 해제 |

### Monitoring API — 내부 (3개)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/monitoring/users` | DAU/WAU/MAU, 신규 가입 |
| GET | `/api/monitoring/dashboard` | 레시피/재료/코칭/쇼츠 현황 |
| GET | `/api/monitoring/shorts` | 성공률, 평균 시간, 캐시 히트율 |

---

## DB 마이그레이션 (Flyway)

| 버전 | 파일 | 내용 |
|------|------|------|
| V1 | `V1__init_schema.sql` | 17개 코어 테이블 + 인덱스 |
| V2 | `V2__seed_categories.sql` | 재료 카테고리 8종 시드 |
| V3 | `V3__triggers.sql` | coaching_ready 자동갱신 + cooking_count 자동증가 트리거 |
| V4 | `V4__shorts_conversion_history.sql` | 쇼츠 변환 이력 테이블 |
| V5 | `V5__feedback_updated_at.sql` | 피드백 updated_at 추가 |
| V6 | `V6__fix_enum_case_constraints.sql` | CHECK 제약 UPPERCASE 수정 |
| V7 | `V7__seed_test_data.sql` | 테스트 데이터 (관리자, 재료 22개, 레시피 5개) |
| V8 | `V8__shorts_conversion_log.sql` | 변환 성능 로그 (단계별 ms 추적) |
| V9 | `V9__shorts_cache_youtube_metadata.sql` | YouTube 메타데이터 (채널명, 원본 제목) |
| V10 | `V10__coaching_logs_shorts_cache_id.sql` | 쇼츠 기반 코칭 지원 |
| V11 | `V11__coaching_photos.sql` | 멀티 사진 업로드 테이블 |
| V12 | `V12__shorts_favorites.sql` | 쇼츠 즐겨찾기 테이블 |
| V13 | `V13__update_admin_password.sql` | 관리자 비밀번호 갱신 |

---

## 테스트

```bash
./gradlew test
```

24개 테스트 파일:
- 인증: AuthServiceTest, KakaoAuthServiceTest, AppleAuthServiceTest
- 사용자: UserServiceTest, UserTest, UserRankTest
- 레시피: RecommendServiceTest
- 코칭: CoachingServiceTest
- 즐겨찾기: FavoriteServiceTest
- 쇼츠: ShortsConvertServiceTest, ShortsCacheServiceTest
- 검색: SearchHistoryServiceTest
- 파일: LocalFileServiceTest
- 관리자: AdminAuthServiceTest, AdminRecipeServiceTest, RecipeBulkUploadServiceTest, IngredientBulkUploadServiceTest, AdminCategoryServiceTest, AdminShortsServiceTest, AdminUserTest
- 설정: JwtProviderTest, JwtAuthenticationFilterTest, ClientIpResolverTest, RateLimitFilterTest

---

## 주요 설계 결정

### 쇼츠 변환 트랜잭션 분리
외부 API 호출(2.5분)을 `@Transactional` 밖으로 분리하여 DB 커넥션 풀 고갈 방지. DB 저장만 짧은 트랜잭션으로 래핑.

### 캐싱 전략
재료/카테고리는 변경이 드물고 읽기가 빈번 → `@Cacheable` + `@CacheEvict` 패턴으로 관리자 수정 시에만 무효화.

### N+1 해결
`fetch join`으로 연관 엔티티 단일 쿼리 로딩. 다중 컬렉션은 `@BatchSize(100)`으로 IN 절 배치 쿼리.

### Rate Limiting
쇼츠 변환: 사용자당 5회/분, 50회/일 슬라이딩 윈도우. 동시 10슬롯 Semaphore. 인증/추천 등 6개 민감 엔드포인트 보호.

### 보안
파일 업로드 경로 정규화(Path Traversal 방지), JWT 비밀키 32바이트 강제, X-Forwarded-For 신뢰 프록시만 허용, 업로드 카테고리 화이트리스트.

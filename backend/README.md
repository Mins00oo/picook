# Picook Backend

> Spring Boot 4.0.3 + Java 21 기반 REST API 서버

## 소개

Picook의 모든 비즈니스 로직을 처리하는 모놀리식 백엔드 서버입니다. 사용자 앱과 백오피스의 API를 단일 서버에서 제공하며, 재료 기반 추천 엔진, 요리 완료 인증(별점·메모·사진), 포인트·레벨·의상 보상 시스템을 핵심 기능으로 합니다.

---

## 기술 스택

| 분류 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Spring Boot 4.0.3 | Java 21 LTS |
| 빌드 | Gradle (Kotlin DSL) | |
| 데이터베이스 | PostgreSQL 15 | Docker 컨테이너 |
| ORM | Spring Data JPA + Hibernate | Fetch Join, @BatchSize 최적화 |
| 마이그레이션 | Flyway | V1~V24 |
| 인증 | Spring Security + JWT | 액세스 1h, 리프레시 30d |
| API 문서 | SpringDoc OpenAPI 3.0 | Swagger UI |
| 캐싱 | Spring Cache | ConcurrentMapCacheManager |
| 엑셀 | Apache POI | 일괄 등록/템플릿 다운로드 |
| 외부 통신 | WebFlux WebClient | Apple/카카오 토큰 검증 |
| 파일 저장 | 로컬 디스크 | `/data/picook/uploads/` |
| 로깅 | Logback + Logstash Encoder | 구조화 JSON 로깅 |
| 메트릭 | Micrometer + Prometheus | 비즈니스 메트릭 |
| 테스트 | JUnit 5 + Mockito | 40개 테스트 파일 |

---

## 패키지 구조

```
src/main/java/com/picook/
├── config/                        ← 설정
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
│   ├── user/                      ← 사용자 (프로필, 등급)
│   ├── ingredient/                ← 재료 (카테고리, 서브카테고리, 동의어)
│   ├── recipe/                    ← 레시피 (CRUD, 추천)
│   ├── cookbook/                  ← 요리 완료 인증 (별점/메모/사진 최대 4장)
│   ├── fridge/                    ← 사용자 냉장고 (보유 재료)
│   ├── favorite/                  ← 즐겨찾기
│   ├── searchhistory/             ← 검색 이력
│   ├── feedback/                  ← 피드백 (엔티티만, API는 admin)
│   ├── point/                     ← 포인트 적립/사용
│   ├── attendance/                ← 출석체크
│   ├── outfit/                    ← 의상 카탈로그/구매/장착 (레벨업 시 자동 지급)
│   ├── monitoring/                ← 운영 모니터링 (DAU/MAU)
│   ├── file/                      ← 파일 업로드 (LocalFileService)
│   │
│   └── admin/                     ← 백오피스 API
│       ├── auth/                  ← 관리자 인증
│       ├── dashboard/             ← 대시보드
│       ├── recipe/                ← 레시피 관리 + 엑셀 벌크
│       ├── ingredient/            ← 재료 관리 + 엑셀 벌크
│       ├── category/              ← 카테고리 관리
│       ├── subcategory/           ← 서브카테고리 관리
│       ├── outfit/                ← 의상 카탈로그 관리
│       ├── user/                  ← 유저 관리 (SUPER_ADMIN)
│       ├── feedback/              ← 피드백 관리
│       ├── stats/                 ← 통계
│       └── account/               ← 관리자 계정 (SUPER_ADMIN)
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

### 1. 데이터베이스 + 서버 (도커)

```bash
cd ../infra
docker compose up -d
# PostgreSQL 15 → localhost:5432
# Backend → localhost:8080
```

### 2. 백엔드만 IDE에서 (도커는 PostgreSQL만 띄우는 경우)

```bash
./gradlew bootRun
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
| `prod` | 운영 | 외부 호스트 | 구조화 JSON 로깅, 메트릭 활성화 |

### 주요 환경변수

모든 환경변수는 `backend/secrets.env` 한 파일에서 관리합니다 (gitignore).
로컬 IDE bootRun 시 `application.yml`의 `spring.config.import`로 자동 로드되고,
도커 배포 시 `infra/docker-compose.yml`의 `env_file:`로 컨테이너에 주입됩니다.
운영 서버에는 별도의 `secrets.env`를 직접 배치합니다.

| 변수 | 설명 |
|------|------|
| `SPRING_PROFILES_ACTIVE` | Spring 프로파일 (`local`/`prod`) — logback의 LOG_DIR 분기에 사용 |
| `JWT_SECRET` | JWT 서명 키 (32바이트 이상 권장) |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USERNAME` / `DB_PASSWORD` | PostgreSQL 접속 정보 |
| `HIBERNATE_SHOW_SQL` | Hibernate SQL 로그 출력 (`true`/`false`) |
| `FILE_UPLOAD_DIR` | 업로드 파일 저장 디렉토리 |
| `APPLE_BUNDLE_ID` | Apple Sign-In 검증용 번들 ID |
| `MONITORING_ALLOWED_IPS` | 모니터링 엔드포인트 허용 IP (콤마 구분) |
| `TRUSTED_PROXIES` | 프록시 신뢰 IP (콤마 구분) — 클라이언트 IP 추출에 사용 |

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

### Auth API — 공개

| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/kakao` | 카카오 소셜 로그인 |
| POST | `/api/auth/apple` | Apple 소셜 로그인 |
| POST | `/api/auth/refresh` | JWT 토큰 갱신 |
| POST | `/api/auth/logout` | 로그아웃 |

### User API — 인증 필요

#### 사용자 (`/api/v1/users`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/users/me` | 내 프로필 조회 |
| PUT | `/api/v1/users/me` | 프로필 수정 |
| DELETE | `/api/v1/users/me` | 회원 탈퇴 (30일 유예) |

#### 재료 (`/api/v1/ingredients`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/ingredients` | 전체 재료 목록 (카테고리/서브카테고리/동의어 포함, 캐시) |
| GET | `/api/v1/ingredients/categories` | 카테고리 목록 |

#### 레시피 (`/api/v1/recipes`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/recipes/recommend` | 재료 기반 추천 (매칭률 30%+ TOP 10) |
| GET | `/api/v1/recipes/{id}` | 레시피 상세 (재료 + 조리 단계) |

#### 즐겨찾기 (`/api/v1/favorites`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/favorites` | 즐겨찾기 목록 |
| POST | `/api/v1/favorites` | 즐겨찾기 추가 |
| DELETE | `/api/v1/favorites/{id}` | 즐겨찾기 삭제 |

#### 요리북 (`/api/v1/cookbook`) — 요리 완료 인증
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/cookbook/entries` | 등록 (multipart: rating 1~5, memo ≤1000자, photos 최대 4장) |
| GET | `/api/v1/cookbook/entries` | 본인 기록 목록 (페이징) |
| GET | `/api/v1/cookbook/entries/{id}` | 본인 기록 상세 |
| GET | `/api/v1/cookbook/stats?yearMonth=YYYY-MM` | 월별 요리 횟수 |

#### 냉장고 (`/api/v1/fridge`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/fridge/ingredients` | 보유 재료 목록 |
| POST | `/api/v1/fridge/ingredients/{ingredientId}` | 재료 추가 |
| DELETE | `/api/v1/fridge/ingredients/{ingredientId}` | 재료 제거 |
| PUT | `/api/v1/fridge/ingredients` | 재료 일괄 갱신 |

#### 포인트 (`/api/v1/points`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/points/balance` | 현재 잔액 |
| GET | `/api/v1/points/history` | 적립/사용 이력 |

#### 출석체크 (`/api/v1/attendance`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/attendance/today` | 오늘 출석 상태 |
| POST | `/api/v1/attendance/check-in` | 출석체크 (포인트 지급) |
| GET | `/api/v1/attendance/history` | 출석 이력 |

#### 의상 (`/api/v1/outfits`)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/outfits` | 전체 의상 카탈로그 |
| GET | `/api/v1/outfits/me` | 내가 보유한 의상 |
| POST | `/api/v1/outfits/me/purchase` | 의상 구매 (포인트 차감) |
| PUT | `/api/v1/outfits/me/equip` | 장착 의상 변경 |

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

### Admin API — 역할 기반

#### 관리자 인증 (`/api/admin/auth`)
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| POST | `/api/admin/auth/login` | 공개 | 관리자 로그인 |
| POST | `/api/admin/auth/refresh` | 인증 | 토큰 갱신 |
| POST | `/api/admin/auth/logout` | 인증 | 로그아웃 |
| GET | `/api/admin/auth/me` | 인증 | 내 정보 |
| PUT | `/api/admin/auth/password` | 인증 | 비밀번호 변경 |

#### 대시보드 (`/api/admin/dashboard`)
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/dashboard/summary` | 전체 | 핵심 지표 |
| GET | `/api/admin/dashboard/charts` | 전체 | 차트 데이터 (?period=7d/30d/90d) |
| GET | `/api/admin/dashboard/rankings` | 전체 | 인기 레시피/재료 랭킹 |

#### 레시피 관리 (`/api/admin/recipes`)
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/recipes` | CONTENT+ | 목록 (필터: status, category, difficulty) |
| GET | `/api/admin/recipes/{id}` | CONTENT+ | 상세 |
| POST | `/api/admin/recipes` | CONTENT+ | 생성 |
| PUT | `/api/admin/recipes/{id}` | CONTENT+ | 수정 |
| DELETE | `/api/admin/recipes/{id}` | CONTENT+ | 삭제 (soft) |
| PATCH | `/api/admin/recipes/{id}/status` | CONTENT+ | 상태 변경 (draft/published/hidden) |
| POST | `/api/admin/recipes/bulk-upload` | CONTENT+ | 엑셀 일괄 등록 |
| GET | `/api/admin/recipes/bulk-template` | CONTENT+ | 엑셀 템플릿 다운로드 |

#### 재료 관리 (`/api/admin/ingredients`)
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/ingredients` | CONTENT+ | 목록 (필터: categoryId, keyword) |
| GET | `/api/admin/ingredients/{id}` | CONTENT+ | 상세 |
| POST | `/api/admin/ingredients` | CONTENT+ | 생성 |
| PUT | `/api/admin/ingredients/{id}` | CONTENT+ | 수정 |
| DELETE | `/api/admin/ingredients/{id}` | CONTENT+ | 삭제 |
| POST | `/api/admin/ingredients/bulk-upload` | CONTENT+ | 엑셀 일괄 등록 |
| GET | `/api/admin/ingredients/bulk-template` | CONTENT+ | 엑셀 템플릿 다운로드 |

#### 카테고리 관리 (`/api/admin/categories`)
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/categories` | CONTENT+ | 전체 목록 |
| POST | `/api/admin/categories` | CONTENT+ | 생성 |
| PUT | `/api/admin/categories/{id}` | CONTENT+ | 수정 |
| DELETE | `/api/admin/categories/{id}` | CONTENT+ | 삭제 |
| PUT | `/api/admin/categories/reorder` | CONTENT+ | 정렬 순서 변경 |

#### 서브카테고리 관리 (`/api/admin/subcategories`)
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/subcategories` | CONTENT+ | 목록 (?categoryId 필터) |
| POST | `/api/admin/subcategories` | CONTENT+ | 생성 |
| PUT | `/api/admin/subcategories/{id}` | CONTENT+ | 수정 |
| DELETE | `/api/admin/subcategories/{id}` | CONTENT+ | 삭제 |
| PUT | `/api/admin/subcategories/reorder` | CONTENT+ | 정렬 순서 변경 |

#### 의상 카탈로그 관리 (`/api/admin/outfits`)
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/outfits` | CONTENT+ | 의상 목록 |
| POST | `/api/admin/outfits` | CONTENT+ | 등록 |
| PUT | `/api/admin/outfits/{id}` | CONTENT+ | 수정 |
| DELETE | `/api/admin/outfits/{id}` | CONTENT+ | 삭제 |

#### 유저 관리 (`/api/admin/users`)
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/users` | SUPER | 유저 목록 (필터: status, loginType, level) |
| GET | `/api/admin/users/{id}` | SUPER | 유저 상세 |
| PATCH | `/api/admin/users/{id}/suspend` | SUPER | 계정 정지 |
| PATCH | `/api/admin/users/{id}/activate` | SUPER | 계정 활성화 |
| GET | `/api/admin/users/{id}/completions` | SUPER | 요리 완료 이력 |
| GET | `/api/admin/users/{id}/favorites` | SUPER | 즐겨찾기 |
| GET | `/api/admin/users/{id}/search-history` | SUPER | 검색 이력 |

#### 피드백 관리 (`/api/admin/feedback`)
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/feedback` | CONTENT+ | 목록 (필터: status, rating) |
| GET | `/api/admin/feedback/{id}` | CONTENT+ | 상세 |
| PATCH | `/api/admin/feedback/{id}/status` | CONTENT+ | 상태 변경 |
| PUT | `/api/admin/feedback/{id}/note` | CONTENT+ | 관리자 메모 수정 |
| GET | `/api/admin/feedback/summary` | CONTENT+ | 피드백 요약 통계 |

#### 통계 (`/api/admin/stats`)
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/stats/users` | VIEWER+ | 유저 통계 (가입 추이, DAU/MAU) |
| GET | `/api/admin/stats/recipes` | VIEWER+ | 레시피 통계 (카테고리별, TOP 20) |
| GET | `/api/admin/stats/ingredients` | VIEWER+ | 재료 통계 (인기 TOP 20, 미사용) |
| GET | `/api/admin/stats/ranking` | VIEWER+ | 랭킹 통계 (레벨 분포) |

#### 관리자 계정 (`/api/admin/accounts`)
| Method | Endpoint | 역할 | 설명 |
|--------|----------|------|------|
| GET | `/api/admin/accounts` | SUPER | 계정 목록 |
| POST | `/api/admin/accounts` | SUPER | 계정 생성 |
| PUT | `/api/admin/accounts/{id}` | SUPER | 역할 변경 |
| DELETE | `/api/admin/accounts/{id}` | SUPER | 계정 삭제 |
| PATCH | `/api/admin/accounts/{id}/unlock` | SUPER | 잠금 해제 |

### Monitoring API — 내부

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/monitoring/users` | DAU/WAU/MAU, 신규 가입 |
| GET | `/api/monitoring/dashboard` | 레시피/재료 현황 |

---

## DB 마이그레이션 (Flyway)

| 버전 | 내용 |
|------|------|
| V1~V3 | 초기 스키마, 카테고리 시드, 트리거 |
| V5~V7 | 피드백 updated_at, enum 보정, 시드 데이터 |
| V13 | 관리자 비밀번호 갱신 |
| V14 | 포인트 시스템 |
| V15 | 출석체크 |
| V16 | 요리북 |
| V17 | v1.0 정리 마이그레이션 (폐기 기능 테이블 일괄 DROP — 코칭/쇼츠 관련) + 냉장고 |
| V18 | 칼로리/경험치/의상 리뉴얼 |
| V19 | users.display_name UNIQUE |
| V20 | 재료 서브카테고리 + 이모지 |
| V21 | 재료 시드 (전체) |
| V22 | users.oauth_name |
| V23 | recipe_steps 폐기 컬럼 DROP |
| V24 | 양념(seasoning)/메인재료 분리 |

> V4, V8, V9, V12는 v1.0 이전 시점에 추가됐다가 V17의 cleanup에서 함께 DROP되었습니다. 파일 자체는 Flyway 체크섬 호환을 위해 남겨져 있습니다.

---

## 테스트

```bash
./gradlew test
```

40개 테스트 파일. 주요 커버리지:

- **인증**: AuthService, KakaoAuthService, AppleAuthService, JwtProvider, JwtAuthenticationFilter
- **사용자**: UserService, User, UserRank
- **레시피**: RecommendService (매칭률 알고리즘)
- **즐겨찾기/검색이력**: FavoriteService, SearchHistoryService
- **파일**: LocalFileService
- **관리자**: AdminAuthService, AdminRecipeService, RecipeBulkUploadService, IngredientBulkUploadService, AdminCategoryService, AdminSubcategoryService, AdminUserController 등
- **설정/필터**: ClientIpResolver, RateLimitFilter
- **모니터링**: MonitoringController
- **재료 유틸**: EmojiResolver

---

## 주요 설계 결정

### 추천 알고리즘
양념(`is_seasoning=true`)은 매칭률 계산에서 제외. 메인재료 기준 30% 이상 + 매칭률 DESC + TOP 10. 한 SQL로 매칭/필터/정렬/제한을 처리해 N+1 회피.

### 캐싱 전략
재료/카테고리는 변경이 드물고 읽기가 빈번 → `@Cacheable` + `@CacheEvict` 패턴으로 관리자 수정 시에만 무효화.

### N+1 해결
`fetch join`으로 연관 엔티티 단일 쿼리 로딩. 다중 컬렉션은 `@BatchSize(100)`으로 IN 절 배치 쿼리.

### Rate Limiting
인증/추천 등 민감 엔드포인트에 슬라이딩 윈도우 + Semaphore 기반 제한.

### 보안
파일 업로드 경로 정규화(Path Traversal 방지), JWT 비밀키 32바이트 강제, X-Forwarded-For 신뢰 프록시만 허용, 업로드 카테고리 화이트리스트.

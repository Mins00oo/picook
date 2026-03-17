# 백엔드 — Spring Boot

## 기술 스택
- Spring Boot 4.0.3 + Java 21 + Gradle
- Spring Security + JWT (액세스 1h, 리프레시 30d, bcrypt)
- Spring Data JPA + PostgreSQL 15 (Docker)
- Flyway (마이그레이션)
- AWS S3 SDK v2 (이미지)
- Apache POI (엑셀 파싱)
- yt-dlp + ffmpeg (쇼츠 음성 추출, 서버에 설치 필요)
- OpenAI API (Whisper STT + GPT-4o 구조화)

## 패키지 구조
```
com.picook/
├── PicookApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── JwtProvider.java
│   ├── JwtAuthenticationFilter.java
│   ├── CorsConfig.java
│   └── S3Config.java
├── domain/
│   ├── auth/
│   │   ├── controller/AuthController.java
│   │   ├── service/AuthService.java
│   │   ├── service/KakaoAuthService.java
│   │   └── dto/
│   ├── user/
│   │   ├── controller/UserController.java
│   │   ├── service/UserService.java
│   │   ├── repository/UserRepository.java
│   │   ├── entity/User.java
│   │   └── dto/
│   ├── ingredient/
│   │   ├── controller/IngredientController.java
│   │   ├── service/IngredientService.java
│   │   ├── repository/
│   │   ├── entity/Ingredient.java, IngredientCategory.java, IngredientSynonym.java
│   │   └── dto/
│   ├── recipe/
│   │   ├── controller/RecipeController.java
│   │   ├── service/RecipeService.java
│   │   ├── service/RecommendService.java
│   │   ├── repository/
│   │   ├── entity/Recipe.java, RecipeIngredient.java, RecipeStep.java
│   │   └── dto/
│   ├── coaching/
│   │   ├── controller/CoachingController.java
│   │   ├── service/CoachingService.java
│   │   ├── entity/CoachingLog.java, CookingCompletion.java
│   │   └── dto/
│   ├── shorts/
│   │   ├── controller/ShortsController.java
│   │   ├── service/ShortsConvertService.java
│   │   ├── service/ShortsCacheService.java
│   │   ├── entity/ShortsCache.java
│   │   └── dto/
│   ├── favorite/
│   │   ├── controller/FavoriteController.java
│   │   ├── service/FavoriteService.java
│   │   ├── entity/Favorite.java
│   │   └── dto/
│   ├── file/
│   │   ├── controller/FileController.java
│   │   └── service/S3FileService.java
│   └── admin/
│       ├── auth/
│       │   ├── controller/AdminAuthController.java
│       │   ├── service/AdminAuthService.java
│       │   ├── entity/AdminUser.java
│       │   └── dto/
│       ├── dashboard/
│       │   ├── controller/AdminDashboardController.java
│       │   ├── service/AdminDashboardService.java
│       │   └── dto/
│       ├── recipe/
│       │   ├── controller/AdminRecipeController.java
│       │   ├── service/AdminRecipeService.java
│       │   ├── service/RecipeBulkUploadService.java
│       │   └── dto/
│       ├── ingredient/
│       │   ├── controller/AdminIngredientController.java
│       │   ├── service/AdminIngredientService.java
│       │   ├── service/IngredientBulkUploadService.java
│       │   └── dto/
│       ├── category/
│       │   ├── controller/AdminCategoryController.java
│       │   ├── service/AdminCategoryService.java
│       │   └── dto/
│       ├── shorts/
│       │   ├── controller/AdminShortsController.java
│       │   ├── service/AdminShortsService.java
│       │   └── dto/
│       ├── user/
│       │   ├── controller/AdminUserController.java
│       │   ├── service/AdminUserService.java
│       │   └── dto/
│       ├── feedback/
│       │   ├── controller/AdminFeedbackController.java
│       │   ├── service/AdminFeedbackService.java
│       │   └── dto/
│       ├── stats/
│       │   ├── controller/AdminStatsController.java
│       │   ├── service/AdminStatsService.java
│       │   └── dto/
│       └── account/
│           ├── controller/AdminAccountController.java
│           ├── service/AdminAccountService.java
│           └── dto/
└── global/
    ├── response/ApiResponse.java
    ├── exception/GlobalExceptionHandler.java
    ├── exception/BusinessException.java
    └── util/PageResponse.java
```

---

## 관리자(백오피스) API 전체 명세

### 1. 관리자 인증 (/api/admin/auth)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /login | 관리자 로그인 |
| POST | /refresh | 토큰 갱신 |
| POST | /logout | 로그아웃 |
| GET | /me | 현재 관리자 정보 |
| PUT | /password | 비밀번호 변경 |

5회 실패 → 15분 잠금. 세션 액세스 1h + 리프레시 8h. 동시 2개.

### 2. 대시보드 (/api/admin/dashboard)
| GET | /summary | 주요 지표 (사용자, 레시피, 코칭, 쇼츠, 등급분포) |
| GET | /charts | 차트 데이터 (?period=7d/30d/90d/custom) |
| GET | /rankings | 인기 레시피/재료/코칭 TOP, 최근 피드백 |

### 3. 레시피 관리 (/api/admin/recipes)
| GET | / | 목록 (?status, category, difficulty, coachingReady, keyword, page, size, sort) |
| GET | /{id} | 상세 (재료+단계+전부) |
| POST | / | 등록 (재료 매핑 + steps의 active/wait + duration 포함) |
| PUT | /{id} | 수정 |
| DELETE | /{id} | 소프트 삭제 |
| PATCH | /{id}/status | 상태 변경 (draft/published/hidden) |
| POST | /bulk-upload | 엑셀 일괄등록 |
| GET | /bulk-template | 엑셀 템플릿 다운로드 |
| POST | /{id}/image | 대표 이미지 업로드 |
| DELETE | /{id}/image | 이미지 삭제 |

### 4. 재료 관리 (/api/admin/ingredients)
| GET | / | 목록 (?categoryId, keyword, page, size) |
| GET | /{id} | 상세 (동의어, 사용 레시피 수) |
| POST | / | 등록 (동의어 포함) |
| PUT | /{id} | 수정 |
| DELETE | /{id} | 삭제 (레시피 매핑 시 400) |
| POST | /bulk-upload | 엑셀 일괄등록 |
| GET | /bulk-template | 템플릿 다운로드 |
| POST | /{id}/image | 아이콘 업로드 |

### 5. 카테고리 관리 (/api/admin/categories)
| GET | / | 전체 목록 (정렬순) |
| POST | / | 등록 |
| PUT | /{id} | 수정 |
| DELETE | /{id} | 삭제 (소속 재료 있으면 400) |
| PUT | /reorder | 순서 변경 ({ orderedIds: [1,3,2,...] }) |

### 6. 쇼츠 캐시 관리 (/api/admin/shorts)
| GET | /cache | 캐시 목록 (?keyword, modelVersion, page, size) |
| GET | /cache/{id} | 캐시 상세 (변환 결과 확인) |
| DELETE | /cache/{id} | 개별 삭제 |
| DELETE | /cache/clear-all | 전체 초기화 (SUPER_ADMIN만) |
| POST | /cache/{id}/reconvert | 수동 재변환 |
| GET | /stats | 쇼츠 통계 (캐시수, 히트율, 실패율, 평균시간) |

### 7. 사용자 관리 (/api/admin/users) — SUPER_ADMIN
| GET | / | 목록 (?status, loginType, levelMin, keyword, page, size) |
| GET | /{id} | 상세 (프로필+등급+활동) |
| PATCH | /{id}/suspend | 정지 (사유 필수) |
| PATCH | /{id}/activate | 해제 |
| GET | /{id}/coaching-logs | 코칭 이력 |
| GET | /{id}/completions | 완료 이력 (사진) |
| GET | /{id}/favorites | 즐겨찾기 |
| GET | /{id}/search-history | 검색 기록 |

### 8. 피드백 관리 (/api/admin/feedback)
| GET | / | 목록 (?status, rating, recipeId, page, size) |
| GET | /{id} | 상세 (레시피+사용자 정보) |
| PATCH | /{id}/status | 상태 (pending→reviewed→resolved) |
| PUT | /{id}/note | 관리자 메모 |
| GET | /summary | 요약 통계 (건수, 분포, 어려운 레시피 TOP) |

### 9. 상세 통계 (/api/admin/stats) — VIEWER+
| GET | /users | 가입추이, 로그인방식 분포, DAU/MAU, 리텐션 |
| GET | /recipes | 카테고리별, 난이도별, 인기 TOP 20, coaching_ready율 |
| GET | /ingredients | 인기 재료 TOP 20, 미사용 재료 목록 |
| GET | /coaching | 이용률, 완료율, 싱글/멀티 비율, 소요시간 비교, 시간대 분포 |
| GET | /shorts | 변환추이, 성공률, 캐시 히트율, 인기 URL TOP 10 |
| GET | /ranking | 레벨 분포, 평균 레벨, 레벨업 추이, 사진 업로드율 |

### 10. 관리자 계정 관리 (/api/admin/accounts) — SUPER_ADMIN
| GET | / | 관리자 목록 |
| POST | / | 관리자 생성 |
| PUT | /{id} | 역할 변경 |
| DELETE | /{id} | 삭제 |
| PATCH | /{id}/unlock | 잠금 해제 |

---

## 사용자 API 요약

### 인증 (/api/auth)
| POST /kakao | 카카오 로그인 |
| POST /apple | Apple 로그인 |
| POST /refresh | 토큰 갱신 |
| POST /logout | 로그아웃 (JWT stateless — 서버는 200 반환) |

### 사용자 (/api/v1/users)
| GET /me | 프로필+등급 |
| PUT /me | 수정 |
| DELETE /me | 탈퇴(30일 유예) |

### 재료 (/api/v1/ingredients)
| GET / | 전체 목록(카테고리+동의어) |
| GET /categories | 카테고리 목록 |

### 레시피 (/api/v1/recipes)
| POST /recommend | 추천 TOP 10 |
| GET /{id} | 상세 |
| GET /search | 검색 |

### 즐겨찾기 (/api/v1/favorites)
| GET / | 목록 | POST / | 추가 | DELETE /{id} | 삭제 |

### 코칭 (/api/v1/coaching)
| POST /start | 시작 |
| PATCH /{id}/complete | 완료 |
| POST /{id}/photo | 사진 → 등급+1 |

### 쇼츠 (/api/v1/shorts)
| POST /convert | 변환 |
| GET /recent | 최근 변환 (URL 기준 중복 제거, 최대 20건) |
| GET /{cacheId} | 캐시 상세 조회 (본인 변환 기록만 접근 가능) |

### 검색 기록 (/api/v1/search-history)
| GET / | 목록 | DELETE /{id} | 개별삭제 | DELETE / | 전체삭제 |

---

## Spring Security 접근 제어
```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/admin/auth/login").permitAll()
    .requestMatchers("/api/admin/accounts/**").hasRole("SUPER_ADMIN")
    .requestMatchers("/api/admin/users/**").hasRole("SUPER_ADMIN")
    .requestMatchers("/api/admin/shorts/cache/clear-all").hasRole("SUPER_ADMIN")
    .requestMatchers(HttpMethod.GET, "/api/admin/stats/**").hasAnyRole("SUPER_ADMIN", "CONTENT_ADMIN", "VIEWER")
    .requestMatchers("/api/admin/**").hasAnyRole("SUPER_ADMIN", "CONTENT_ADMIN")
    .requestMatchers("/api/v1/**").authenticated()
);
```

---

## 추천 알고리즘 (RecommendService)
```
입력: ingredientIds[], maxTime?, difficulty?, servings?
1. recipe_ingredients에서 사용자 재료와 교집합 계산
2. 매칭률 = 교집합 / 레시피 필수재료 총 수
3. 매칭률 30% 미만 제외
4. 시간/난이도/인분 필터 적용
5. 매칭률 DESC 정렬
6. TOP 10 반환 (부족 재료 목록 포함)
```

## 쇼츠 변환 (ShortsConvertService)
```
입력: youtubeUrl
1. url_hash(SHA-256) 생성
2. shorts_cache에서 hash + 현재 ai_model_version 조회
3. 캐시 있으면 → 즉시 반환
4. 캐시 없으면:
   a. yt-dlp --dump-json으로 메타데이터(채널명, 원본제목, 길이, 썸네일) 파싱
   b. yt-dlp로 음성 추출 (.mp3)
   c. Whisper API로 STT
   d. GPT-4o로 단계별 구조화 (JSON)
   e. 결과 + 메타데이터를 shorts_cache에 저장
5. 반환 (channelName, originalTitle, durationSeconds 포함)
```

## 엑셀 일괄등록
```
1. Apache POI로 행 파싱
2. 유효성 검증 (필수항목, 재료명 DB 매칭)
3. 결과: { total, success, failed, errors: [{ row, reason }] }
4. 정상 건 INSERT (상태: draft)
```

## 테스트 우선순위
1. RecommendService (매칭률)
2. AuthService (JWT, 카카오)
3. AdminAuthService (관리자 인증, 잠금)
4. ShortsConvertService (캐싱)
5. BulkUploadService (엑셀 파싱)
6. AdminRecipeService (CRUD + 상태)
7. AdminCategoryService (순서 변경)

---

## 개발 진행 상황

### 백엔드 API
- ✅ 인증 (JWT, 카카오, Apple, 관리자)
- ✅ 재료/카테고리 CRUD + 엑셀 일괄등록
- ✅ 레시피 CRUD + 추천 TOP 10
- ✅ 즐겨찾기 + 검색기록 + S3
- ✅ 코칭 로그 + 등급
- ✅ 쇼츠 변환 + 캐싱
- ✅ 피드백 도메인
- ✅ 사용자 프로필 API (GET/PUT/DELETE /me)

### 관리자(백오피스) API
- ✅ Phase 1: Feedback 엔티티 + Repository 확장 + V5 마이그레이션
- ✅ Phase 2: 관리자 계정 CRUD (/api/admin/accounts)
- ✅ Phase 3: 사용자 관리 (/api/admin/users)
- ✅ Phase 4: 쇼츠 캐시 관리 (/api/admin/shorts)
- ✅ Phase 5: 피드백 관리 (/api/admin/feedback)
- ✅ Phase 6: 대시보드 (/api/admin/dashboard)
- ✅ Phase 7: 상세 통계 (/api/admin/stats)

### Flyway 마이그레이션
- ✅ V1: 초기 스키마
- ✅ V2: 카테고리 시드 데이터
- ✅ V3: 트리거
- ✅ V4: 쇼츠 변환 이력 테이블
- ✅ V5: Feedback updated_at 필드
- ✅ V6: enum 대소문자 제약조건 수정
- ✅ V7: 테스트 시드 데이터
- ✅ V8: 쇼츠 변환 로그 테이블
- ✅ V9: shorts_cache 유튜브 메타데이터 컬럼 (channel_name, original_title, duration_seconds)

### 테스트 (17개 파일, 전체 통과)
- ✅ JwtProvider, JwtAuthenticationFilter
- ✅ AuthService, AdminAuthService
- ✅ UserService, UserRank, User
- ✅ RecommendService
- ✅ CoachingService, FavoriteService, SearchHistoryService
- ✅ ShortsConvertService, ShortsCacheService
- ✅ AdminRecipeService, RecipeBulkUploadService
- ✅ S3FileService
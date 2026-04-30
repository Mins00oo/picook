# 백엔드 — Spring Boot

## 기술 스택
- Spring Boot 4.0.3 + Java 21 + Gradle
- Spring Security + JWT (액세스 1h, 리프레시 30d, bcrypt)
- Spring Data JPA + PostgreSQL 15 (Docker)
- Flyway (마이그레이션)
- 로컬 파일 저장소 (이미지 — /data/picook/uploads/)
- Apache POI (엑셀 파싱)

## 패키지 구조
```
com.picook/
├── PicookApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── JwtProvider.java
│   ├── JwtAuthenticationFilter.java
│   ├── CorsConfig.java
│   ├── RequestLoggingFilter.java
│   └── WebConfig.java
├── domain/
│   ├── auth/
│   │   ├── controller/AuthController.java
│   │   ├── service/AuthService.java
│   │   ├── service/KakaoAuthService.java
│   │   ├── service/AppleAuthService.java
│   │   └── dto/
│   ├── user/
│   │   ├── controller/UserController.java
│   │   ├── service/UserService.java
│   │   ├── service/UserLevelService.java
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
│   ├── cookbook/         ← 요리 완료 인증(별점/메모/사진 최대 4장)
│   │   ├── controller/CookbookController.java
│   │   ├── service/CookbookService.java
│   │   ├── entity/CookbookEntry.java, CookbookPhoto.java
│   │   └── dto/
│   ├── fridge/           ← 사용자 냉장고 재료 관리
│   ├── favorite/
│   │   ├── controller/FavoriteController.java
│   │   ├── service/FavoriteService.java
│   │   ├── entity/Favorite.java
│   │   └── dto/
│   ├── searchhistory/
│   ├── feedback/
│   ├── point/            ← 포인트 적립/소비
│   ├── attendance/       ← 출석체크
│   ├── outfit/           ← 의상 카탈로그(레벨업 시 지급)
│   ├── monitoring/       ← 운영 모니터링 (DAU/MAU 등)
│   ├── file/
│   │   ├── controller/FileController.java
│   │   └── service/LocalFileService.java
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
│       ├── subcategory/
│       │   ├── controller/AdminSubcategoryController.java
│       │   ├── service/AdminSubcategoryService.java
│       │   └── dto/
│       ├── outfit/
│       │   ├── controller/AdminOutfitController.java
│       │   ├── service/AdminOutfitService.java
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
    ├── aop/PerformanceLoggingAspect.java
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
| GET | /summary | 주요 지표 (사용자, 레시피, 등급분포) |
| GET | /charts | 차트 데이터 (?period=7d/30d/90d/custom) |
| GET | /rankings | 인기 레시피/재료 TOP, 최근 피드백 |

### 3. 레시피 관리 (/api/admin/recipes)
| GET | / | 목록 (?status, category, difficulty, keyword, page, size, sort) |
| GET | /{id} | 상세 (재료+단계+전부) |
| POST | / | 등록 (재료 매핑 + 단계 포함) |
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

### 6. 서브카테고리 관리 (/api/admin/subcategories)
| GET | / | 목록 (?categoryId 필터 가능) |
| POST | / | 등록 |
| PUT | /{id} | 수정 |
| DELETE | /{id} | 삭제 |
| PUT | /reorder | 순서 변경 |

### 7. 의상 카탈로그 관리 (/api/admin/outfits)
| GET | / | 의상 목록 |
| POST | / | 등록 (레벨 조건 등 포함) |
| PUT | /{id} | 수정 |
| DELETE | /{id} | 삭제 |

### 8. 사용자 관리 (/api/admin/users) — SUPER_ADMIN
| GET | / | 목록 (?status, loginType, levelMin, keyword, page, size) |
| GET | /{id} | 상세 (프로필+등급+활동) |
| PATCH | /{id}/suspend | 정지 (사유 필수) |
| PATCH | /{id}/activate | 해제 |
| GET | /{id}/completions | 완료 이력 (사진) |
| GET | /{id}/favorites | 즐겨찾기 |
| GET | /{id}/search-history | 검색 기록 |

### 9. 피드백 관리 (/api/admin/feedback)
| GET | / | 목록 (?status, rating, recipeId, page, size) |
| GET | /{id} | 상세 (레시피+사용자 정보) |
| PATCH | /{id}/status | 상태 (pending→reviewed→resolved) |
| PUT | /{id}/note | 관리자 메모 |
| GET | /summary | 요약 통계 (건수, 분포, 어려운 레시피 TOP) |

### 10. 상세 통계 (/api/admin/stats) — VIEWER+
| GET | /users | 가입추이, 로그인방식 분포, DAU/MAU, 리텐션 |
| GET | /recipes | 카테고리별, 난이도별, 인기 TOP 20 |
| GET | /ingredients | 인기 재료 TOP 20, 미사용 재료 목록 |
| GET | /ranking | 레벨 분포, 평균 레벨, 레벨업 추이, 사진 업로드율 |

### 11. 관리자 계정 관리 (/api/admin/accounts) — SUPER_ADMIN
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

### 요리북 (/api/v1/cookbook) — 요리 완료 인증
| POST /entries | 등록 (multipart: rating 1~5, memo ≤1000자, photos 최대 4장) |
| GET /entries | 본인 기록 목록 (페이징) |
| GET /entries/{id} | 본인 기록 상세 |
| GET /stats?yearMonth=YYYY-MM | 월별 요리 횟수 |

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
    .requestMatchers(HttpMethod.GET, "/api/admin/stats/**").hasAnyRole("SUPER_ADMIN", "CONTENT_ADMIN", "VIEWER")
    .requestMatchers("/api/admin/**").hasAnyRole("SUPER_ADMIN", "CONTENT_ADMIN")
    .requestMatchers("/api/v1/**").authenticated()
);
```

---

## 추천 알고리즘 (RecommendService)
```
입력: ingredientIds[], maxTime?, difficulty?, servings?
1. recipe_ingredients에서 사용자 재료와 교집합 계산 (양념 제외 — is_seasoning=false 메인재료만)
2. 매칭률 = 보유 메인재료 / 레시피 전체 메인재료
3. 매칭률 30% 미만 제외 (RecommendService.MIN_MATCH_RATE)
4. 시간/난이도/인분 필터 적용
5. 매칭률 DESC 정렬
6. TOP 10 반환 (부족 메인재료 + 부족 양념 별도)
```

## 요리 완료 인증 (CookbookService)
```
입력: recipeId, rating(1~5), memo(≤1000자), photos[] (최대 4장)
1. 사진 4장 초과 시 PHOTO_LIMIT_EXCEEDED (400)
2. 레시피 존재/미삭제 검증
3. CookbookEntry 저장 + 사진 LocalFileService.upload(..., "cookbook")
4. User.completedCookingCount +1
5. 사진 1장 이상이면:
   - 포인트 +50 (PointReason.COOKBOOK_ENTRY)
   - 경험치 +80 → UserLevelService.awardExp → 레벨업/의상 지급
6. 응답: sequenceNumber, leveledUp, newLevel, grantedOutfits 포함
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
4. CookbookService (사진 4장 제한, 보상 지급)
5. BulkUploadService (엑셀 파싱)
6. AdminRecipeService (CRUD + 상태)
7. AdminCategoryService (순서 변경)

---

## 개발 진행 상황

### 백엔드 API
- ✅ 인증 (JWT, 카카오, Apple, 관리자)
- ✅ 재료/카테고리/서브카테고리 CRUD + 엑셀 일괄등록
- ✅ 레시피 CRUD + 추천 TOP 10
- ✅ 즐겨찾기 + 검색기록
- ✅ 요리북 (별점/메모/사진 최대 4장 + 포인트·경험치·의상 보상)
- ✅ 포인트 / 출석체크 / 의상 카탈로그 / 냉장고
- ✅ 피드백 도메인
- ✅ 사용자 프로필 API (GET/PUT/DELETE /me)
- ✅ 운영 모니터링 (Lighthouse 연동, Prometheus 메트릭)

### 관리자(백오피스) API
- ✅ 관리자 계정 / 인증 (Phase 1~2)
- ✅ 사용자 / 피드백 관리 (Phase 3, 5)
- ✅ 대시보드 / 상세 통계 (Phase 6, 7)
- ✅ 의상 / 서브카테고리 관리

### Flyway 마이그레이션 (V1 ~ V24)
- V1~V3: 초기 스키마 + 카테고리 시드 + 트리거
- V5~V7: 피드백/enum/시드 보정
- V13: 관리자 비밀번호 보정
- V14~V18: 포인트, 출석, 요리북, 냉장고, 의상/경험치 리뉴얼
- V17: v1.0 정리 마이그레이션 (폐기 기능 테이블 DROP)
- V19~V24: 사용자/재료 보정, 메인재료·양념 분리

### 로깅 시스템
- ✅ logback-spring.xml (local: 콘솔 DEBUG / prod: 4파일 분리)
- ✅ RequestLoggingFilter (API 요청/응답/에러 로깅)
- ✅ PerformanceLoggingAspect (서비스 메서드 성능 측정)
- ✅ JwtAuthenticationFilter 인증 실패 로깅

#### prod 로그 파일 구조
| 파일 | 레벨 | 보관 | 용도 |
|------|------|------|------|
| `/var/log/picook/app.log` | INFO+ | 30일, 1GB | 일반 운영 로그 |
| `/var/log/picook/error.log` | ERROR | 90일, 500MB | 에러만 별도 수집 |
| `/var/log/picook/sql.log` | OFF (필요 시 활성화) | 7일 | SQL 쿼리 |
| `/var/log/picook/perf.log` | INFO | 30일 | 서비스 메서드 성능 |

### Spring Cache (재료/카테고리)
- ✅ CacheConfig.java — ConcurrentMapCacheManager("ingredients", "categories")
- ✅ IngredientService: getAllIngredients(), getCategories() → @Cacheable
- ✅ AdminIngredientService: create/update/delete → @CacheEvict("ingredients")
- ✅ IngredientBulkUploadService: uploadFromExcel → @CacheEvict("ingredients")
- ✅ AdminCategoryService: create/update/delete/reorder → @CacheEvict("categories")

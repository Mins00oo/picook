# 데이터베이스

## 기술
- PostgreSQL 15 (Docker)
- Flyway 마이그레이션 (backend/src/main/resources/db/migration/)
- 시드 데이터: database/seeds/
- 정제 스크립트: database/scripts/

## Docker 실행
```bash
cd backend
docker-compose up -d   # PostgreSQL 15 로컬 실행
# 접속: localhost:5432, DB: picook_db, User: picook_user
```

## 핵심 테이블 (MVP)

### MVP에 포함
- users (completed_cooking_count, coaching_enabled, cooking_level)
- ingredients, ingredient_categories, ingredient_synonyms
- recipes, recipe_ingredients, recipe_steps (step_type, duration_seconds, can_parallel)
- favorites
- coaching_logs, cooking_completions (등급)
- shorts_cache (url_hash, ai_model_version)
- search_history
- feedback
- admin_users
- daily_stats

### Phase 2로 연기
- ~~allergy_types, user_allergies, recipe_allergies~~ (알레르기 필터)
- ~~cooking_tools, user_tools, recipe_tools~~ (조리 도구 필터)

## 마이그레이션 규칙
- `V{번호}__{설명}.sql` (Flyway, 언더스코어 2개)
- 롤백 불가 → 신중히
- 위치: backend/src/main/resources/db/migration/

### 마이그레이션 순서
```
V1__init_schema.sql          # 전체 테이블 생성
V2__seed_categories.sql      # 재료 카테고리 9종
V3__triggers.sql             # coaching_ready + completed_cooking_count 트리거
V4__seed_ingredients.sql     # 초기 재료 데이터 (정제 후)
V5__seed_recipes.sql         # 초기 레시피 데이터 (정제 후)
```

## 트리거

### coaching_ready 자동 갱신
recipe_steps INSERT/UPDATE/DELETE 시 → 해당 recipes.coaching_ready 재계산
(모든 단계에 duration_seconds > 0이면 true)

### completed_cooking_count 자동 증가
cooking_completions INSERT 시 → users.completed_cooking_count + 1

---

## 데이터 정제 파이프라인

### 전체 흐름
```
[1단계] API 수집 (자동)
   식품안전나라 API → raw_recipes.json (전체 수집)
        ↓
[2단계] 재료 목록 추출 + 분류 (반자동)
   raw에서 재료명 추출 → Claude로 카테고리 분류 → 재료 DB 먼저 구축
        ↓
[3단계] 레시피 정제 (반자동)
   원본 JSON → Claude API 호출 → 우리 스키마 JSON (active/wait, duration 포함)
        ↓
[4단계] 엑셀 출력 + 수작업 검수 (수동)
   정제 JSON → 엑셀 변환 → 사람이 검수/수정
        ↓
[5단계] DB 투입
   검수 완료 엑셀 → 백오피스 엑셀 일괄등록 API
```

### 스크립트 목록 (database/scripts/)
```
database/scripts/
├── 00_extract_ingredients.py   # 원본에서 재료명 추출 → Claude로 카테고리 분류
├── 01_fetch_recipes.py         # 식품안전나라 API 전체 수집 → raw_recipes.json
├── 02_refine_with_claude.py    # Claude로 1차 정제 → refined_recipes.json
├── 03_export_to_excel.py       # 정제 결과 → 검수용 엑셀
└── prompts/
    ├── ingredient_classify.txt  # 재료 분류 프롬프트
    └── recipe_refine.txt        # 레시피 정제 프롬프트
```

### 데이터 소스
- 식품안전나라 조리식품 레시피 DB API
- 엔드포인트: `http://openapi.foodsafetykorea.go.kr/api/{API_KEY}/COOKRCP01/json/{start}/{end}`
- 한 번에 최대 100건, 페이징으로 전체 수집
- 예상 총 건수: 1,000~1,500건

### 원본 필드 → 우리 스키마 매핑
| 원본 필드 | 용도 | 정제 방법 |
|----------|------|----------|
| RCP_NM | 요리명 | 그대로 |
| RCP_PAT2 | 카테고리 | "반찬"/"국&찌개" 등 → "korean" 매핑 |
| RCP_WAY2 | 조리방식 | 참고 정보 |
| RCP_PARTS_DTLS | 재료 텍스트 | Claude가 파싱 (name, amount, unit, isRequired) |
| MANUAL01~20 | 조리 단계 | Claude가 정제 (분리, active/wait, duration) |
| MANUAL_IMG01~20 | 단계별 이미지 | URL 그대로 사용 |
| ATT_FILE_NO_MAIN | 대표 이미지 | URL 그대로 사용 |
| INFO_ENG/CAR/PRO/FAT/NA | 영양정보 | Phase 2 (저장은 해둠) |
| RCP_NA_TIP | 팁 | 그대로 |

### 원본 데이터 문제점 및 Claude 정제 대상
| 문제 | Claude 처리 |
|------|------------|
| 재료가 텍스트 덩어리 ("●양념장:", "[1인분]" 등 섞임) | 구분자 인식 → 개별 재료 파싱 |
| 재료명이 정규화 안 됨 ("칵테일새우" vs "새우") | 순수 재료명 추출 |
| "약간", "적당량" 정량화 불가 | amount: 0, unit: "" 표시 |
| 필수/선택 구분 없음 | 메인 재료=true, 양념/고명=false 판단 |
| 조리 단계에 쓰레기 문자 ("...건진다.a") | 제거 |
| 한 문장에 여러 작업 섞임 ("썰고 끓인다") | 단계 분리 |
| MANUAL01이 비어있고 02부터 시작하는 경우 | 순서 재정렬 |
| 난이도 정보 없음 | 단계 수 + 복잡도로 판단 |
| 소요시간 없음 | 단계별 시간 합산으로 추정 |
| step_type 없음 | 키워드 기반 active/wait 분류 |
| duration_seconds 없음 | 본문 시간 언급 or 합리적 추정 |

### Claude 정제 프롬프트 핵심 (prompts/recipe_refine.txt)
- 재료 파싱: 구분자 인식, 정규화, 필수/선택 판단
- 단계 정제: 분리, 쓰레기 제거, 초보 친화적으로 다듬기
- step_type: "썰다/볶다/섞다"→active, "끓이다/찌다/익히다"→wait
- duration_seconds: 본문 시간 있으면 그대로, 없으면 추정
- can_parallel: wait인데 지켜봐야 하면 false, 그냥 놔두면 true
- 출력: 순수 JSON만 (마크다운/설명 없이)

### 재료 DB 선행 구축 순서
```
1. 원본 전체 수집
2. 원본에서 재료명만 전부 추출 (중복 제거)
3. Claude로 카테고리 분류 + 정규화 + 동의어 생성
4. 엑셀로 출력 → 수작업 검수
5. 백오피스 엑셀 일괄등록으로 재료 DB 구축
6. 그 후에 레시피 정제 실행 (재료명 → DB ID 매핑 가능)
```

### 데이터 작업 일정
```
Week 1: 환경 세팅 + API 수집
  - 식품안전나라 API 키 발급
  - 수집 스크립트 실행
  - 재료 추출 + Claude 카테고리 분류
  - 재료 DB 구축 (엑셀 일괄등록)

Week 2~3: Claude 정제 실행
  - 프롬프트 테스트 (10건 품질 확인 → 조정)
  - 전체 정제 배치 실행
  - 엑셀 출력

Week 3~4: 수작업 검수
  - 코칭 테스트용 50개 우선 완료
  - 나머지 순차 검수 (레시피당 10~15분)

Week 5: DB 투입
  - 백오피스 엑셀 일괄등록
  - 코칭 모드 실테스트 → 문제 수정
```

### 목표 수량
- 재료: 300~500종
- 레시피: 300~500개 (전체 단계에 step_type + duration_seconds 완비)
- 코칭 테스트용 우선 완료: 50개
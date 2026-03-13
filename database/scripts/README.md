# 데이터 정제 스크립트

식품안전나라 공공데이터 → AI 정제 → 검수 → DB 투입 파이프라인

## 실행 순서

```
1. 환경 준비
   cp .env.example .env        # .env 파일 생성
   vi .env                     # API 키 입력
   pip install -r requirements.txt

2. 원본 수집
   python 01_fetch_recipes.py
   → seeds/raw_recipes.json 생성 (전체 레시피)

3. 재료 추출 + 분류
   python 00_extract_ingredients.py
   → seeds/ingredients_classified.json
   → seeds/ingredients_for_review.xlsx
   → 엑셀 검수 후 백오피스 일괄등록으로 재료 DB 구축

4. 레시피 정제
   python 02_refine_with_claude.py --test    # 먼저 5건 테스트
   python 02_refine_with_claude.py           # 전체 실행
   → seeds/refined_recipes.json

5. 검수용 엑셀 출력
   python 03_export_to_excel.py
   → seeds/recipes_for_review.xlsx
   → 엑셀 열어서 검수 (active/wait, duration, 재료 확인)

6. DB 투입
   → 검수 완료 엑셀을 백오피스 일괄등록으로 업로드
```

## 파일 구조

```
scripts/
├── 00_extract_ingredients.py   # 재료 추출 + Claude 분류
├── 01_fetch_recipes.py         # 식품안전나라 API 수집
├── 02_refine_with_claude.py    # Claude로 레시피 정제
├── 03_export_to_excel.py       # 검수용 엑셀 출력
├── prompts/
│   ├── ingredient_classify.txt # 재료 분류 프롬프트
│   └── recipe_refine.txt       # 레시피 정제 프롬프트
├── requirements.txt
├── .env.example
└── README.md (이 파일)
```

## 주의사항

- Claude API 비용: 레시피 1건당 약 $0.01~0.03 (claude-sonnet-4-20250514)
- 전체 1,000건 정제 시 약 $10~30
- 02 스크립트는 중간 저장 지원 (중단 후 재시작 가능)
- 정제 품질은 프롬프트에 의존 → prompts/ 파일을 개선하면 품질 향상

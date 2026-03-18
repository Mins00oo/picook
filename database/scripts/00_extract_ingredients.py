"""
00_extract_ingredients.py
원본 레시피에서 재료명을 추출하고, Claude로 카테고리 분류 + 정규화

사용법:
  1. 먼저 01_fetch_recipes.py를 실행하여 raw_recipes.json 생성
  2. .env 파일에 ANTHROPIC_API_KEY=sk-... 설정
  3. python 00_extract_ingredients.py

출력:
  - ingredients_classified.json (분류된 재료 목록)
  - ingredients_for_review.xlsx (검수용 엑셀)
"""

import json
import re
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

# Windows cp949 인코딩 문제 방지
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

load_dotenv(override=True)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not ANTHROPIC_API_KEY:
    print("❌ .env 파일에 ANTHROPIC_API_KEY를 설정해주세요.")
    exit(1)

import anthropic

SEEDS_DIR = Path(__file__).parent.parent / "seeds"
RAW_FILE = SEEDS_DIR / "raw_recipes.json"
OUTPUT_JSON = SEEDS_DIR / "ingredients_classified.json"
OUTPUT_EXCEL = SEEDS_DIR / "ingredients_for_review.xlsx"
PROMPT_FILE = Path(__file__).parent / "prompts" / "ingredient_classify.txt"

# Claude 설정
CLIENT = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
MODEL = "claude-sonnet-4-20250514"
BATCH_SIZE = 30  # 한 번에 분류할 재료 수 (JSON 잘림 방지)


def load_raw_recipes() -> list:
    """원본 레시피 JSON 로드."""
    if not RAW_FILE.exists():
        print(f"❌ {RAW_FILE} 파일이 없습니다. 먼저 01_fetch_recipes.py를 실행하세요.")
        exit(1)
    with open(RAW_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def extract_ingredient_names(recipes: list) -> tuple:
    """원본 RCP_PARTS_DTLS에서 재료명만 추출 (중복 제거 + 등장 횟수)."""
    name_counts = {}

    # 구분자/헤더 패턴 (라인 시작) — 이 패턴에 걸리면 라인 전체 스킵
    HEADER_RE = re.compile(
        r'^[●·•\[\(\*]'                             # 불릿/기호로 시작
        r'|^(양념장?|고명|소스|드레싱|반죽|육수'      # 카테고리 헤더
        r'|곁들임(채소)?|곁들이(채소|김치)?|밑간|절임물|피클물|숙성'
        r'|주재료|재료|필수\s*재료|추가\s*재료'
        r'|만두피|밀전병|볶음간장|샐러드|튀김'
        r'|리코타치즈|카레소스|크림소스|고추장소스'
        r'|된장소스|땅콩\s*소스|마요네즈드레싱'
        r'|참나물\s*페스토|토마토고추장소스|오이초절임소스'
        r'|레드와인소스|닭가슴살\s*:|소고기패티|국물\s*:)'
    )

    # 쓰레기 패턴 (추출 후 필터)
    GARBAGE_RE = re.compile(
        r'^\d'                          # 숫자로 시작 (100g, 2인분 등)
        r'|^[a-z]'                      # 영문 소문자로 시작 (ghen 등)
        r'|<br>'                        # HTML 잔해
        r'|^[.\s]+$'                    # 점/공백만
        r'|^\d+[가-힣]*\)$'            # "100g)" 같은 패턴
        r'|^흰색\)'                     # 파프리카 색상 잔해
        r'|인분\s*(기준)?'              # "1인분 기준" 등
        r'|^각$|^빨강\s*각$'            # "각", "빨강 각" 등 잔해
        r'|^블랙$|^흰추후$'             # 의미 없는 잔해
    )

    # "양념 다진 마늘", "재료 닭가슴살" 등에서 접두어 제거
    PREFIX_RE = re.compile(r'^(양념|재료|주재료|곁들임|간편식\s*재료)\s+')

    for recipe in recipes:
        parts = recipe.get("RCP_PARTS_DTLS", "")
        if not parts:
            continue

        seen_in_recipe = set()
        lines = parts.replace("\n", ",").split(",")

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # "- 카테고리 : 재료명(수량)" 패턴 → 콜론 뒤의 재료명만 추출
            dash_match = re.match(r'^[-\-•·●]\s*.+?\s*[:：]\s*(.+)', line)
            if dash_match:
                line = dash_match.group(1).strip()

            # 구분자/헤더 라인 스킵
            if HEADER_RE.match(line):
                continue

            # "이름 수량" 패턴에서 이름 추출
            match = re.match(r'^([가-힣a-zA-Z\s]+?)[\s]*[\d(]', line)
            if match:
                name = match.group(1).strip()
            else:
                name = re.split(r'\s+(약간|적당량|적량|조금|소량)', line)[0].strip()

            # 특수문자 제거
            name = re.sub(r'[·●•\[\]\-\""\(\)]', '', name).strip()

            # 접두어 제거: "양념 다진 마늘" → "다진 마늘"
            name = PREFIX_RE.sub('', name).strip()

            # 쓰레기 필터
            if not name or len(name) > 20:
                continue
            if GARBAGE_RE.search(name):
                continue
            # 순수 한글/영문/공백만 허용
            if not re.match(r'^[가-힣a-zA-Z\s]+$', name):
                continue

            if name not in seen_in_recipe:
                seen_in_recipe.add(name)
                name_counts[name] = name_counts.get(name, 0) + 1

    sorted_names = sorted(name_counts.keys())
    return sorted_names, name_counts


def load_prompt() -> str:
    """분류 프롬프트 로드."""
    with open(PROMPT_FILE, "r", encoding="utf-8") as f:
        return f.read()


def classify_batch(prompt_template: str, ingredient_names: list) -> list:
    """Claude를 사용하여 재료 배치를 분류한다."""
    names_text = "\n".join(f"- {name}" for name in ingredient_names)
    full_prompt = prompt_template + "\n\n## 분류할 재료 목록\n" + names_text

    response = CLIENT.messages.create(
        model=MODEL,
        max_tokens=8192,
        messages=[{"role": "user", "content": full_prompt}]
    )

    result_text = response.content[0].text

    # JSON 추출 (마크다운 코드블록 제거)
    result_text = re.sub(r'```json\s*', '', result_text)
    result_text = re.sub(r'```\s*', '', result_text)
    result_text = result_text.strip()

    try:
        return json.loads(result_text)
    except json.JSONDecodeError as e:
        # 잘린 JSON 복구 시도: 마지막 완전한 객체까지만 파싱
        try:
            last_brace = result_text.rfind('}')
            if last_brace > 0:
                truncated = result_text[:last_brace + 1] + ']'
                return json.loads(truncated)
        except json.JSONDecodeError:
            pass
        print(f"  ⚠️ JSON 파싱 실패: {e}")
        print(f"  응답 앞 200자: {result_text[:200]}")
        return []


def load_existing_classified() -> dict:
    """기존 분류 결과를 로드하여 재활용 인덱스를 구축한다."""
    if not OUTPUT_JSON.exists():
        return {}, {}

    with open(OUTPUT_JSON, "r", encoding="utf-8") as f:
        existing = json.load(f)

    by_original = {}
    by_normalized = {}
    for ing in existing:
        orig = ing.get("originalName", ing.get("name", ""))
        norm = ing.get("normalizedName", ing.get("name", ""))
        by_original[orig] = ing
        if norm not in by_normalized:
            by_normalized[norm] = ing

    return by_original, by_normalized


def classify_all_ingredients(ingredient_names: list) -> list:
    """전체 재료를 배치로 나누어 분류한다. 기존 결과가 있으면 재활용."""
    # 기존 분류 결과 로드
    by_original, by_normalized = load_existing_classified()

    reused = []
    need_classify = []

    for name in ingredient_names:
        if name in by_original:
            reused.append(by_original[name])
        elif name in by_normalized:
            reused.append(by_normalized[name])
        else:
            need_classify.append(name)

    print(f"♻️  기존 분류 재활용: {len(reused)}개")
    print(f"🆕 신규 분류 필요: {len(need_classify)}개")

    if not need_classify:
        print("   → Claude API 호출 불필요!")
        return reused

    # 신규만 Claude로 분류
    prompt_template = load_prompt()
    newly_classified = []

    total_batches = (len(need_classify) + BATCH_SIZE - 1) // BATCH_SIZE
    print(f"🔄 {len(need_classify)}개 재료를 {total_batches}배치로 분류...")

    for i in range(0, len(need_classify), BATCH_SIZE):
        batch = need_classify[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        print(f"\n  📦 배치 {batch_num}/{total_batches} ({len(batch)}개)...")

        try:
            classified = classify_batch(prompt_template, batch)
            newly_classified.extend(classified)
            print(f"  ✅ {len(classified)}개 분류 완료")
        except Exception as e:
            print(f"  ❌ 배치 {batch_num} 실패: {e}")
            for name in batch:
                newly_classified.append({
                    "name": name,
                    "normalizedName": name,
                    "category": "기타",
                    "synonyms": []
                })

        time.sleep(1)

    return reused + newly_classified


def save_json(classified: list):
    """분류 결과를 JSON으로 저장."""
    SEEDS_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(classified, f, ensure_ascii=False, indent=2)
    print(f"\n💾 JSON 저장: {OUTPUT_JSON} ({len(classified)}건)")


def save_excel(classified: list, name_counts: dict = None):
    """분류 결과를 검수용 엑셀로 저장."""
    try:
        import openpyxl
    except ImportError:
        print("⚠️ openpyxl 미설치. 엑셀 내보내기 건너뜀 (pip install openpyxl)")
        return

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "재료 분류"

    headers = ["No", "원본 재료명", "정규화 재료명", "카테고리", "동의어", "등장횟수", "검수OK"]
    ws.append(headers)

    for cell in ws[1]:
        cell.font = openpyxl.styles.Font(bold=True)

    for i, ing in enumerate(classified):
        synonyms_str = ", ".join(ing.get("synonyms", []))
        original = ing.get("originalName", ing.get("name", ""))
        count = name_counts.get(original, 0) if name_counts else 0
        ws.append([
            i + 1,
            original,
            ing.get("normalizedName", ing.get("name", "")),
            ing.get("category", "기타"),
            synonyms_str,
            count,
            ""
        ])

    ws.column_dimensions['A'].width = 6
    ws.column_dimensions['B'].width = 20
    ws.column_dimensions['C'].width = 20
    ws.column_dimensions['D'].width = 15
    ws.column_dimensions['E'].width = 40
    ws.column_dimensions['F'].width = 10
    ws.column_dimensions['G'].width = 10

    wb.save(OUTPUT_EXCEL)
    print(f"💾 엑셀 저장: {OUTPUT_EXCEL}")


def print_stats(classified: list):
    """분류 통계 출력."""
    categories = {}
    for ing in classified:
        cat = ing.get("category", "기타")
        categories[cat] = categories.get(cat, 0) + 1

    print("\n📊 카테고리별 분포:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}건")
    print(f"  총: {len(classified)}건")


if __name__ == "__main__":
    # 1. 원본 로드
    recipes = load_raw_recipes()
    print(f"📂 원본 레시피 {len(recipes)}건 로드")

    # 2. 재료명 추출
    ingredient_names, name_counts = extract_ingredient_names(recipes)
    print(f"🥬 고유 재료명 {len(ingredient_names)}개 추출")
    print(f"   샘플: {ingredient_names[:10]}")

    # 3. Claude로 분류
    classified = classify_all_ingredients(ingredient_names)

    # 4. 저장
    save_json(classified)
    save_excel(classified, name_counts)
    print_stats(classified)

    print("\n✅ 완료! ingredients_for_review.xlsx를 열어서 검수하세요.")
    print("   검수 후 백오피스 엑셀 일괄등록으로 재료 DB에 투입합니다.")

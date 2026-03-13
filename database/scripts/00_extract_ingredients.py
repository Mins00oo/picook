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
import time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

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
BATCH_SIZE = 80  # 한 번에 분류할 재료 수 (토큰 제한 고려)


def load_raw_recipes() -> list:
    """원본 레시피 JSON 로드."""
    if not RAW_FILE.exists():
        print(f"❌ {RAW_FILE} 파일이 없습니다. 먼저 01_fetch_recipes.py를 실행하세요.")
        exit(1)
    with open(RAW_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def extract_ingredient_names(recipes: list) -> list:
    """원본 RCP_PARTS_DTLS에서 재료명만 추출 (중복 제거)."""
    raw_names = set()

    for recipe in recipes:
        parts = recipe.get("RCP_PARTS_DTLS", "")
        if not parts:
            continue

        # 줄 단위로 분리
        lines = parts.replace("\n", ",").split(",")

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # 섹션 헤더 제거 ("●양념장 :", "고명", "[1인분]" 등)
            if re.match(r'^[●·\[\(]|^(양념장|고명|소스|드레싱|반죽|육수)', line):
                continue

            # 재료명 추출: "연두부 75g(3/4모)" → "연두부"
            # 패턴: 재료명 + 숫자 or 괄호
            match = re.match(r'^([가-힣a-zA-Z\s]+?)[\s]*[\d(]', line)
            if match:
                name = match.group(1).strip()
            else:
                # 숫자 없는 경우: "통깨 약간" → "통깨"
                name = re.split(r'\s+(약간|적당량|적량|조금|소량)', line)[0].strip()

            # 정리
            name = re.sub(r'[·●\[\]]', '', name).strip()

            if name and len(name) >= 1 and len(name) <= 20:
                raw_names.add(name)

    return sorted(list(raw_names))


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
        max_tokens=4096,
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
        print(f"  ⚠️ JSON 파싱 실패: {e}")
        print(f"  응답 앞 200자: {result_text[:200]}")
        return []


def classify_all_ingredients(ingredient_names: list) -> list:
    """전체 재료를 배치로 나누어 분류한다."""
    prompt_template = load_prompt()
    all_classified = []

    total_batches = (len(ingredient_names) + BATCH_SIZE - 1) // BATCH_SIZE
    print(f"🔄 총 {len(ingredient_names)}개 재료를 {total_batches}배치로 분류...")

    for i in range(0, len(ingredient_names), BATCH_SIZE):
        batch = ingredient_names[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        print(f"\n  📦 배치 {batch_num}/{total_batches} ({len(batch)}개)...")

        try:
            classified = classify_batch(prompt_template, batch)
            all_classified.extend(classified)
            print(f"  ✅ {len(classified)}개 분류 완료")
        except Exception as e:
            print(f"  ❌ 배치 {batch_num} 실패: {e}")
            # 실패한 배치의 재료는 "기타"로 기본 분류
            for name in batch:
                all_classified.append({
                    "name": name,
                    "normalizedName": name,
                    "category": "기타",
                    "synonyms": []
                })

        time.sleep(1)  # API 과부하 방지

    return all_classified


def save_json(classified: list):
    """분류 결과를 JSON으로 저장."""
    SEEDS_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(classified, f, ensure_ascii=False, indent=2)
    print(f"\n💾 JSON 저장: {OUTPUT_JSON} ({len(classified)}건)")


def save_excel(classified: list):
    """분류 결과를 검수용 엑셀로 저장."""
    try:
        import openpyxl
    except ImportError:
        print("⚠️ openpyxl 미설치. 엑셀 내보내기 건너뜀 (pip install openpyxl)")
        return

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "재료 분류"

    # 헤더
    headers = ["No", "원본 재료명", "정규화 재료명", "카테고리", "동의어", "검수OK"]
    ws.append(headers)

    # 헤더 스타일
    for cell in ws[1]:
        cell.font = openpyxl.styles.Font(bold=True)

    # 데이터
    for i, ing in enumerate(classified):
        synonyms_str = ", ".join(ing.get("synonyms", []))
        ws.append([
            i + 1,
            ing.get("originalName", ing.get("name", "")),
            ing.get("normalizedName", ing.get("name", "")),
            ing.get("category", "기타"),
            synonyms_str,
            ""  # 검수OK (비워둠)
        ])

    # 열 너비 조정
    ws.column_dimensions['A'].width = 6
    ws.column_dimensions['B'].width = 20
    ws.column_dimensions['C'].width = 20
    ws.column_dimensions['D'].width = 15
    ws.column_dimensions['E'].width = 40
    ws.column_dimensions['F'].width = 10

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
    ingredient_names = extract_ingredient_names(recipes)
    print(f"🥬 고유 재료명 {len(ingredient_names)}개 추출")
    print(f"   샘플: {ingredient_names[:10]}")

    # 3. Claude로 분류
    classified = classify_all_ingredients(ingredient_names)

    # 4. 저장
    save_json(classified)
    save_excel(classified)
    print_stats(classified)

    print("\n✅ 완료! ingredients_for_review.xlsx를 열어서 검수하세요.")
    print("   검수 후 백오피스 엑셀 일괄등록으로 재료 DB에 투입합니다.")

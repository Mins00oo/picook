"""
01_fetch_recipes.py
식품안전나라 조리식품 레시피 API에서 전체 데이터 수집

사용법:
  1. 식품안전나라(https://www.foodsafetykorea.go.kr/api/openApiInfo.do)에서 API 키 발급
  2. .env 파일에 FOOD_SAFETY_API_KEY=발급받은키 설정
  3. python 01_fetch_recipes.py

출력: raw_recipes.json (전체 원본 데이터)
"""

import requests
import json
import time
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(override=True)

API_KEY = os.getenv("FOOD_SAFETY_API_KEY")
if not API_KEY:
    print("❌ .env 파일에 FOOD_SAFETY_API_KEY를 설정해주세요.")
    print("   식품안전나라 API 키 발급: https://www.foodsafetykorea.go.kr/api/openApiInfo.do")
    exit(1)

BASE_URL = f"http://openapi.foodsafetykorea.go.kr/api/{API_KEY}/COOKRCP01/json"
BATCH_SIZE = 100  # API 한 번에 최대 100건
OUTPUT_DIR = Path(__file__).parent.parent / "seeds"
OUTPUT_FILE = OUTPUT_DIR / "raw_recipes.json"


MAX_RETRIES = 3


def fetch_batch(start: int, end: int) -> list:
    """API에서 start~end 범위의 레시피를 가져온다. 실패 시 최대 3회 재시도."""
    url = f"{BASE_URL}/{start}/{end}"

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            data = resp.json()

            result = data.get("COOKRCP01", {})
            code = result.get("RESULT", {}).get("CODE", "")

            if code == "INFO-000":
                return result.get("row", [])
            elif code == "INFO-200":
                return []
            else:
                msg = result.get("RESULT", {}).get("MSG", "알 수 없는 오류")
                print(f"  ⚠️ API 응답 코드: {code} — {msg}")
                return []
        except requests.exceptions.RequestException as e:
            print(f"  ⚠️ 요청 실패 ({start}~{end}), 시도 {attempt}/{MAX_RETRIES}: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(2 * attempt)
            else:
                print(f"  ❌ {MAX_RETRIES}회 재시도 실패 ({start}~{end})")
                return []


def fetch_all_recipes() -> list:
    """전체 레시피를 페이징으로 수집한다."""
    all_recipes = []
    start = 1

    print("🔄 식품안전나라 레시피 수집 시작...")
    print(f"   API: COOKRCP01")
    print(f"   배치 크기: {BATCH_SIZE}건")
    print()

    while True:
        end = start + BATCH_SIZE - 1
        rows = fetch_batch(start, end)

        if not rows:
            break

        all_recipes.extend(rows)
        print(f"  ✅ {start}~{end} → {len(rows)}건 수집 (누적: {len(all_recipes)}건)")

        start += BATCH_SIZE
        time.sleep(0.5)  # API 과부하 방지

    return all_recipes


def save_recipes(recipes: list):
    """수집한 데이터를 JSON으로 저장한다."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(recipes, f, ensure_ascii=False, indent=2)

    print(f"\n💾 저장 완료: {OUTPUT_FILE}")
    print(f"   총 {len(recipes)}건")


def print_sample(recipes: list):
    """수집 결과 샘플을 출력한다."""
    if not recipes:
        return

    print("\n📋 샘플 (첫 3건):")
    for r in recipes[:3]:
        name = r.get("RCP_NM", "?")
        category = r.get("RCP_PAT2", "?")
        method = r.get("RCP_WAY2", "?")
        # 조리 단계 수 카운트
        step_count = sum(1 for i in range(1, 21) if r.get(f"MANUAL{i:02d}", "").strip())
        print(f"  - {name} [{category}] {method} ({step_count}단계)")


def print_stats(recipes: list):
    """수집 데이터 통계를 출력한다."""
    if not recipes:
        return

    categories = {}
    methods = {}
    for r in recipes:
        cat = r.get("RCP_PAT2", "기타")
        method = r.get("RCP_WAY2", "기타")
        categories[cat] = categories.get(cat, 0) + 1
        methods[method] = methods.get(method, 0) + 1

    print("\n📊 카테고리별 분포:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}건")

    print("\n📊 조리방식별 분포:")
    for method, count in sorted(methods.items(), key=lambda x: -x[1]):
        print(f"  {method}: {count}건")


if __name__ == "__main__":
    recipes = fetch_all_recipes()

    if recipes:
        save_recipes(recipes)
        print_sample(recipes)
        print_stats(recipes)
    else:
        print("❌ 수집된 레시피가 없습니다. API 키를 확인해주세요.")

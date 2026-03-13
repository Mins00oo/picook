"""
02_refine_with_claude.py
원본 레시피를 Claude로 1차 정제 (active/wait, duration, 재료 파싱 등)

사용법:
  1. 먼저 01_fetch_recipes.py로 raw_recipes.json 생성
  2. 먼저 00_extract_ingredients.py로 재료 DB 구축 완료
  3. .env에 ANTHROPIC_API_KEY 설정
  4. python 02_refine_with_claude.py [--start 0] [--count 10] [--test]

옵션:
  --start N   : N번째 레시피부터 시작 (기본: 0)
  --count N   : N건만 처리 (기본: 전체)
  --test      : 첫 5건만 테스트 실행

출력: refined_recipes.json (정제된 전체 데이터)
"""

import json
import re
import os
import time
import argparse
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
OUTPUT_FILE = SEEDS_DIR / "refined_recipes.json"
PROGRESS_FILE = SEEDS_DIR / "refine_progress.json"  # 중간 저장 (재시작 대비)
PROMPT_FILE = Path(__file__).parent / "prompts" / "recipe_refine.txt"

CLIENT = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
MODEL = "claude-sonnet-4-20250514"


def load_raw_recipes() -> list:
    if not RAW_FILE.exists():
        print(f"❌ {RAW_FILE} 없음. 01_fetch_recipes.py를 먼저 실행하세요.")
        exit(1)
    with open(RAW_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def load_prompt() -> str:
    with open(PROMPT_FILE, "r", encoding="utf-8") as f:
        return f.read()


def load_progress() -> dict:
    """이전 진행 상황 로드 (중단 후 재시작 대비)."""
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"completed": {}, "failed": []}


def save_progress(progress: dict):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)


def refine_single_recipe(prompt_template: str, raw_recipe: dict) -> dict:
    """단일 레시피를 Claude로 정제한다."""
    raw_json = json.dumps(raw_recipe, ensure_ascii=False)
    full_prompt = prompt_template + "\n\n## 원본 데이터\n```json\n" + raw_json + "\n```"

    response = CLIENT.messages.create(
        model=MODEL,
        max_tokens=4096,
        messages=[{"role": "user", "content": full_prompt}]
    )

    result_text = response.content[0].text

    # JSON 추출
    result_text = re.sub(r'```json\s*', '', result_text)
    result_text = re.sub(r'```\s*', '', result_text)
    result_text = result_text.strip()

    parsed = json.loads(result_text)

    # 기본 검증
    if not parsed.get("title"):
        raise ValueError("title이 비어있음")
    if not parsed.get("steps") or len(parsed["steps"]) == 0:
        raise ValueError("steps가 비어있음")
    if not parsed.get("ingredients") or len(parsed["ingredients"]) == 0:
        raise ValueError("ingredients가 비어있음")

    # 원본 시퀀스 번호 보존 (추적용)
    parsed["_sourceSeq"] = raw_recipe.get("RCP_SEQ", "")
    parsed["_sourceName"] = raw_recipe.get("RCP_NM", "")

    return parsed


def refine_all(recipes: list, start: int, count: int):
    """전체 레시피를 정제한다."""
    prompt_template = load_prompt()
    progress = load_progress()

    end = min(start + count, len(recipes)) if count > 0 else len(recipes)
    target_recipes = recipes[start:end]

    print(f"🔄 정제 시작: {start}번 ~ {end - 1}번 (총 {len(target_recipes)}건)")
    print(f"   모델: {MODEL}")
    print(f"   이전 진행: {len(progress['completed'])}건 완료, {len(progress['failed'])}건 실패")
    print()

    success_count = 0
    fail_count = 0

    for i, raw in enumerate(target_recipes):
        seq = raw.get("RCP_SEQ", str(start + i))
        name = raw.get("RCP_NM", "?")
        idx = start + i

        # 이미 완료된 건 건너뛰기
        if seq in progress["completed"]:
            print(f"  [{idx}] ⏭️ {name} (이미 완료)")
            continue

        try:
            result = refine_single_recipe(prompt_template, raw)
            progress["completed"][seq] = result
            success_count += 1
            step_count = len(result.get("steps", []))
            ing_count = len(result.get("ingredients", []))
            print(f"  [{idx}] ✅ {name} → {step_count}단계, {ing_count}재료")
        except json.JSONDecodeError as e:
            progress["failed"].append({"seq": seq, "name": name, "error": f"JSON 파싱 실패: {e}"})
            fail_count += 1
            print(f"  [{idx}] ❌ {name} — JSON 파싱 실패")
        except ValueError as e:
            progress["failed"].append({"seq": seq, "name": name, "error": str(e)})
            fail_count += 1
            print(f"  [{idx}] ❌ {name} — {e}")
        except Exception as e:
            progress["failed"].append({"seq": seq, "name": name, "error": str(e)})
            fail_count += 1
            print(f"  [{idx}] ❌ {name} — {e}")

        # 10건마다 중간 저장
        if (i + 1) % 10 == 0:
            save_progress(progress)
            print(f"  💾 중간 저장 ({len(progress['completed'])}건)")

        time.sleep(1)  # API 과부하 방지

    # 최종 저장
    save_progress(progress)

    # 결과 파일 생성
    all_refined = list(progress["completed"].values())
    SEEDS_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_refined, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 50}")
    print(f"✅ 정제 완료")
    print(f"   성공: {success_count}건 (이번 실행)")
    print(f"   실패: {fail_count}건 (이번 실행)")
    print(f"   누적 완료: {len(progress['completed'])}건")
    print(f"   누적 실패: {len(progress['failed'])}건")
    print(f"   저장: {OUTPUT_FILE}")

    if progress["failed"]:
        print(f"\n⚠️ 실패 목록:")
        for f_item in progress["failed"][-10:]:  # 최근 10건만
            print(f"   - [{f_item['seq']}] {f_item['name']}: {f_item['error']}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="레시피 AI 정제")
    parser.add_argument("--start", type=int, default=0, help="시작 인덱스")
    parser.add_argument("--count", type=int, default=0, help="처리 건수 (0=전체)")
    parser.add_argument("--test", action="store_true", help="테스트 모드 (5건만)")
    parser.add_argument("--reset", action="store_true", help="진행 상황 초기화")
    args = parser.parse_args()

    if args.reset and PROGRESS_FILE.exists():
        PROGRESS_FILE.unlink()
        print("🗑️ 진행 상황 초기화됨")

    if args.test:
        args.count = 5
        print("🧪 테스트 모드 (5건)")

    recipes = load_raw_recipes()
    print(f"📂 원본 {len(recipes)}건 로드")

    refine_all(recipes, args.start, args.count)

    print("\n다음 단계: python 03_export_to_excel.py")

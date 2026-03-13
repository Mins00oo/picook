"""
03_export_to_excel.py
정제된 레시피를 검수용 엑셀로 내보내기

사용법:
  1. 먼저 02_refine_with_claude.py로 refined_recipes.json 생성
  2. pip install openpyxl
  3. python 03_export_to_excel.py

출력: recipes_for_review.xlsx (3개 시트: 레시피, 재료, 조리단계)
"""

import json
from pathlib import Path

try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
except ImportError:
    print("❌ openpyxl 미설치. 설치 후 실행하세요:")
    print("   pip install openpyxl")
    exit(1)

SEEDS_DIR = Path(__file__).parent.parent / "seeds"
INPUT_FILE = SEEDS_DIR / "refined_recipes.json"
OUTPUT_FILE = SEEDS_DIR / "recipes_for_review.xlsx"

# 스타일
HEADER_FONT = Font(bold=True, size=11)
HEADER_FILL = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
HEADER_FONT_WHITE = Font(bold=True, size=11, color="FFFFFF")
ACTIVE_FILL = PatternFill(start_color="D6E4F0", end_color="D6E4F0", fill_type="solid")
WAIT_FILL = PatternFill(start_color="FFF2CC", end_color="FFF2CC", fill_type="solid")
THIN_BORDER = Border(
    left=Side(style='thin'), right=Side(style='thin'),
    top=Side(style='thin'), bottom=Side(style='thin')
)


def load_refined() -> list:
    if not INPUT_FILE.exists():
        print(f"❌ {INPUT_FILE} 없음. 02_refine_with_claude.py를 먼저 실행하세요.")
        exit(1)
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def style_header(ws, col_count: int):
    """헤더 행 스타일 적용."""
    for col in range(1, col_count + 1):
        cell = ws.cell(row=1, column=col)
        cell.font = HEADER_FONT_WHITE
        cell.fill = HEADER_FILL
        cell.alignment = Alignment(horizontal='center')
        cell.border = THIN_BORDER


def create_recipe_sheet(wb, recipes: list):
    """시트1: 레시피 기본정보."""
    ws = wb.active
    ws.title = "레시피"

    headers = [
        "No", "요리명", "카테고리", "난이도", "시간(분)", "인분",
        "단계수", "재료수", "팁", "대표이미지URL", "원본SEQ", "검수OK", "비고"
    ]
    ws.append(headers)
    style_header(ws, len(headers))

    for i, r in enumerate(recipes):
        step_count = len(r.get("steps", []))
        ing_count = len(r.get("ingredients", []))

        ws.append([
            i + 1,
            r.get("title", ""),
            r.get("category", ""),
            r.get("difficulty", ""),
            r.get("cookingTimeMinutes", ""),
            r.get("servings", ""),
            step_count,
            ing_count,
            r.get("tips", ""),
            r.get("mainImage", ""),
            r.get("_sourceSeq", ""),
            "",  # 검수OK
            ""   # 비고
        ])

    # 열 너비
    widths = [6, 25, 12, 10, 10, 8, 8, 8, 50, 50, 10, 10, 20]
    for i, w in enumerate(widths):
        ws.column_dimensions[openpyxl.utils.get_column_letter(i + 1)].width = w

    # 데이터 테두리
    for row in ws.iter_rows(min_row=2, max_row=len(recipes) + 1, max_col=len(headers)):
        for cell in row:
            cell.border = THIN_BORDER

    print(f"  📋 레시피 시트: {len(recipes)}행")


def create_ingredient_sheet(wb, recipes: list):
    """시트2: 재료."""
    ws = wb.create_sheet("재료")

    headers = [
        "레시피No", "요리명", "재료명", "수량", "단위", "필수여부", "검수OK", "비고"
    ]
    ws.append(headers)
    style_header(ws, len(headers))

    row_count = 0
    for i, r in enumerate(recipes):
        for ing in r.get("ingredients", []):
            ws.append([
                i + 1,
                r.get("title", ""),
                ing.get("name", ""),
                ing.get("amount", ""),
                ing.get("unit", ""),
                "필수" if ing.get("isRequired", True) else "선택",
                "",  # 검수OK
                ""   # 비고
            ])
            row_count += 1

    # 열 너비
    widths = [10, 25, 20, 10, 10, 10, 10, 20]
    for i, w in enumerate(widths):
        ws.column_dimensions[openpyxl.utils.get_column_letter(i + 1)].width = w

    for row in ws.iter_rows(min_row=2, max_row=row_count + 1, max_col=len(headers)):
        for cell in row:
            cell.border = THIN_BORDER

    print(f"  🥬 재료 시트: {row_count}행")


def create_step_sheet(wb, recipes: list):
    """시트3: 조리단계 (active/wait 색상 구분)."""
    ws = wb.create_sheet("조리단계")

    headers = [
        "레시피No", "요리명", "단계", "설명", "타입(active/wait)",
        "시간(초)", "병렬가능", "이미지URL", "검수OK", "비고"
    ]
    ws.append(headers)
    style_header(ws, len(headers))

    row_num = 2
    for i, r in enumerate(recipes):
        for step in r.get("steps", []):
            step_type = step.get("stepType", "active")

            row_data = [
                i + 1,
                r.get("title", ""),
                step.get("stepNumber", ""),
                step.get("description", ""),
                step_type,
                step.get("durationSeconds", ""),
                "Y" if step.get("canParallel", True) else "N",
                step.get("imageUrl", ""),
                "",  # 검수OK
                ""   # 비고
            ]
            ws.append(row_data)

            # active/wait 색상 구분
            fill = ACTIVE_FILL if step_type == "active" else WAIT_FILL
            for col in range(1, len(headers) + 1):
                cell = ws.cell(row=row_num, column=col)
                cell.fill = fill
                cell.border = THIN_BORDER

            row_num += 1

    # 열 너비
    widths = [10, 25, 8, 60, 15, 10, 10, 50, 10, 20]
    for i, w in enumerate(widths):
        ws.column_dimensions[openpyxl.utils.get_column_letter(i + 1)].width = w

    # 설명 열 자동 줄바꿈
    for row in ws.iter_rows(min_row=2, max_row=row_num - 1, min_col=4, max_col=4):
        for cell in row:
            cell.alignment = Alignment(wrap_text=True)

    print(f"  👨‍🍳 조리단계 시트: {row_num - 2}행 (🔵active / 🟡wait 색상 구분)")


def create_summary_sheet(wb, recipes: list):
    """시트4: 요약 통계."""
    ws = wb.create_sheet("요약통계")

    # 기본 통계
    total = len(recipes)
    categories = {}
    difficulties = {}
    total_steps = 0
    active_steps = 0
    wait_steps = 0

    for r in recipes:
        cat = r.get("category", "?")
        diff = r.get("difficulty", "?")
        categories[cat] = categories.get(cat, 0) + 1
        difficulties[diff] = difficulties.get(diff, 0) + 1
        for step in r.get("steps", []):
            total_steps += 1
            if step.get("stepType") == "active":
                active_steps += 1
            else:
                wait_steps += 1

    ws.append(["항목", "값"])
    ws.append(["총 레시피", total])
    ws.append(["총 조리단계", total_steps])
    ws.append(["active 단계", active_steps])
    ws.append(["wait 단계", wait_steps])
    ws.append([])

    ws.append(["카테고리", "건수"])
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        ws.append([cat, count])
    ws.append([])

    ws.append(["난이도", "건수"])
    for diff, count in sorted(difficulties.items(), key=lambda x: -x[1]):
        ws.append([diff, count])

    ws.column_dimensions['A'].width = 20
    ws.column_dimensions['B'].width = 15

    for row in ws.iter_rows(min_row=1, max_row=ws.max_row, max_col=2):
        for cell in row:
            cell.border = THIN_BORDER

    print(f"  📊 요약통계 시트 생성")


if __name__ == "__main__":
    recipes = load_refined()
    print(f"📂 정제 레시피 {len(recipes)}건 로드")
    print()

    wb = openpyxl.Workbook()

    create_recipe_sheet(wb, recipes)
    create_ingredient_sheet(wb, recipes)
    create_step_sheet(wb, recipes)
    create_summary_sheet(wb, recipes)

    SEEDS_DIR.mkdir(parents=True, exist_ok=True)
    wb.save(OUTPUT_FILE)

    print(f"\n💾 저장 완료: {OUTPUT_FILE}")
    print()
    print("📝 검수 방법:")
    print("  1. 엑셀을 열어 각 시트를 확인합니다")
    print("  2. 조리단계 시트에서 active(파랑)/wait(노랑) 분류가 맞는지 확인")
    print("  3. duration_seconds가 합리적인지 확인")
    print("  4. 재료의 필수/선택 구분이 맞는지 확인")
    print("  5. 검수OK 칸에 O 표시 (문제 있으면 비고에 메모)")
    print("  6. 검수 완료 후 백오피스 엑셀 일괄등록으로 DB에 투입")

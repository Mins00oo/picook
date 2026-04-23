# Picook Characters — v2.1 (Chefs)

요리하는 사람 3인방. 동물의 숲 감성의 치비 2등신. 공용 바디 위에 헤어스타일·얼굴·기본 의상만 달라지는 구조라 의상 6슬롯(머리·상의·하의·신발·양손)이 세 캐릭터 모두에 자연스럽게 걸림.

**디자이너 프리뷰 보드**: `docs/ui_prototype/picook_characters_v2.0.html`

## 파일

| 파일 | Type enum | 이름 | 성격 | 비주얼 시그니처 |
|---|---|---|---|---|
| `min.svg`  | `MIN`  | 민   | 단정한 신입 셰프      | 검은 보브컷 · 흰 T · 베이지 바지 · 갈색 단화 |
| `roo.svg`  | `ROO`  | 루   | 열정 라이징 셰프      | 주황 포니테일 · 오렌지 줄무늬 티 · 흰 운동화 |
| `haru.svg` | `HARU` | 하루 | 느긋 홈쿡             | 버터 비니 · 졸린 눈 · 파스텔 블루 티 · 청바지 |

모든 파일은 `viewBox="0 0 100 100"` 통일 + `width/height="512"`.

## 해부학 좌표계 (의상 제작 시 참고)

| 부위 | 영역 (viewBox 100×100) |
|---|---|
| 머리(피부+헤어)   | y 0~56, cx 50 |
| 목                | x 46~54, y 51~59 |
| 몸통              | x 36~64, y 58~84 (rx 7) |
| 팔(소매)          | (36,64)→(28,80) / (64,64)→(72,80) 곡선 |
| 손                | cx 28 / 72, cy 81, r 4 |
| 다리              | x 41~48 / 52~59, y 80~94 |
| 발                | cx 44.5 / 55.5, cy 95, rx 7.5 ry 3.2 |

의상 SVG는 같은 `viewBox 100×100`으로 만들되 해당 슬롯 영역만 채움. 예:
- **head** (모자): y -2~18
- **top** (상의): y 58~84 (기본 티셔츠 위에 겹침)
- **bottom** (하의): y 80~95
- **shoes** (신발): cy 95 발 영역
- **leftHand**: cx 28, cy 81 중심
- **rightHand**: cx 72, cy 81 중심

## RN 컴포넌트

- `mobile/src/components/brand/MinCharacter.tsx`
- `mobile/src/components/brand/RooCharacter.tsx`
- `mobile/src/components/brand/HaruCharacter.tsx`
- `mobile/src/components/brand/Character.tsx` — 디스패처

앱 내에서는 컴포넌트를 쓰고, 이 SVG들은 **스토어 프로모·브랜딩 자료·디자이너 리뷰용 마스터**.

## 튜닝 지점

- **헤어 컬러**: 민=`#2A1F1C` / 루=`#C4642A` / 하루 비니=`#FFD66E`.
- **기본 의상 컬러**: 각 파일 중간의 `rect x=36` (몸통) / `rect x=41,52` (다리) / `ellipse cy=95` (발).
- **표정**: 세 캐릭터가 **눈·입 좌표는 같음**, 다만 눈 모양만 다름 (민=점, 루=반짝+별, 하루=졸린 호).
- **피부톤**: 민=`#FCE4D0` / 루=`#E8C9A5` / 하루=`#EBC9A5`.

## 백엔드 enum 변경 영향 (CLI-2 작업)

- `User.characterType` VARCHAR(20) 값: `'EGG'|'POTATO'|'CARROT'` → **`'MIN'|'ROO'|'HARU'`**
- 기존 유저 데이터 마이그레이션 필요:
  - `EGG`  → `MIN` (가장 온건한 매핑)
  - `POTATO` → `HARU` (둘 다 차분한 성격 매핑)
  - `CARROT` → `ROO` (둘 다 활발한 성격 매핑)
- enum 제약(있다면) 업데이트 + V?? Flyway 마이그레이션에 UPDATE 문 포함.

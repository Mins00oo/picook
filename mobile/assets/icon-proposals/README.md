# Picook App Icon — Proposals v1.0

앱 홈 화면에 들어갈 대표 심볼 후보 8종. 각 SVG는 `viewBox="0 0 100 100"` 기준으로 작성됐고 `width/height="1024"` 속성이 걸려 있어서 바로 렌더하면 App Store 제출용 1024×1024 마스터가 뽑힌다.

**비교 보드**: `docs/ui_prototype/picook_app_icon_v1.0.html` — 브라우저로 열면 8개 전부 + 사이즈별 축소 + 다크 배경 컨텍스트까지 한눈에 보임.

## 후보 목록

| # | 파일 | 컨셉 | 분위기 | 작은 사이즈 가독성 |
|---|------|------|--------|---------------------|
| V1 | `v1-fresh-skillet.svg`    | 프라이팬 + 계란 프라이       | 친숙 · 신선    | ★★★★☆ |
| V2 | `v2-chefs-p.svg`          | 굵은 P + 상단 셰프 모자       | 모던 · 브랜드 | ★★★★★ |
| V3 | `v3-egg-chef.svg`         | 앱 캐릭터(계란) 그대로        | 귀여움 · 따뜻  | ★★★☆☆ |
| V4 | `v4-steaming-pot.svg`     | 김 + 냄비 (기존 PotSymbol 개선) | 집밥 · 전통   | ★★★★☆ |
| V5 | `v5-minimal-aperture.svg` | 오렌지 링 + 노른자            | 미니멀       | ★★★★★ |
| V6 | `v6-spatula-heart.svg`    | 하트 모양 뒤집개              | 감성 · 애정   | ★★★★☆ |
| V7 | `v7-carrot-dash.svg`      | 대각선 당근 한 컷             | 신선 · 위트   | ★★★★☆ |
| V8 | `v8-fire-pot.svg`         | 어두운 바탕 위 불꽃 + 동냄비    | 프리미엄 · 무드 | ★★★★☆ |

## 선택 후 작업 순서

1. HTML 보드를 브라우저에서 열고 최종 후보 1개 선정.
2. 해당 SVG를 **1024×1024 PNG**로 렌더.
   - macOS: `rsvg-convert -w 1024 -h 1024 vX.svg -o icon.png`
   - 또는 Inkscape / Figma 임포트 후 Export.
3. `mobile/assets/icon.png` 덮어쓰기.
4. Android adaptive icon 도 같이 쓰려면
   `mobile/assets/android-icon-foreground.png` (1024×1024 중앙 안전영역 66%) 와
   `mobile/assets/android-icon-background.png` (1024×1024 배경 단색 or gradient) 로 분리.
   V1·V4·V6·V8처럼 배경 컬러가 진하면 foreground는 중앙 심볼만 트림해서 쓰는 게 좋음.
5. `mobile/app.json` 의 `icon`/`adaptiveIcon` 경로는 이미 이 PNG들을 가리키고 있으므로 추가 수정 없음.
6. Expo 캐시 리셋: `npx expo start -c`.

## 커스텀 · 리믹스

- 모든 SVG는 `viewBox="0 0 100 100"` 정사각 기반이라 수치 조정이 직관적.
- 파일 내 `<linearGradient>`/`<radialGradient>` id는 파일마다 독립적(HTML 보드와 달리 각자 `bg`, `yolk` 같은 짧은 이름). 이걸 HTML 묶음에 다시 합치고 싶으면 id 충돌 주의.
- 팔레트는 `mobile/src/constants/theme.ts` 와 1:1 대응. 톤 변경 필요 시 먼저 theme 쪽과 합의.

# 냉장고 레시피 앱 — 프로젝트 컨텍스트

## 프로젝트 개요
제품명은 "Picook"
냉장고 재료 기반 레시피 추천 iOS 앱.
1인 개발, 모노레포.

## 기획 문서
`/docs/` 디렉토리에 전체 기획·설계 문서가 있음. 개발 전 반드시 참고할 것.
- `docs/01_기획안.md` — 프로젝트 배경, 핵심 기능, 타겟, 경쟁분석, 비즈니스 모델, 일정
- `docs/02_화면별_요구사항.md` — 모든 화면 상세 스펙 (사용자 앱 + 백오피스)
- `docs/03_기능_요구사항.md` — FR-USR/FR-ADM/NFR 전체 요구사항
- `docs/04_프론트엔드_기술문서.md` — 모바일 + 백오피스 기술 스택, 구조, 패턴
- `docs/05_백엔드_기술문서.md` — Spring Boot 설계, DB 스키마, API 설계
- `docs/06_인프라_문서.md` — 아키텍처, 배포, CI/CD, 모니터링, 비용

## 시스템 아키텍처

```
[iOS App - React Native Expo]  [백오피스 - React Vite]
              │                          │
              ▼                          ▼
      [Spring Boot 4.0.3 — 모놀리식 단일 서버]
      │  인증(JWT)  │  사용자 API   │  관리자 API  │
      │  레시피 추천 │  요리 완료 인증 │  파일 업로드 │
      │  포인트/레벨/의상  │  엑셀 일괄등록           │
              │
      [Docker PostgreSQL 15]     [로컬 파일 저장소]
```

## 기술 스택 (확정)

### 백엔드
- **Spring Boot 4.0.3** + **Java 21 LTS** + **Gradle**
- Spring Security + JWT (액세스 1h, 리프레시 30d)
- Spring Data JPA + PostgreSQL 15 (Docker)
- Flyway (DB 마이그레이션)
- 로컬 파일 저장소 (이미지 업로드 — /data/picook/uploads/)
- Apache POI (엑셀 일괄등록)

### 모바일 (iOS)
- React Native (Expo SDK 52+) + TypeScript
- expo-router (파일 기반 라우팅)
- Zustand (상태) + @tanstack/react-query (서버 상태)
- expo-notifications, expo-av
- expo-image-picker, expo-clipboard
- @react-native-seoul/kakao-login
- expo-apple-authentication

### 백오피스 (웹)
- React + Vite + TypeScript
- Ant Design 5.x
- SheetJS xlsx (엑셀 파싱)
- axios

### 인프라
- 서버: AWS EC2 / Lightsail
- DB: Docker PostgreSQL 15
- 스토리지: 서버 로컬 디스크 (/data/picook/uploads/)
- 모바일 빌드: Expo EAS
- 백오피스 호스팅: Vercel
- 모니터링: Sentry
- CI/CD: GitHub Actions (변경 디렉토리 감지 배포)

## 모노레포 디렉토리 구조

```
picook/                    ← 루트
├── CLAUDE.md                  ← 이 파일
├── docs/                      ← 기획·설계 문서
├── backend/                   ← Spring Boot
│   ├── CLAUDE.md
│   ├── build.gradle.kts
│   ├── secrets.env            ← 환경변수 (gitignore)
│   └── src/main/java/com/picook/
│       ├── config/            ← Security, JWT, WebConfig, CORS
│       ├── domain/
│       │   ├── auth/          ← Apple, 카카오, JWT
│       │   ├── user/          ← 사용자, 프로필, 등급
│       │   ├── ingredient/    ← 재료, 카테고리, 서브카테고리, 동의어
│       │   ├── recipe/        ← 레시피, 단계, 추천
│       │   ├── cookbook/      ← 요리 완료 인증 (별점/메모/사진)
│       │   ├── fridge/        ← 사용자 냉장고
│       │   ├── favorite/      ← 즐겨찾기
│       │   ├── searchhistory/ ← 검색 이력
│       │   ├── feedback/      ← 피드백 (엔티티)
│       │   ├── point/         ← 포인트 적립/사용
│       │   ├── attendance/    ← 출석체크
│       │   ├── outfit/        ← 의상 카탈로그/장착
│       │   ├── monitoring/    ← 운영 모니터링
│       │   ├── file/          ← 파일 업로드 (LocalFileService)
│       │   └── admin/         ← 백오피스 API + 엑셀 일괄등록
│       └── global/            ← 예외처리, 응답, 페이징
├── mobile/                    ← React Native (Expo)
│   ├── CLAUDE.md
│   ├── app/                   ← expo-router 탭 라우팅
│   └── src/
│       ├── api/               ← 서버 API 호출
│       ├── hooks/, stores/, components/, types/, utils/
├── admin/                     ← 백오피스 (React)
│   ├── CLAUDE.md
│   └── src/pages/, api/, components/
├── shared/                    ← 프론트 공유 타입
│   └── types/
├── database/                  ← DB 마이그레이션 + 시드
│   ├── CLAUDE.md
│   ├── migrations/            ← Flyway SQL
│   ├── seeds/                 ← 초기 데이터 (엑셀)
│   └── scripts/               ← AI 정제 스크립트
└── infra/                     ← 인프라 설정
    ├── docker-compose.yml     ← 전체 로컬 환경 (postgres + backend + vector)
    ├── nginx/
    └── scripts/               ← deploy.sh, backup.sh
```

## 핵심 기능 요약 (v1.0)

### 1. 재료 기반 추천
- 사용자가 사전 등록 재료 목록에서 체크 (자유입력 없음 → 정규화 문제 해결)
- 양념(소금/간장/마늘 등)은 매칭률 계산 제외 — 메인재료 기준
- 매칭률 = 보유 메인재료 / 레시피 전체 메인재료 × 100%
- 시간/난이도/인분 필터
- 매칭률 30%+ → TOP 10개 반환 (부족 메인재료 + 부족 양념 별도 표시)

### 2. 요리 완료 인증
- 별점(1~5) + 메모(≤1000자) + 사진 최대 4장 등록
- 사진 1장 이상이면 보상 지급: 포인트 +50, 경험치 +80
- 경험치 → 레벨업 시 의상(outfit) 자동 지급
- 본인 기록만 조회 가능 (월별 통계 제공)

### 3. 등급 시스템
- 요리 완료 + 사진 업로드 = 경험치 적립 → 레벨업
- Lv.1(병아리) ~ Lv.7(전설)
- 레벨업 시 축하 애니메이션 + 의상 지급

### 4. 출석체크 / 포인트 / 의상
- 일일 출석체크로 포인트 적립
- 포인트로 의상 카탈로그에서 구매·장착
- 레벨업 시 일부 의상 자동 지급

## API 규칙
- 사용자: `/api/v1/**`
- 관리자: `/api/admin/**`
- 인증 공개: `/api/auth/**`
- 응답: `{ "status": "success"|"error", "data": {...}, "error": { "code", "message" } }`
- 인증: Bearer JWT
- 페이지네이션: `?page=0&size=10` (Spring 기본)

## 인증 흐름
- Apple Sign-In: 클라이언트 identityToken → 서버에서 Apple 공개키 검증 → JWT 발급
- 카카오: 클라이언트 카카오 SDK 토큰 → 서버에서 카카오 API(`kapi.kakao.com/v2/user/me`)로 검증 → JWT 발급

## 코딩 규칙
- Java: 도메인 패키지 구조, 각 도메인 아래 controller/service/repository/dto/entity
- TypeScript: 컴포넌트 PascalCase, 훅 useXxx, 유틸 camelCase, 상수 UPPER_SNAKE
- 커밋: feat/fix/refactor/style/docs/chore
- 커밋 메시지에 Co-Authored-By 줄 넣지 않기

## v1.0 출시에서 제외된 기능 (Phase 2 이후 검토)
- 유튜브 쇼츠 URL → 레시피 변환 (yt-dlp + Whisper + GPT 파이프라인)
- 음성 코칭 모드 (단계별 TTS, 멀티 동시 진행)
- 조리 도구 필터, 알레르기 필터
- 다른 사용자 등급/요리 기록 공개

위 기능들은 1인 개발 공수와 v1.0 우선순위를 고려해 출시 범위에서 제외했습니다. 관련 코드/마이그레이션은 `V17__v1_cleanup_and_fridge.sql` 등에서 정리됨.

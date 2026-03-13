# Picook

냉장고 재료 기반 레시피 추천 + 음성 코칭 + 유튜브 쇼츠 변환 iOS 앱

## 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | Spring Boot 4.0.3 + Java 21 + PostgreSQL 15 |
| 모바일 | React Native (Expo SDK 52+) + TypeScript |
| 백오피스 | React + Vite + Ant Design 5.x |
| 인프라 | AWS EC2 + S3 + Docker + GitHub Actions |

## 모노레포 구조

```
picook/
├── backend/    — Spring Boot API 서버
├── mobile/     — React Native iOS 앱
├── admin/      — 백오피스 웹
├── shared/     — 프론트엔드 공유 타입
├── database/   — 마이그레이션, 시드, 데이터 정제 스크립트
├── infra/      — Docker, Nginx, 배포 스크립트
└── docs/       — 기획·설계 문서
```

## 로컬 개발

### 사전 요구사항
- Java 21 (temurin)
- Node.js 20+
- Docker & Docker Compose
- Expo CLI (`npm install -g expo-cli`)

### 1. 데이터베이스 실행
```bash
cd backend
docker compose up -d
```

### 2. 백엔드 실행
```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'
```

### 3. 모바일 실행
```bash
cd mobile
npm install
npx expo start
```

### 4. 백오피스 실행
```bash
cd admin
npm install
npm run dev
```

## 문서
- `docs/01_기획안.md` — 프로젝트 배경, 핵심 기능
- `docs/02_화면별_요구사항.md` — 화면 상세 스펙
- `docs/03_기능_요구사항.md` — 전체 요구사항
- `docs/04_프론트엔드_기술문서.md` — 모바일 + 백오피스
- `docs/05_백엔드_기술문서.md` — API, DB 스키마
- `docs/06_인프라_문서.md` — 배포, CI/CD

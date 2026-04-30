# ============================================
# Picook — Spring Boot Dockerfile
# 위치: /opt/picook/app/backend/Dockerfile
# ============================================

# === 1단계: 빌드 ===
FROM gradle:8.14-jdk21 AS builder
WORKDIR /build

# 의존성 캐싱: 빌드 스크립트만 먼저 복사하여 의존성 다운로드 레이어를 분리
# (소스만 변경되면 이 단계는 캐시 히트 → 빌드 시간 대폭 단축)
COPY settings.gradle.kts build.gradle.kts gradle.properties ./
RUN gradle dependencies --no-daemon

# 소스 복사 후 빌드 (bootJar는 test 태스크를 실행하지 않음)
COPY src ./src
RUN gradle bootJar --no-daemon

# === 2단계: 실행 ===
FROM eclipse-temurin:21-jre

WORKDIR /app

# non-root 유저 생성 + 로그 디렉토리 (logback-spring.xml prod 프로파일이 /var/log/picook 사용)
RUN groupadd -r picook && useradd -r -g picook picook && \
    mkdir -p /var/log/picook && \
    chown -R picook:picook /app /var/log/picook

COPY --from=builder --chown=picook:picook /build/build/libs/*.jar app.jar

USER picook

ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

# ============================================
# Picook — Spring Boot Dockerfile
# 위치: /opt/picook/app/backend/Dockerfile
# ============================================

# === 1단계: 빌드 ===
FROM gradle:8.14-jdk21 AS builder
WORKDIR /build
COPY . .
RUN gradle bootJar --no-daemon

# === 2단계: 실행 ===
FROM eclipse-temurin:21-jre

WORKDIR /app

# 로그 디렉토리 생성
RUN mkdir -p /var/log/picook

# yt-dlp + ffmpeg 설치
RUN apt-get update && apt-get install -y python3 python3-pip curl xz-utils && \
    pip3 install yt-dlp --break-system-packages && \
    apt-get clean

# ffmpeg 정적 바이너리 설치
RUN curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o ffmpeg.tar.xz && \
    tar xf ffmpeg.tar.xz && \
    mv ffmpeg-*-static/ffmpeg /usr/local/bin/ && \
    mv ffmpeg-*-static/ffprobe /usr/local/bin/ && \
    rm -rf ffmpeg.tar.xz ffmpeg-*-static

# 빌드된 JAR 복사
COPY --from=builder /build/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
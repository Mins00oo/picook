# backend/Dockerfile
FROM container-registry.oracle.com/java/jdk:21

# yt-dlp + ffmpeg 설치
RUN microdnf install -y python3 python3-pip ffmpeg \
    && pip3 install yt-dlp \
    && microdnf clean all

COPY build/libs/picook-backend.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
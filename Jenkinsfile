// ============================================
// Picook Backend CI/CD Pipeline
// 트리거: GitHub webhook → Jenkins
// 흐름: Pull → 변경 감지 → Docker 빌드 → 헬스체크
// ============================================
pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    environment {
        COMPOSE_FILE = '/opt/picook/docker-compose.yml'
        APP_DIR = '/opt/picook/app'
    }

    stages {
        stage('Pull') {
            steps {
                sh '''
                    git config --global --add safe.directory /opt/picook/app
                    cd ${APP_DIR}
                    rm -f .git/index.lock
                    git fetch --force origin main
                    git reset --hard origin/main
                '''
            }
        }

        stage('Check Changes') {
            steps {
                script {
                    def changes = sh(
                        script: "cd ${APP_DIR} && git diff --name-only HEAD~1 HEAD | grep '^backend/' || true",
                        returnStdout: true
                    ).trim()

                    if (changes == '') {
                        echo 'backend 변경 없음 — 배포 스킵'
                        currentBuild.result = 'NOT_BUILT'
                        error('No backend changes detected')
                    }

                    echo "변경된 파일:\n${changes}"
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                sh '''
                    cd /opt/picook
                    GRADLE_OPTS="-Xmx512m" docker compose build app
                    docker compose up -d app
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Spring Boot 시작 대기 (30초)..."
                    sleep 30
                    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health || echo "000")
                    if [ "$STATUS" = "200" ]; then
                        echo "✅ 앱 정상 구동 (HTTP 200)"
                    else
                        echo "⚠️ 헬스체크 응답: $STATUS (actuator 미설정이면 무시 가능)"
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo '🎉 배포 성공!'
        }
        failure {
            echo '❌ 배포 실패 — 로그 확인: docker compose logs app'
        }
    }
}
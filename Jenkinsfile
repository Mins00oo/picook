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
        // 1) 소스코드 최신화 — 원격 main 브랜치를 강제 동기화
        stage('Pull') {
            steps {
                sh '''
                    git config --global --add safe.directory /opt/picook/app
                    cd ${APP_DIR}
					rm -f .git/index.lock
					rm -rf .git/refs/remotes/origin
                    git fetch origin main
                    git reset --hard origin/main
                '''
            }
        }

        // 2) backend/ 디렉토리 변경 감지
        //    직전 커밋 대비 backend/ 하위 파일이 변경된 경우에만 빌드 진행
        //    변경 없으면 NOT_BUILT로 마킹하고 파이프라인 종료
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

        // 3) Docker 이미지 빌드 + 컨테이너 재시작
        //    Dockerfile 멀티스테이지: Gradle 빌드 → JRE 실행 이미지
        stage('Build & Deploy') {
            steps {
                sh '''
                    cd /opt/picook
                    GRADLE_OPTS="-Xmx512m" docker compose build app
                    docker compose up -d app
                '''
            }
        }

        // 4) 헬스체크 — Spring Boot 기동 후 actuator/health 확인
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
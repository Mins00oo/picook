#!/bin/bash
# =============================================
# Picook Backend Deploy Script (EC2)
# Usage: ./deploy.sh
# =============================================
set -euo pipefail

APP_NAME="picook-backend"
DEPLOY_DIR="/opt/picook"
JAR_NAME="${APP_NAME}.jar"
REPO_URL="https://github.com/YOUR_USERNAME/picook.git"
BRANCH="main"

echo "=== Picook Backend Deployment ==="

# Pull latest code
cd "${DEPLOY_DIR}"
git pull origin "${BRANCH}"

# Build
cd backend
./gradlew clean build -x test

# Stop existing process
if pgrep -f "${JAR_NAME}" > /dev/null; then
    echo "Stopping existing process..."
    pkill -f "${JAR_NAME}" || true
    sleep 5
fi

# Copy new jar
cp build/libs/*.jar "${DEPLOY_DIR}/${JAR_NAME}"

# Start
echo "Starting ${APP_NAME}..."
nohup java -jar "${DEPLOY_DIR}/${JAR_NAME}" \
    --spring.profiles.active=prod \
    > "${DEPLOY_DIR}/logs/app.log" 2>&1 &

echo "Deployment complete. PID: $!"

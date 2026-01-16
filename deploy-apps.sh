#!/bin/bash

# Deployment script for Gutzo Customer and Partner Apps
# Usage: ./deploy-apps.sh [app_name]
# app_name: 'customer', 'partner', or leave empty for both

set -e

PROJECT_ID="gutzo-478017"
REGION="us-central1"
ROOT_DIR=$(pwd)

# Function to deploy an app
deploy_app() {
  APP_NAME=$1
  SERVICE_NAME="gutzo-${APP_NAME}-app"
  APP_DIR="apps/${APP_NAME}"
  
  echo "🚀 Deploying Gutzo ${APP_NAME} App to Google Cloud Run"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Service Name: ${SERVICE_NAME}"
  echo "Directory: ${APP_DIR}"

  if [ ! -d "${APP_DIR}" ]; then
    echo "❌ Error: Directory ${APP_DIR} does not exist."
    return 1
  fi

  # Copy root nginx.conf to app dir for Docker build context if it doesn't exist
  # We'll use the one from root 
  cp nginx.conf "${APP_DIR}/nginx.deploy.conf"

  cd "${APP_DIR}"

  # Create a temporary Dockerfile that includes environment variables at build time
  # Note: Environment variables are hardcoded here based on deploy-simple.sh
  cat > Dockerfile.deploy << 'EOF'
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# Set environment variables directly (baked into build)
ENV VITE_SUPABASE_URL="https://api.gutzo.in/service"
ENV VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"
ENV VITE_SUPABASE_FUNCTION_URL="https://api.gutzo.in"
ENV VITE_DUMMY_LOGIN=true
ENV VITE_GOOGLE_MAPS_API_KEY="AIzaSyCHTG5c0iMf2Sme31nBFDKXxOm460AGZlA"

RUN npm run build

FROM nginx:stable-alpine
RUN apk add --no-cache gettext
COPY nginx.deploy.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/build /usr/share/nginx/html

RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'export PORT=${PORT:-8080}' >> /docker-entrypoint.sh && \
    echo 'envsubst "\$PORT" < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/ || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
EOF

  echo "📦 Building container image..."
  
  # Temporarily rename any existing Dockerfile to avoid conflict if it exists
  if [ -f "Dockerfile" ]; then
    mv Dockerfile Dockerfile.original
  fi
  mv Dockerfile.deploy Dockerfile

  # Build image
  gcloud builds submit --tag gcr.io/${PROJECT_ID}/${SERVICE_NAME} .

  # Restore original Dockerfile
  mv Dockerfile Dockerfile.deploy
  if [ -f "Dockerfile.original" ]; then
    mv Dockerfile.original Dockerfile
  fi
  rm Dockerfile.deploy
  rm nginx.deploy.conf

  echo "🚀 Deploying container to Cloud Run..."
  gcloud run deploy ${SERVICE_NAME} \
    --image gcr.io/${PROJECT_ID}/${SERVICE_NAME} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1

  SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)')
  echo "✅ ${APP_NAME} app deployed! Live at: ${SERVICE_URL}"
  echo ""
  
  cd "${ROOT_DIR}"
}

# Main execution
TARGET=$1

if [ -z "$TARGET" ]; then
  echo "Deploying ALL apps..."
  deploy_app "customer"
  deploy_app "partner"
elif [ "$TARGET" == "customer" ]; then
  deploy_app "customer"
elif [ "$TARGET" == "partner" ]; then
  deploy_app "partner"
else
  echo "Unknown app: $TARGET"
  echo "Usage: ./deploy-apps.sh [customer|partner]"
  exit 1
fi

echo "🎉 All requested deployments completed!"

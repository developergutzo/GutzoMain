#!/bin/bash

# Simple deployment script that builds locally with env vars
set -e

PROJECT_ID="project-6733e5b0-e5f8-4631-895"
REGION="us-central1"
SERVICE_NAME="gutzo-app"

echo "🚀 Deploying Gutzo to Google Cloud Run"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create a temporary Dockerfile that includes environment variables at build time
cat > Dockerfile.deploy << 'EOF'
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# Set environment variables directly (will be baked into the build)
ENV VITE_SUPABASE_URL="https://api.gutzo.in/service"
ENV VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE"
ENV VITE_SUPABASE_FUNCTION_URL="https://api.gutzo.in"
ENV VITE_DUMMY_LOGIN=true
ENV VITE_GOOGLE_MAPS_API_KEY="AIzaSyA5P5eNfyXHcd-Qoy5NDlDQPmTg5olfHZY"

RUN npm run build

FROM nginx:stable-alpine
RUN apk add --no-cache gettext
COPY nginx.conf /etc/nginx/templates/default.conf.template
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

echo "📦 Deploying with hardcoded environment variables..."

# Temporarily rename the original Dockerfile
mv Dockerfile Dockerfile.original

# Use the deploy Dockerfile
mv Dockerfile.deploy Dockerfile

# 1. Build the container image using Cloud Build (streams logs to console)
echo "🔨 Building container image..."
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${SERVICE_NAME} .

# 2. Deploy the built image to Cloud Run
echo "🚀 Deploying container to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${SERVICE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1

# Restore original Dockerfile
mv Dockerfile Dockerfile.deploy
mv Dockerfile.original Dockerfile

# Clean up
rm -f Dockerfile.deploy

echo ""
echo "✅ Deployment complete!"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)')
echo "🌐 Your app is live at: ${SERVICE_URL}"

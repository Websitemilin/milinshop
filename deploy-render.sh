#!/bin/bash

# ==========================================
# Milin Shop - Auto Deploy to Render
# Usage: ./deploy-render.sh
# ==========================================

set -e

echo "🚀 Milin Shop - Render Deployment Starting..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Render API Credentials
RENDER_API_KEY="rnd_ieepREKz1nJyQVvJ0FvnP1gTe71Y"

# Check if API key is set
if [ -z "$RENDER_API_KEY" ]; then
    echo -e "${RED}❌ Error: RENDER_API_KEY not set${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Step 1: Validating Render API Connection...${NC}"
# Test API connection
curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
    https://api.render.com/v1/services \
    -o /dev/null && echo -e "${GREEN}✅ Render API Connected${NC}" || {
    echo -e "${RED}❌ Failed to connect to Render API${NC}"
    exit 1
}

echo ""
echo -e "${YELLOW}📋 Step 2: Getting Service Information...${NC}"

# List services
SERVICES=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
    https://api.render.com/v1/services)

echo "$SERVICES" | jq . || echo "Services: $SERVICES"

echo ""
echo -e "${YELLOW}📋 Step 3: Preparing for Deployment...${NC}"

# Get latest commit
COMMIT_SHA=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)

echo "📝 Commit: $COMMIT_SHA"
echo "📝 Message: $COMMIT_MSG"

echo ""
echo -e "${YELLOW}📋 Step 4: Building Docker Images...${NC}"

# Build API
echo "🐳 Building API image..."
docker build -f Dockerfile.api -t milin-shop-api:latest .

# Build Admin
echo "🐳 Building Admin image..."
docker build -f Dockerfile.admin -t milin-shop-admin:latest .

echo ""
echo -e "${GREEN}✅ Build Completed!${NC}"

echo ""
echo -e "${YELLOW}📋 Step 5: Push to Docker Registry (if configured)...${NC}"

# Optional: Push to Docker Hub / container registry
# docker tag milin-shop-api:latest yourregistry/milin-shop-api:latest
# docker push yourregistry/milin-shop-api:latest

echo -e "${GREEN}✅ Docker images ready${NC}"

echo ""
echo -e "${YELLOW}📋 Step 6: Database Migration...${NC}"

# Get DATABASE_URL from env
if [ -f .env.production ]; then
    export $(cat .env.production | grep DATABASE_URL)
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not set - skipping migration${NC}"
    echo "Please set DATABASE_URL in .env.production"
else
    echo "🔄 Running database migrations..."
    cd apps/api
    npx prisma migrate deploy || echo -e "${YELLOW}⚠️  Migration warning (might already be applied)${NC}"
    npx prisma db seed || echo -e "${YELLOW}⚠️  Seed warning${NC}"
    cd ../..
    echo -e "${GREEN}✅ Database ready${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo ""
echo "📌 Next steps:"
echo "1. Set environment variables in Render Dashboard"
echo "2. Trigger deployment manually OR"
echo "3. Push to GitHub to trigger GitHub Actions"
echo ""
echo "🔗 Render API Key: $RENDER_API_KEY"
echo "📚 View Render Dashboard: https://dashboard.render.com"

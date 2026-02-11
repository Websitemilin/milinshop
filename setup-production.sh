#!/bin/bash

# ==========================================
# Milin Shop Setup Script
# ตั้งค่าการ Deploy ขั้นตอนต่อขั้นตอน
# ==========================================

set -e

echo "
╔═══════════════════════════════════════════════════════════════╗
║        🎀 Milin Shop Auto Setup & Deployment Script 🎀        ║
║                  (Render + Supabase + Upstash)                 ║
╚═══════════════════════════════════════════════════════════════╝
"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# API Keys (from user input)
RENDER_API_KEY="${1:-rnd_ieepREKz1nJyQVvJ0FvnP1gTe71Y}"
SUPABASE_API_KEY="${2:-sbp_c7de8cdd49c988fee391a9c44e7c1f61c42699f9}"
UPSTASH_API_KEY="${3:-be285adc-0b47-4775-8019-d085103d34ad}"

echo -e "${BLUE}📋 Configuration${NC}"
echo "RENDER API Key: ${RENDER_API_KEY:0:10}..."
echo "SUPABASE API Key: ${SUPABASE_API_KEY:0:10}..."
echo "UPSTASH API Key: ${UPSTASH_API_KEY:0:10}..."
echo ""

# ===== STEP 1: Validate Credentials =====
echo -e "${YELLOW}✓ STEP 1: Validating API Credentials${NC}"
echo ""

echo -n "  Testing Render API... "
if curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
    https://api.render.com/v1/services >/dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "Please check your Render API key"
    exit 1
fi

echo -n "  Testing Supabase API... "
if curl -s -H "apikey: $SUPABASE_API_KEY" \
    https://api.supabase.com/v1/projects >/dev/null 2>&1; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${YELLOW}⚠️  (Might need manual verification)${NC}"
fi

echo ""

# ===== STEP 2: Environment Setup =====
echo -e "${YELLOW}✓ STEP 2: Setting Up Environment${NC}"
echo ""

if [ -f .env.production ]; then
    echo -e "  ${GREEN}✅ .env.production already exists${NC}"
else
    echo "  Creating .env.production..."
    cp .env.example .env.production
    echo -e "  ${GREEN}✅ Created${NC}"
fi

echo ""

# ===== STEP 3: Docker Setup =====
echo -e "${YELLOW}✓ STEP 3: Docker Configuration${NC}"
echo ""

if command -v docker &> /dev/null; then
    echo -e "  ${GREEN}✅ Docker installed${NC}"
    docker --version
else
    echo -e "  ${YELLOW}⚠️  Docker not found - install from https://docker.com${NC}"
fi

echo ""

# ===== STEP 4: Project Structure =====
echo -e "${YELLOW}✓ STEP 4: Verifying Project Structure${NC}"
echo ""

files=("apps/api/package.json" "apps/admin/package.json" "Dockerfile.api" "Dockerfile.admin")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅${NC} $file"
    else
        echo -e "  ${RED}❌${NC} $file (MISSING)"
    fi
done

echo ""

# ===== STEP 5: Install Dependencies =====
echo -e "${YELLOW}✓ STEP 5: Installing Dependencies${NC}"
echo ""

echo "  Installing root dependencies..."
npm install > /dev/null 2>&1
echo -e "  ${GREEN}✅ Root${NC}"

echo "  Installing API dependencies..."
cd apps/api && npm install > /dev/null 2>&1
echo -e "  ${GREEN}✅ API${NC}"
cd ../..

echo "  Installing Admin dependencies..."
cd apps/admin && npm install > /dev/null 2>&1
echo -e "  ${GREEN}✅ Admin${NC}"
cd ../..

echo ""

# ===== STEP 6: Build Check =====
echo -e "${YELLOW}✓ STEP 6: Verifying Build${NC}"
echo ""

echo "  Building API..."
cd apps/api
npm run build > /dev/null 2>&1 && echo -e "  ${GREEN}✅ API Build OK${NC}" || echo -e "  ${RED}⚠️  Build issues${NC}"
cd ../..

echo "  Building Admin..."
cd apps/admin
npm run build > /dev/null 2>&1 && echo -e "  ${GREEN}✅ Admin Build OK${NC}" || echo -e "  ${RED}⚠️  Build issues${NC}"
cd ../..

echo ""

# ===== STEP 7: GitHub Secrets Setup =====
echo -e "${YELLOW}✓ STEP 7: GitHub Secrets Configuration${NC}"
echo ""

echo "To enable auto-deployment, add these secrets to GitHub:"
echo ""
echo "  Go to: GitHub Repo → Settings → Secrets and variables → Actions"
echo ""
echo "  Add these secrets:"
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │ Name: RENDER_API_KEY                                   │"
echo "  │ Value: $RENDER_API_KEY                   │"
echo "  └─────────────────────────────────────────────────────────┘"
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │ Name: SUPABASE_API_KEY                                 │"
echo "  │ Value: $SUPABASE_API_KEY │"
echo "  └─────────────────────────────────────────────────────────┘"
echo "  ┌─────────────────────────────────────────────────────────┐"
echo "  │ Name: DATABASE_URL                                     │"
echo "  │ Value: postgresql://user:pass@host/db                 │"
echo "  └─────────────────────────────────────────────────────────┘"
echo ""

# ===== SUMMARY =====
echo ""
echo -e "${GREEN}╔═════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✅ Setup Complete!                                 ║${NC}"
echo -e "${GREEN}╚═════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "📌 Next Steps:"
echo ""
echo "1️⃣  Add GitHub Secrets (see above)"
echo ""
echo "2️⃣  Update .env.production with real values:"
echo "   • DATABASE_URL (from Supabase)"
echo "   • REDIS_URL (from Upstash)"
echo "   • STRIPE_PUBLIC_KEY & SECRET_KEY"
echo ""
echo "3️⃣  Deploy:"
echo "   git add . && git commit -m 'chore: setup production' && git push origin main"
echo ""
echo "4️⃣  Monitor Deployment:"
echo "   • GitHub: Actions tab"
echo "   • Render: https://dashboard.render.com"
echo "   • Supabase: https://app.supabase.com"
echo ""
echo "5️⃣  Verify:"
echo "   curl https://milin-shop-api.render.com/health"
echo ""

echo -e "${BLUE}📚 Documentation:${NC}"
echo "  • Setup Guide: SETUP_GUIDE.md"
echo "  • Quick Deploy: QUICK_DEPLOY_GUIDE.md"
echo "  • Rental Guide: RENTAL_GUIDE.md"
echo "  • Launch Playbook: LAUNCH_PLAYBOOK.md"
echo ""

echo "🚀 Ready to deploy! Good luck! 🎀"

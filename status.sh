#!/bin/bash

# ==========================================
# Deployment Status Monitor
# Shows what's deployed and what's pending
# ==========================================

clear

echo "
╔═══════════════════════════════════════════════════════════════╗
║          🎀 Milin Shop - Deployment Status 🎀                ║
║                  February 11, 2026                            ║
╚═══════════════════════════════════════════════════════════════╝
"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📊 INFRASTRUCTURE STATUS${NC}"
echo ""

echo "Service Status:"
echo ""

echo -n "  Render API Key: "
if [ ! -z "$RENDER_API_KEY" ] || grep -q "rnd_ieepREKz1nJyQVvJ0FvnP1gTe71Y" /workspaces/milinshop/.env.production 2>/dev/null; then
    echo -e "${GREEN}✅ Configured${NC}"
else
    echo -e "${YELLOW}⏳ Pending${NC}"
fi

echo -n "  Supabase API Key: "
if [ ! -z "$SUPABASE_API_KEY" ] || grep -q "sbp_c7de8cdd49c988fee391a9c44e7c1f61c42699f9" /workspaces/milinshop/.env.production 2>/dev/null; then
    echo -e "${GREEN}✅ Configured${NC}"
else
    echo -e "${YELLOW}⏳ Pending${NC}"
fi

echo -n "  Upstash API Key: "
if [ ! -z "$UPSTASH_API_KEY" ] || grep -q "be285adc-0b47-4775-8019-d085103d34ad" /workspaces/milinshop/.env.production 2>/dev/null; then
    echo -e "${GREEN}✅ Configured${NC}"
else
    echo -e "${YELLOW}⏳ Pending${NC}"
fi

echo ""
echo -e "${BLUE}🔧 CONFIGURATION FILES${NC}"
echo ""

declare -a files=(
    ".env.production"
    "Dockerfile.api"
    "Dockerfile.admin"
    ".github/workflows/deploy.yml"
    "QUICK_DEPLOY_GUIDE.md"
    "setup-production.sh"
    "deploy-render.sh"
)

for file in "${files[@]}"; do
    if [ -f "/workspaces/milinshop/$file" ]; then
        size=$(wc -c < "/workspaces/milinshop/$file" | numfmt --to=iec 2>/dev/null || wc -c < "/workspaces/milinshop/$file")
        echo -e "  ${GREEN}✅${NC} $file ($size)"
    else
        echo -e "  ${YELLOW}⏳${NC} $file (Pending)"
    fi
done

echo ""
echo -e "${BLUE}📋 DEPLOYMENT CHECKLIST${NC}"
echo ""

echo "Required Actions:"
echo ""
echo "  [ ] 1. Update .env.production with real connection strings"
echo "       • DATABASE_URL from Supabase Dashboard"
echo "       • REDIS_URL from Upstash Console"
echo "       • STRIPE_KEYS from Stripe Dashboard"
echo ""

echo "  [ ] 2. Add GitHub Secrets"
echo "       Go to: GitHub Repo → Settings → Secrets → New"
echo "       • RENDER_API_KEY=rnd_ieepREKz1nJyQVvJ0FvnP1gTe71Y"
echo "       • DATABASE_URL=postgresql://..."
echo "       • REDIS_URL=redis://..."
echo "       • STRIPE_SECRET_KEY=sk_test_..."
echo ""

echo "  [ ] 3. Verify Databases"
echo "       • Supabase: https://app.supabase.com → Check tables created"
echo "       • Upstash: https://console.upstash.com → Check connection"
echo ""

echo "  [ ] 4. Deploy to GitHub"
echo "       $ git add ."
echo "       $ git commit -m 'chore: production deployment setup'"
echo "       $ git push origin main"
echo "       • GitHub Actions will auto-run"
echo "       • Check: Repo → Actions tab"
echo ""

echo "  [ ] 5. Verify Deployment"
echo "       • Render: https://dashboard.render.com"
echo "       • Test API: curl https://milin-shop-api.render.com/health"
echo "       • Test Admin: https://milin-shop.vercel.app"
echo ""

echo -e "${BLUE}🎯 SUCCESS CRITERIA${NC}"
echo ""

echo "After deployment completes, you should see:"
echo ""
echo "  ✓ API running at https://milin-shop-api.render.com"
echo "  ✓ Admin dashboard at https://milin-shop.vercel.app"
echo "  ✓ Database tables created in Supabase"
echo "  ✓ Can login with admin@milinshop.com / admin123"
echo "  ✓ Stripe payments in test mode (card: 4242 4242 4242 4242)"
echo ""

echo -e "${BLUE}📞 SUPPORT${NC}"
echo ""
echo "Stuck? Check:"
echo "  • QUICK_DEPLOY_GUIDE.md - Step-by-step guide"
echo "  • SETUP_GUIDE.md - Detailed configuration"
echo "  • LAUNCH_PLAYBOOK.md - Operations guide"
echo ""

echo "🚀 Ready to deploy! Push to GitHub whenever you're ready."
echo ""

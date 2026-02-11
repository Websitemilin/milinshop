#!/bin/bash

# ==========================================
# Milin Shop - Automated Setup Complete
# ==========================================

set -e

clear

echo "
╔════════════════════════════════════════════════════════════════╗
║     🎀 Milin Shop - Final Setup Automation 🎀                 ║
║              ตั้งค่าอัตโนมัติ - Final Steps                    ║
╚════════════════════════════════════════════════════════════════╝
"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Current setup status
echo -e "${BLUE}📊 Current Status:${NC}"
echo ""
echo "✅ Supabase Project      : ypmlpwdnquwwldtrkhnq"
echo "✅ Supabase URL          : https://ypmlpwdnquwwldtrkhnq.supabase.co"
echo "✅ Supabase Anon Key     : (stored in .env.production)"
echo "✅ Stripe Publishable    : sb_publishable_bXOZaQRyZ4h2TFKAZ2Efbg_1FOqTf1d"
echo ""
echo "⏳ Still needed:"
echo "  1. DATABASE_URL from Supabase Connection Pooling"
echo "  2. STRIPE_SECRET_KEY from Stripe Dashboard"
echo ""

# Function to update .env safely
update_env() {
    local key=$1
    local value=$2
    
    if [ -z "$value" ] || [ "$value" = "skip" ]; then
        echo -e "${YELLOW}⚠️  Skipping $key${NC}"
        return
    fi
    
    # Escape value for sed
    value=$(printf '%s\n' "$value" | sed -e 's/[\/&]/\\&/g')
    
    # Update .env.production
    sed -i "s/^$key=.*/$key=$value/" .env.production
    echo -e "${GREEN}✅ Updated $key${NC}"
}

# Step 1: Collect Database URL
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 1️⃣: Supabase Database Connection String${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Go to: https://app.supabase.com"
echo "   → Project: ypmlpwdnquwwldtrkhnq"
echo "   → Settings ⚙️"
echo "   → Database"
echo "   → Connection Pooling"
echo "   → Mode: Transaction"
echo "   → Copy the connection string (postgresql://...)"
echo ""
read -p "Paste DATABASE_URL here (or type 'skip'): " DATABASE_URL

if [ "$DATABASE_URL" != "skip" ] && [ ! -z "$DATABASE_URL" ]; then
    update_env "DATABASE_URL" "$DATABASE_URL"
fi

# Step 2: Collect Stripe Secret Key
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 2️⃣: Stripe Secret Key${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Go to: https://dashboard.stripe.com"
echo "   → Developers"
echo "   → API Keys"
echo "   → Test mode: ON (toggle if needed)"
echo "   → Copy 'Secret key' (starts with: sk_test_)"
echo ""
read -p "Paste STRIPE_SECRET_KEY here (or type 'skip'): " STRIPE_SECRET_KEY

if [ "$STRIPE_SECRET_KEY" != "skip" ] && [ ! -z "$STRIPE_SECRET_KEY" ]; then
    update_env "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
fi

# Step 3: Verify configuration
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 3️⃣: Verify Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check for TODO or PASTE_HERE
if grep -q "PASTE_HERE\|TODO" .env.production; then
    echo -e "${YELLOW}⚠️  Warning: .env.production still has TODO/PASTE_HERE values${NC}"
    echo ""
    grep "PASTE_HERE\|TODO" .env.production || true
    echo ""
    read -p "Continue anyway? (y/n): " continue_anyway
    if [ "$continue_anyway" != "y" ] && [ "$continue_anyway" != "Y" ]; then
        echo "❌ Setup cancelled. Please add all required values first."
        exit 1
    fi
fi

echo -e "${GREEN}✅ Configuration check passed${NC}"
echo ""

# Step 4: Git commit and push
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 4️⃣: Deploy to GitHub${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "Ready to push to GitHub? (y/n): " deploy_ready

if [ "$deploy_ready" = "y" ] || [ "$deploy_ready" = "Y" ]; then
    echo ""
    echo "🔄 Committing changes..."
    git add .env.production
    git commit -m "config: add supabase database url and stripe secret key" || true
    
    echo "📤 Pushing to GitHub..."
    git push origin main
    
    echo ""
    echo -e "${GREEN}✅ Pushed to GitHub!${NC}"
    echo ""
    echo "📌 GitHub Actions will now:"
    echo "   1. Run tests"
    echo "   2. Build Docker images"
    echo "   3. Deploy to Render (API)"
    echo "   4. Deploy to Vercel (Admin UI)"
    echo ""
    echo "⏱️  This takes ~5-10 minutes"
    echo ""
    echo "🔗 Monitor progress:"
    echo "   • GitHub: https://github.com/Websitemilin/milinshop/actions"
    echo "   • Render: https://dashboard.render.com"
    echo "   • Vercel: https://vercel.com/dashboard"
else
    echo "⏸️  Setup paused. Commit manually when ready:"
    echo "   $ git add .env.production"
    echo "   $ git commit -m 'config: add production keys'"
    echo "   $ git push origin main"
    exit 0
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 5️⃣: Verify Deployment${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "After deployment completes, verify:"
echo ""
echo "1️⃣  Check API Health (wait ~2 minutes):"
echo "   curl https://milin-shop-api.render.com/health"
echo "   Expected: {\"status\":\"ok\"}"
echo ""
echo "2️⃣  Login to Admin:"
echo "   URL: https://milin-shop.vercel.app (or milin-shop-admin)"
echo "   Email: admin@milinshop.com"
echo "   Password: admin123"
echo ""
echo "3️⃣  Test Data:"
echo "   Should see 8 products in dashboard"
echo "   Pink theme throughout"
echo ""
echo "4️⃣  Test Stripe Payment:"
echo "   Card: 4242 4242 4242 4242"
echo "   Exp: 12/25"
echo "   CVC: 123"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✨ Setup Complete! Milin Shop is Deploying! ✨        ║${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}║  Your platform will be live in 5-10 minutes!          ║${NC}"
echo -e "${GREEN}║  Monitor: https://github.com/Websitemilin/milinshop   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "🎉 Good luck! Your luxury rental platform is launching! 🎀"
echo ""

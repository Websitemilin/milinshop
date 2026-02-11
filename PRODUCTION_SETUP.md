# 🎀 Milin Shop - Production Deployment Instructions
## (ตั้งค่า Render + Supabase + Upstash แบบมีคนตั้งให้แล้ว)

---

## ✅ What's Ready Now

เรากำลังมี 4 services พร้อมแล้ว:

- ✅ **Render** API Token: `rnd_ieepREKz1nJyQVvJ0FvnP1gTe71Y`
- ✅ **Supabase** API: `sbp_c7de8cdd49c988fee391a9c44e7c1f61c42699f9`
- ✅ **Upstash** Redis: `be285adc-0b47-4775-8019-d085103d34ad`
- ✅ **.env.production** สร้างไว้แล้ว
- ✅ **Deployment scripts** พร้อม

---

## 📋 What You Need to Do (3 ขั้นตอนอย่างเดียว)

### ขั้น 1️⃣: ดึง Database Connection Strings

#### A. Supabase - Get Database URL

1. ไปที่ https://app.supabase.com
2. เลือก project: `Milin Shop`
3. ไปที่ **Settings** → **Database** → **Connection Pooling**
4. เลือก Mode: **Transaction** (สำคัญ!)
5. Copy URL นี้ (หน้าตาแบบนี้):
   ```
   postgresql://postgres:password@host.supabase.co:6543/postgres
   ```
6. Paste ไปใน `.env.production` → `DATABASE_URL=`

**Visual Guide:**
```
Supabase Dashboard:
├─ Select Project → Milin Shop
├─ Settings (⚙️ icon bottom left)
├─ Database
├─ Connection Pooling
└─ Copy "Connection string" → .env.production
```

#### B. Upstash - Get Redis URL

1. ไปที่ https://console.upstash.com
2. ไปที่ **Redis** → เลือก Database
3. Copy **UPSTASH_REDIS_REST_URL** (ดูแบบนี้):
   ```
   redis://default:password@host:port
   ```
4. Paste ไปใน `.env.production` → `REDIS_URL=`

**Visual Guide:**
```
Upstash Console:
├─ Redis (left menu)
├─ Select Database
├─ Details tab
└─ Copy Redis URL → .env.production
```

#### C. Stripe - Get Payment Keys

1. ไปที่ https://dashboard.stripe.com/apikeys
2. Copy **Publishable key** → `STRIPE_PUBLIC_KEY=`
3. Copy **Secret key** → `STRIPE_SECRET_KEY=`
4. สำหรับ Webhook (ตัวเลือก):
   - ไปที่ **Webhooks**
   - เลือก Endpoint → Copy signing secret → `STRIPE_WEBHOOK_SECRET=`

**Visual Guide:**
```
Stripe Dashboard:
├─ Developers (left menu)
├─ API keys
├─ Copy keys → .env.production
└─ Webhooks (ถ้าต้อง)
```

---

### ขั้น 2️⃣: Update .env.production

แก้ไขไฟล์ `.env.production` โปรแกรม VSCode:

**ค้นหาแล้วแทนที่ (Find & Replace):**

| ค้นหา | แทนที่ด้วย |
|------|---------|
| `YOUR_DB_PASSWORD` | จาก Supabase |
| `postgresql://postgres:password@db.supabase.co:5432/postgres?schema=public` | Database URL จากสเต็ป 1A |
| `redis://default:YOUR_REDIS_PASSWORD@YOUR_REDIS_HOST:39xxx` | Redis URL จากสเต็ป 1B |
| `pk_test_51234567890abcdef` | Stripe Public Key จากสเต็ป 1C |
| `sk_test_51234567890abcdef` | Stripe Secret Key จากสเต็ป 1C |

**ฉันพร้อมจะช่วย ถ้าบอกค่า 3 ค่านี้:**
1. Database URL
2. Redis URL
3. Stripe Secret Key

---

### ขั้น 3️⃣: Push ไป GitHub & Auto Deploy

```bash
# Step 1: Verify updates
git add .env.production
git status

# Step 2: Commit
git commit -m "config: add production database and payment keys"

# Step 3: Push
git push origin main

# GitHub Actions จะ auto-run ✅
```

**ดู Deployment Progress:**
1. ไปที่ GitHub → Actions tab
2. ดู Workflow run
3. ต้องเห็น: ✅ Test ✅ Build ✅ Deploy
4. Check logs if ❌ fails

---

## 🔐 GitHub Secrets (Optional for Auto-Deploy)

ถ้าต้องการให้ GitHub Actions ชาญฉลาด สามารถตั้ง Secrets:

**Go to:** GitHub Repo → Settings → Secrets → New repository secret

```
Name: RENDER_API_KEY
Value: rnd_ieepREKz1nJyQVvJ0FvnP1gTe71Y
```

```
Name: DATABASE_URL
Value: postgresql://postgres:password@...
```

```
Name: STRIPE_SECRET_KEY
Value: sk_test_...
```

---

## ✨ After Deploy - Verify Everything Works

### 1. Check API Health
```bash
curl https://milin-shop-api.render.com/health
# ต้องเห็น: {"status":"ok"}
```

### 2. Login to Admin
- ไปที่ Vercel domain (หรือ custom domain)
- Login: `admin@milinshop.com` / `admin123`
- ต้องเห็น: Pink dashboard with products

### 3. Test Stripe Payment
- Go to checkout
- Card: `4242 4242 4242 4242`
- Exp: `12/25`
- CVC: `123`
- ต้องเห็น: Payment success ✅

### 4. Check Database
- Supabase → เลือก project
- ไปที่ **SQL Editor**
- Query:
  ```sql
  SELECT COUNT(*) FROM users;
  SELECT COUNT(*) FROM products;
  ```
- ต้องเห็น: users > 0, products > 0

---

## 🚨 Troubleshooting

### API won't start

```bash
# Check logs at Render Dashboard
1. Go to: https://dashboard.render.com
2. Select Service: milin-shop-api
3. Click "Logs" tab
4. Look for error messages
```

**Common errors:**
- `DATABASE_URL connection refused` → ตรวจสอบ Supabase Connection Pooling ON
- `REDIS connection timeout` → ตรวจสอบ Upstash Redis URL
- `STRIPE_SECRET_KEY not found` → ตรวจสอบ .env.production มี key

### Database empty

```sql
-- Supabase SQL Editor:
-- Run seed script manually:
-- อันนี้ optional - seed data มี 8 items แล้ว
```

### Can't login to admin

1. ตรวจสอบ database มี users:
   ```sql
   SELECT * FROM users WHERE email = 'admin@milinshop.com';
   ```
2. ถ้าไม่มี: Run seed script

---

## 📊 Production Setup Complete Checklist

- [ ] Database URL ใน .env.production
- [ ] Redis URL ใน .env.production
- [ ] Stripe keys ใน .env.production
- [ ] Commit & Push ไป GitHub
- [ ] GitHub Actions ✅ all green
- [ ] API responding at /health
- [ ] Admin login works
- [ ] Test payment succeeds
- [ ] Database has data

---

## 🎯 Next: Monitor & Scale

**Daily checks:**
- [ ] Check Render logs for errors
- [ ] Verify Stripe webhooks in dashboard
- [ ] Monitor database size (Supabase quota)

**Weekly tasks:**
- [ ] Backup database (Supabase → Backups)
- [ ] Review analytics
- [ ] Update pricing if needed

**When ready to scale:**
- [ ] Upgrade Render tier
- [ ] Upgrade Supabase if hitting quota
- [ ] Add CDN (Cloudflare free)
- [ ] Enable email notifications

---

## 📞 Need Help?

**ดู Documentation:**
- `QUICK_DEPLOY_GUIDE.md` - Quick start
- `SETUP_GUIDE.md` - Detailed config
- `RENTAL_GUIDE.md` - Customer info
- `LAUNCH_PLAYBOOK.md` - Operations

**API Reference:**
- Docs: `https://milin-shop-api.render.com/api/docs`
- Health: `https://milin-shop-api.render.com/health`

**Support Channels:**
- Render Support: https://dashboard.render.com/support
- Supabase Discord: https://discord.supabase.com
- Stripe Help: https://stripe.com/support

---

## 🎉 Ready to Go!

**ครั้งต่อไป:**
1. Copy Database URL จาก Supabase
2. Copy Redis URL จาก Upstash
3. Update .env.production
4. `git push origin main`
5. ✅ Done! ปล่อยให้ GitHub Actions ทำงาน

**Good luck! 🚀**

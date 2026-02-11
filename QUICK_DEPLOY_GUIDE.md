# Quick Deploy Guide - Milin Shop
## ตั้งค่าและ Deploy แบบง่ายๆ

---

## ขั้นตอนที่ 1: Push Code ไป GitHub
```bash
git add .
git commit -m "feat: Complete Milin Shop - ready for production"
git push origin main
```

---

## ขั้นตอนที่ 2: สมัครและตั้งค่า Services ต่างๆ (ใช้ GitHub Account)

### A. Vercel (Frontend Hosting) - FREE
**สำหรับ Next.js Admin & Storefront**

1. ไปที่ https://vercel.com
2. คลิก "Sign up" → เลือก "Continue with GitHub"
3. Authorize Vercel to GitHub
4. ใน Vercel Dashboard: คลิก "New Project"
5. เลือก repository `milinshop`
6. เลือก project root: `apps/admin`
7. Environment Variables (ตั้งค่า):
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   STRIPE_PUBLIC_KEY=pk_test_xxx (จาก Stripe)
   ```
8. Deploy

**ผลลัพธ์**: Next.js ทำงานที่ vercel.com domain (สามารถ custom domain ได้)

---

### B. Render (Backend API Hosting) - FREE tier available
**สำหรับ NestJS API**

1. ไปที่ https://render.com
2. คลิก "Sign up" → เลือก "GitHub"
3. Authorize Render to GitHub
4. ใน Dashboard: คลิก "New" → "Web Service"
5. เลือก repository `milinshop`
6. ตั้งค่า:
   - **Name**: `milin-shop-api`
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
7. Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://user:pass@host/milinshop
   REDIS_URL=redis://host:6379
   JWT_SECRET=your-random-secret-key
   STRIPE_SECRET_KEY=sk_test_xxx
   ```
8. Create Web Service

**ผลลัพธ์**: API ทำงานที่ render.com domain

---

### C. Supabase (Database) - FREE tier
**สำหรับ PostgreSQL Database**

1. ไปที่ https://supabase.com
2. คลิก "Start your project" → "Sign up with GitHub"
3. Authorize Supabase
4. Create Organization (ชื่ออะไรก็ได้)
5. Create Project:
   - **Project name**: `milin-shop`
   - **Database Password**: ตั้ง password ที่แข็งแรง (เก็บไว้)
   - **Region**: Select nearest region
6. ใน Project Settings → Database → Connection Pooling:
   - Enable pgBouncer
   - Copy connection string
7. Database URL จะเป็น:
   ```
   postgresql://postgres:password@host:6543/postgres?schema=public
   ```

**ผลลัพธ์**: PostgreSQL database พร้อมใช้

---

### D. Upstash (Redis Cache) - FREE tier
**สำหรับ Redis**

1. ไปที่ https://upstash.com
2. คลิก "Sign Up" → "Continue with GitHub"
3. Authorize Upstash
4. Create Database:
   - **Name**: `milin-shop-redis`
   - **Region**: Same as Supabase
5. ได้ Redis URL:
   ```
   redis://default:password@host:port
   ```

**ผลลัพธ์**: Redis cache ใช้งานได้

---

### E. Stripe (Payment) - FREE
**สำหรับรับเงินเช่า**

1. ไปที่ https://stripe.com
2. คลิก "Sign up" - สมัครใหม่ (ไม่ต้องใช้ GitHub)
3. ใส่ info บริษัท (Milin Shop)
4. Verify email
5. ไปที่ Developers → API Keys
6. Copy:
   - **Publishable key**: `pk_test_xxx` (ใช้ใน frontend)
   - **Secret key**: `sk_test_xxx` (ใช้ใน backend)

**ผลลัพธ์**: สามารถทดสอบ payment ได้

---

## ขั้นตอนที่ 3: ตั้งค่า Environment Variables

### 3.1 สร้างไฟล์ `.env.production`
```bash
# ที่ root folder
cp .env.example .env.production
```

แก้ไขใหม่:
```env
# Database
DATABASE_URL=postgresql://user:pass@supabase-host:6543/postgres?schema=public

# Redis
REDIS_URL=redis://default:password@upstash-host:port

# API
API_URL=https://milin-shop-api.render.com
NEXT_PUBLIC_API_URL=https://milin-shop-api.render.com

# JWT
JWT_SECRET=generate-random-key-32-characters-long
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Stripe
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# Email (SendGrid - optional for free)
SENDGRID_API_KEY=your-api-key

# S3 (optional, use MinIO for local)
AWS_S3_BUCKET=milin-shop
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

### 3.2 Push to GitHub (if using GitHub Secrets)
```bash
git add .env.production
git commit -m "config: production environment"
git push origin main
```

---

## ขั้นตอนที่ 4: Deploy แต่ละส่วน

### 4.1 Database Migration (รันครั้งแรก)
```bash
# ตั้งค่า DATABASE_URL ก่อน
export DATABASE_URL="postgresql://..."

# Migration
npx prisma migrate deploy

# Seed data
npx prisma db seed
```

### 4.2 Update Render Env Variables
ไปที่ Render Dashboard → Web Service → Environment:
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

### 4.3 Update Vercel Env Variables
ไปที่ Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://milin-shop-api.render.com
STRIPE_PUBLIC_KEY=pk_test_xxx
```

---

## ขั้นตอนที่ 5: ทดสอบ Deployment

### Test API
```bash
curl https://milin-shop-api.render.com/health
# ต้องเห็น {"status":"ok"}
```

### Test Frontend
- ไปที่ Vercel domain
- ต้องเห็น Milin Shop homepage กับ pink theme

### ทำให้ Custom Domain (optional)
1. **ซื้อ domain** ที่ Namecheap/Google Domains
2. **Vercel**: Settings → Domains → Add → ปฏิบัติตาม DNS instructions
3. **Render**: Service Settings → Custom Domain

---

## ขั้นตอนที่ 6: Continuous Deployment (Auto Deploy)

### GitHub Actions (อัตโนมัติ)
- `.github/workflows/deploy.yml` เตรียมไว้แล้ว
- ทุกครั้ง `git push` → GitHub Actions รัน tests และ deploy

### ตั้งค่า Deploy Secrets
1. GitHub Repo → Settings → Secrets → New repository secret
2. เพิ่ม:
   ```
   RENDER_DEPLOY_HOOK=https://api.render.com/deploy/srv-xxx
   STRIPE_SECRET_KEY=sk_test_xxx
   DATABASE_URL=postgresql://...
   ```

---

## ขั้นตอนที่ 7: Monitoring & Logs

### Vercel Logs
- Vercel Dashboard → Deployments → View logs

### Render Logs
- Render Dashboard → Web Service → Logs tab

### Upstash Monitoring
- Upstash Dashboard → Analytics

---

## 🎯 Summary - ต้องทำ 7 ขั้นตอน

| ขั้น | งาน | เวลา | Cost |
|-----|-----|------|------|
| 1 | Push to GitHub | 2 นาที | $0 |
| 2A | Vercel signup | 5 นาที | $0 |
| 2B | Render signup | 5 นาที | $0 |
| 2C | Supabase signup | 5 นาที | $0 |
| 2D | Upstash signup | 5 นาที | $0 |
| 2E | Stripe signup | 10 นาที | $0 |
| 3-5 | ตั้งค่า & Deploy | 15 นาที | $0 |

**ทั้งหมด**: ~45 นาที = **$0 สำหรับ 1 เดือนแรก**

---

## 💡 Tips
- **Free tier limits**: Vercel 100GB, Render sleeps after 30 min inactive, Supabase 500MB
- **สำหรับ production** (เดือนที่ 2+): อัพเกรด → $50-200/month
- **Community support**: ทั้ง 4 services มี docs ปราศจากคำถาม
- **เก็บ API keys** ให้ปลอดภัย - ไม่ commit ไปที่ Git

---

## 🚀 หลังจาก Deploy เสร็จ

1. ทดลอง login: `admin@milinshop.com` / `admin123`
2. เพิ่มสินค้า (8 items เตรียมแล้ว)
3. ทดลอง Stripe test payment: `4242 4242 4242 4242`
4. Check analytics
5. Ready for customers!

---

## ❓ ถ้าเกิดปัญหา

### Render: Build failed
```bash
# ตรวจสอบ Node version
node --version # ต้อง v18+

# ลอง local build
cd apps/api
npm run build
```

### Database: Connection timeout
- ตรวจสอบ IP whitelist ใน Supabase
- ใช้ Connection Pooling URL

### API not responding
- ตรวจสอบ Render logs
- ตรวจสอบ DATABASE_URL และ REDIS_URL

---

**ต้องการความช่วยเหลือเพิ่มเติม? ถามได้ระบุสิ่งที่ติด** 👍

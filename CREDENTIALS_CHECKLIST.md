# 🎀 Milin Shop - Complete Credentials Setup
## ยังขาดส่วนไหน และต้องทำอะไรต่อ?

---

## ✅ สิ่งที่ได้มาแล้ว:

```
Supabase Project:
├─ URL: https://ypmlpwdnquwwldtrkhnq.supabase.co ✅
├─ Anon JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ✅
├─ Publishable: sb_publishable_bXOZaQRyZ4h2TFKAZ2Efbg_1FOqTf1d ✅
└─ Render API: rnd_ieepREKz1nJyQVvJ0FvnP1gTe71Y ✅
```

---

## ⚠️ ยังขาดต่อนี้:

### 1️⃣ **DATABASE_URL** (สำคัญ!)

เนื่องจากเป็น Supabase ต้องได้ว่า:
- PostgreSQL connection string

**ดึงจากไหน:**
1. ไป https://ypmlpwdnquwwldtrkhnq.supabase.co/project/settings/database
2. ไปที่ **Connection Strings**
3. เลือก **URI** แล่บ
4. Copy string ที่มี format:
   ```
   postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
   ```
   (ตัวอย่าง: postgresql://postgres.ypmlpwdnq:xyz@db.ypmlpwdnq.supabase.co:5432/postgres)

**บันทึก:**
- ✅ Anon JWT ≠ DATABASE_URL
- ✅ ต้องเป็น postgres://... version
- ✅ ต้องมี password (ใส่ตอน setup)

---

### 2️⃣ **REDIS_URL** (สำคัญเท่าเทียม)

จากไหน?

**Option A: ใช้ Upstash (ฟรี)**
1. ไป https://console.upstash.com
2. Login ด้วย GitHub
3. Create Database → Redis
4. Copy URL: `redis://default:password@host:port`

**Option B: ใช้ Redis Cloud (ฟรี)**
1. ไป https://app.redislabs.com
2. Create Database (free tier)
3. Copy: `redis://default:password@host:port`

---

### 3️⃣ **STRIPE_SECRET_KEY** (สำคัญ - payment support)

จากไหน?
1. ไป https://dashboard.stripe.com/test/apikeys
2. Copy **Secret Key** ที่เริ่มด้วย `sk_test_...`

**สำคัญ:**
- ✅ ต้องเป็น "test" mode ตอนแรก
- ✅ เปลี่ยนเป็น live mode หลัง launch
- ✅ ต้อง 2 keys: publishable + secret

---

### 4️⃣ **SENDGRID_API_KEY** (ฟรีแต่ optional)

สำหรับส่ง email notifications
1. ไป https://app.sendgrid.com
2. Settings → API Keys
3. Create key → Copy

**ถ้าไม่ทำ**: เปลี่ยนเป็น `SENDGRID_API_KEY=optional`

---

## 🎯 Checklist - ต้องซ่าย 4 อย่าง

| # | สิ่ง | Status | Link |
|---|------|--------|------|
| 1 | DATABASE_URL | ⏳ ต้องดึง | https://ypmlpwdnquwwldtrkhnq.supabase.co/project/settings/database |
| 2 | REDIS_URL | ⏳ ต้องดึง | https://console.upstash.com หรือ https://app.redislabs.com |
| 3 | STRIPE_SECRET_KEY | ⏳ ต้องดึง | https://dashboard.stripe.com/test/apikeys |
| 4 | SENDGRID_API_KEY | ⏰ Optional | https://app.sendgrid.com/settings/api_keys |

---

## 📝 Template .env.production ที่สมบูรณ์

```env
# Database
DATABASE_URL=postgresql://postgres.[project]:[password]@db.[project].supabase.co:5432/postgres

# Redis
REDIS_URL=redis://default:[password]@[host]:[port]

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Supabase (ที่เรามีแล้ว)
SUPABASE_URL=https://ypmlpwdnquwwldtrkhnq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_PUBLISHABLE_KEY=sb_publishable_bXOZaQRyZ4h2TFKAZ2Efbg_1FOqTf1d

# Render
RENDER_API_KEY=rnd_ieepREKz1nJyQVvJ0FvnP1gTe71Y

# Email (Optional)
SENDGRID_API_KEY=SG...

# Other
API_URL=https://milin-shop-api.render.com
JWT_SECRET=any-random-string-here-32-chars-or-more
```

---

## ✨ ดึงค่าทั้ง 4 ตัวนี้แล้วส่งให้ผม:

1. **DATABASE_URL** = `postgresql://...`
2. **REDIS_URL** = `redis://...`
3. **STRIPE_SECRET_KEY** = `sk_test_...`
4. **ต้องการ email support?** (Yes/No)

---

## 🤔 ถ้า Database password ลืม?

สำหรับ Supabase:
1. ไป https://ypmlpwdnquwwldtrkhnq.supabase.co/project/settings/database
2. ดู **Connection string** section
3. มี password นั่น (ส่วน `[password]`)

**ถ้ายังไม่ได้ตั้ง:**
1. ไป Settings → Database
2. คลิก "Reset" → ตั้ง password ใหม่
3. Copy connection string ที่มี password

---

## 🚀 หลังจากเก็บค่า 4 ตัว:

```bash
# 1. Update .env.production with all 4 values
nano .env.production
# (Edit & Save)

# 2. Test database connection
npx prisma db pull

# 3. Push to GitHub
git add .env.production
git commit -m "config: add all production credentials"
git push origin main

# ✅ GitHub Actions auto-deploy!
```

---

## ❓ ถ้านั่งหนัก:

มี 2 วิธี:

**วิธีที่ 1: แค่ใช้ free tier ก่อน**
- Supabase DATABASE_URL ✅ มี
- Redis: ใช้ Upstash free ✅
- Stripe: ต้อง (payment needed)
- Email: skip ก่อน

**วิธีที่ 2: Full setup**
- ทุกอย่างสมบูรณ์ = Ready for customers

---

## 🎯 สรุป:

- ✅ Supabase project สร้างเสร็จ
- ✅ Render API ready
- ⏳ **ต้องดึง 4 ค่า**: DATABASE_URL, REDIS_URL, STRIPE, SENDGRID
- ⏳ ส่งให้ผมแล้วผมใส่ให้

**Render + Supabase + Upstash = Free tier ครบเรื่อง! 🎉**

---

ส่งค่า 4 ตัวนี้มาได้เลย เหลือแต่เซต! 👍

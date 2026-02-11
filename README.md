# 💎 Milin Shop - Luxury Women's Fashion Rental Platform

> A **production-ready**, full-stack luxury fashion rental marketplace. Built with modern tech, beautiful pink branding, and everything needed to launch and scale a rental business.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-%E2%9C%93-blue)](https://www.docker.com/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-green)](.)

---

## 🎯 What is Milin Shop?

**Milin Shop** is a complete, ready-to-deploy luxury fashion rental platform designed specifically for women's designer clothing and accessories. It handles:

- ✅ **Customer Storefront** - Browse and rent designer pieces
- ✅ **Admin Dashboard** - Manage inventory, orders, and analytics
- ✅ **Payment Processing** - Secure Stripe integration with deposit management
- ✅ **Rental Logic** - Date availability, concurrency-safe ordering, damage tracking
- ✅ **Mobile App** - Flutter app for customer browsing and order tracking
- ✅ **Scaling Features** - Redis caching, database optimization, multi-tenant ready

**Perfect for:**
- Entrepreneurs launching a rental business
- Existing fashion retailers expanding into rentals
- Multi-location rental franchises
- B2B wholesale partnerships

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
```bash
node --version  # v18+ required
docker --version
npm --version
```

### 1. Clone & Install
```bash
git clone https://github.com/Websitemilin/milinshop.git
cd milinshop
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env.local

# Minimal config for local development:
# - DATABASE_URL (defaults to localhost postgres)
# - REDIS_URL (defaults to localhost redis)
# - STRIPE_SECRET_KEY (get from stripe.com)
```

### 3. Start Everything
```bash
# Terminal 1: Backend API
cd apps/api && npm run start:dev

# Terminal 2: Frontend
cd apps/admin && npm run dev

# Terminal 3: Database
docker run -d -e POSTGRES_PASSWORD=password -p 5432:5432 --name postgres postgres:15

# Terminal 4: Redis
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

### 4. Login & Explore

**Admin Dashboard:**
```
URL: http://localhost:3000/login
Email: admin@milinshop.com
Password: Admin@123456
```

**Customer Storefront:**
```
URL: http://localhost:3001
Email: sarah@example.com
Password: Customer@123456
```

**API Documentation:**
```
URL: http://localhost:4000/api/docs
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | **Deploy to production** - Complete setup for server, database, payments |
| [RENTAL_GUIDE.md](RENTAL_GUIDE.md) | **Customer guide** - How to use the platform, rental policies, damage policy |
| [LAUNCH_PLAYBOOK.md](LAUNCH_PLAYBOOK.md) | **Go-live checklist** - 2-week preparation, launch day procedures, week 1 monitoring |
| [ARCHITECTURE.md](ARCHITECTURE.md) | **System design** - Tech stack, database schemas, security architecture |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | **Feature deep-dive** - What's implemented, what works, best practices |

---

## 🏗️ Project Structure

```
milinshop/
├── apps/
│   ├── api/                    # NestJS backend (port 4000)
│   │   ├── src/
│   │   │   ├── auth/          # JWT auth, roles, guards
│   │   │   ├── products/      # Product CRUD, search, filters
│   │   │   ├── orders/        # Order creation (transactional, concurrency-safe)
│   │   │   ├── payments/      # Stripe integration, webhooks
│   │   │   ├── cart/          # Cart operations, rental validation
│   │   │   ├── users/         # User profiles, addresses
│   │   │   ├── admin/         # Admin operations, analytics
│   │   │   └── analytics/     # Dashboards, reports
│   │   └── prisma/            # Database schema, migrations
│   │
│   ├── admin/                  # Next.js 14 admin panel (port 3000)
│   │   ├── app/
│   │   │   ├── dashboard/     # Stats, charts, key metrics
│   │   │   ├── products/      # Product CRUD interface
│   │   │   ├── orders/        # Order management
│   │   │   └── login/         # Authentication
│   │   └── components/        # UI components (pink-themed)
│   │
│   └── mobile/                 # Flutter mobile app
│       └── lib/
│           ├── providers/     # State management (Riverpod)
│           └── screens/       # Customer-facing screens
│
├── packages/                   # Shared code
│   ├── types/                  # TypeScript types, enums
│   ├── validation/             # Zod schemas (auth, products, orders)
│   └── config/                 # Environment validation
│
└── .github/workflows/          # CI/CD (lint, test, deploy)
```

---

## 💻 Tech Stack

### Frontend
- **Next.js 14** - Admin dashboard & storefront
- **Tailwind CSS** - Styling with pink luxury theme
- **Recharts** - Data visualization & analytics
- **Lucide Icons** - Beautiful icons

### Backend
- **NestJS** - REST API, dependency injection, middleware
- **Prisma ORM** - Database access layer with migrations
- **PostgreSQL** - Relational database
- **Redis** - Session cache, distributed locks (rental date reservations)
- **Stripe SDK** - Payment processing & webhooks

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **GitHub Actions** - CI/CD pipeline (lint, test, build, deploy)
- **AWS S3** (or MinIO) - Image storage
- **SendGrid** - Email delivery

### Mobile
- **Flutter** - Cross-platform mobile app
- **Riverpod** - State management
- **GoRouter** - Navigation

---

## ✨ Key Features

### 🛍️ Customer Features
- **Product Browsing** - Search, filter by category/price/availability
- **Shopping Cart** - Add items with custom rental dates
- **Checkout** - Multi-item, secure Stripe payments
- **Damage Waiver** - Optional insurance option
- **Return Shipping** - Prepaid labels, tracking
- **Order History** - View past rentals, track returns
- **Rental Calendar** - Calendar view of rental periods

### 👔 Admin Features
- **Inventory Management** - Add/edit/delete products with images
- **Order Dashboard** - View, filter, update order status
- **Payment Reconciliation** - Stripe sync, revenue reports
- **Analytics** - Daily revenue, top products, user growth
- **Customer Management** - View profiles, rental history
- **Reports** - Excel export of sales, inventory, returns

### 🔐 Security
- **JWT Authentication** - 15-minute access token + 7-day refresh token
- **Role-Based Access Control** - ADMIN, VENDOR, USER roles
- **Password Hashing** - Bcrypt (10 rounds)
- **Rate Limiting** - Per-IP request throttling
- **Input Validation** - Zod schemas on all endpoints
- **HTTPS/SSL** - Encrypted in-transit communication
- **SQL Injection Prevention** - Parameterized queries (Prisma ORM)

### 💰 Payments
- **Stripe Integration** - Live or test mode
- **Idempotent Payments** - Duplicate transaction prevention
- **Webhook Handling** - payment_intent.succeeded/failed events
- **Deposit Management** - Refundable security deposits
- **Multi-Currency** - Support THB, USD, EUR (configurable)
- **Tax Calculation** - Automatic tax on rental fees

### 📦 Rental-Specific
- **Date Availability** - Redis distributed locks prevent overbooking
- **Transactional Orders** - All-or-nothing order creation
- **Concurrency-Safe** - Handles simultaneous bookings
- **Late Fees** - Automatic charges for late returns
- **Damage Tracking** - Damage reports with photo evidence
- **Deposit Deductions** - Partial refunds for minor damage

---

## 🎨 Branding & Customization

### Pink Theme Configuration
```typescript
// apps/admin/tailwind.config.ts
colors: {
  milin: {
    500: '#ec4899',  // Primary hot pink
    600: '#db2777',  // Dark pink
    // ... customize all shades
  }
}
```

### Business Info
```bash
# .env.local or .env.production
BUSINESS_NAME="Milin Shop"
BUSINESS_EMAIL="support@milinshop.com"
CURRENCY_SYMBOL="฿"
TIMEZONE="Asia/Bangkok"
```

### Static Content
- Logo: `apps/admin/public/logo.svg`
- Favicon: `apps/admin/public/favicon.ico`
- Hero Images: `apps/admin/public/images/`

---

## 🚢 Deployment

### Development
```bash
npm install
npm run dev  # Runs all apps in dev mode
```

### Staging (Docker)
```bash
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d
./DEPLOYMENT.sh staging
```

### Production
```bash
# 1. Configure production environment
cp .env.example .env.production
nano .env.production  # Set all secrets

# 2. Run automated deployment
./DEPLOYMENT.sh production

# 3. Monitor
docker logs -f milinshop-api
curl https://api.yourdomain.com/health
```

**Hosting Options:**
- **DigitalOcean App Platform** - Easiest (full managed)
- **AWS ECS + RDS** - Scalable (self-managed)
- **Heroku** - Quick MVP (limited customization)
- **Self-hosted** - Full control, highest complexity

---

## 📊 Success Metrics

### Day 1 Targets
| Metric | Target |
|--------|--------|
| Uptime | 99.9% |
| API Response Time | <500ms |
| Payment Success Rate | >95% |
| Support Response | <2 hours |

### Month 1 Goals
| Metric | Target |
|--------|--------|
| Users | 500+ |
| Orders | 100+ |
| Revenue | ฿50,000+ |
| Satisfaction | >4.5/5 |

---

## 🆘 Support & Community

| Resource | Link |
|----------|------|
| 📧 Email | support@milinshop.com |
| 🐛 Issues | [GitHub Issues](https://github.com/Websitemilin/milinshop/issues) |
| 💬 Discord | [Milin Shop Community](https://discord.gg/...) |
| 📚 Docs | [Full Documentation](SETUP_GUIDE.md) |

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

**Free for commercial use!** Perfect for starting your rental business without licensing fees. 

---

## 🎯 Roadmap

### Phase 1 ✅ (Launch)
- ✅ Admin dashboard & storefront
- ✅ Product management
- ✅ Order processing
- ✅ Stripe payments
- ✅ Pink branding

### Phase 2 (Month 2)
- [ ] Customer reviews & ratings
- [ ] Subscription rentals (monthly)
- [ ] Advanced search (autocomplete, AI recommendations)
- [ ] SMS notifications

### Phase 3 (Month 3)
- [ ] B2B wholesale mode
- [ ] Multi-location support
- [ ] Inventory sync across locations
- [ ] Staff app for warehouse

### Phase 4 (Month 6+)
- [ ] International expansion
- [ ] Influencer partnerships
- [ ] Live shopping events
- [ ] Subscription box service

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 💡 Tips for Success

1. **Start with solid demo data** - Run `npm run seed` to populate 50+ quality products
2. **Customize the theme** - Update colors, logo, copy to match your brand
3. **Test the rental flow** - Go through checkout 3-5 times to catch issues
4. **Setup monitoring** - Enable error tracking (Sentry) before launch
5. **Train your support team** - Share the [RENTAL_GUIDE.md](RENTAL_GUIDE.md) with them
6. **Plan your inventory** - Start with 100-200 pieces, scale to 1000+ over 6 months
7. **Build community** - Engage customers on Instagram, TikTok, YouTube

---

**Built with ❤️ for Milin Shop**

*Last Updated: February 2026*  
*Version: 1.0.0 (Production Ready)*
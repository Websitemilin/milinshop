# SETUP GUIDE - How to Deploy Milin Shop for Your Business

Welcome! This guide walks you through deploying Milin Shop, a production-ready luxury fashion rental marketplace, to start your own rental business.

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Architecture Overview](#architecture-overview)
3. [Quick Start (4 Hours)](#quick-start-4-hours)
4. [Detailed Setup (24 Hours)](#detailed-setup-24-hours)
5. [Configuration Guide](#configuration-guide)
6. [Testing & Validation](#testing--validation)
7. [Launch Checklist](#launch-checklist)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Support & Troubleshooting](#support--troubleshooting)

---

## System Requirements

### Minimum
- **RAM**: 4GB
- **Storage**: 50GB
- **CPU**: 2-core processor
- **OS**: Linux (Ubuntu 20.04+) or macOS

### Recommended (Production)
- **RAM**: 16GB+
- **Storage**: 500GB+ SSD
- **CPU**: 4-core processor
- **OS**: Ubuntu 22.04 LTS (Amazon Linux, DigitalOcean, Linode compatible)
- **CDN**: AWS CloudFront or Cloudflare
- **Database Backup**: Automated daily backups

### Third-Party Accounts Required
- **Stripe** (Payment Processing) - [signup.stripe.com](https://signup.stripe.com)
- **Email Service** (SendGrid or SES) - For transactional emails
- **Cloud Storage** (AWS S3 or similar) - For product images
- **Domain** (any registrar) - Your business domain

---

## Architecture Overview

```
┌─── Mobile App (Flutter) @ port 5000
│
├─── Admin Dashboard (Next.js 14) @ port 3000  
│    └── Backed by NestJS API
│
├─── Customer Storefront (Next.js) @ port 3001
│    └── Product browsing, cart, checkout
│
├─── API (NestJS) @ port 4000
│    ├── Authentication (JWT)
│    ├── Product Management
│    ├── Order Processing (Transactional)
│    ├── Payment Integration (Stripe)
│    └── Analytics & Reporting
│
├─── PostgreSQL Database @ port 5432
│    └── All business data
│
├─── Redis @ port 6379
│    ├── Session cache
│    ├── Rental date locks
│    └── Rate limiting
│
└─── Stripe Webhooks
     └── Payment confirmations
```

---

## Quick Start (4 Hours)

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/yourusername/milinshop.git
cd milinshop

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### 2. Configure `.env.local`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/milinshop"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secret (generate: openssl rand -base64 32)
JWT_SECRET="your-random-secret-here"
REFRESH_TOKEN_SECRET="your-refresh-secret-here"

# Stripe (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (SendGrid or AWS SES)
SENDGRID_API_KEY="SG..."
SENDER_EMAIL="noreply@yourstore.com"

# AWS S3 (for product images)
AWS_REGION="ap-southeast-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="milinshop-images"

# App URLs
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
FRONTEND_URL="http://localhost:3000"
```

### 3. Start Development Stack

```bash
# Terminal 1: API
cd apps/api
npm run start:dev

# Terminal 2: Admin Dashboard
cd apps/admin
npm run dev

# Terminal 3: Database
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=milinshop \
  -p 5432:5432 \
  postgres:15

# Terminal 4: Redis
docker run -d --name redis \
  -p 6379:6379 \
  redis:alpine
```

### 4. Initialize Database

```bash
cd apps/api

# Create database tables
npx prisma migrate deploy

# Seed demo data (test users, products)
npx prisma db seed
```

### 5. Test Access

```
Admin: http://localhost:3000/login
  Email: admin@milinshop.com
  Password: Admin@123456

Storefront: http://localhost:3001
Customer: sarah@example.com / Customer@123456

API Docs: http://localhost:4000/api/docs
```

✅ **Congratulations!** You now have a working Milin Shop instance.

---

## Detailed Setup (24 Hours)

### Production Database Setup

#### Option A: DigitalOcean Managed Database

```bash
# 1. Create managed PostgreSQL database
doctl databases create milinshop --engine postgresql --version 14 --region sgp1 --num-nodes 2

# 2. Get connection string from DigitalOcean dashboard
# 3. Update .env.production:
DATABASE_URL="postgresql://user:password@host:25060/milinshop?schema=public&sslmode=require"

# 4. Run migrations
npx prisma migrate deploy --env production
```

#### Option B: AWS RDS

```bash
# 1. Create RDS instance via AWS Console
# 2. Multi-AZ: Yes (for redundancy)
# 3. Storage: 100GB+ gp3
# 4. Backup retention: 30 days

# 3. Get endpoint from RDS dashboard
DATABASE_URL="postgresql://admin:password@rds-instance.c9akciq32.ap-southeast-1.rds.amazonaws.com:5432/milinshop"

# 4. Run migrations
npx prisma migrate deploy --env production
```

### Redis Setup

```bash
# DigitalOcean Managed Redis
doctl databases create milinshop-redis --engine redis --region sgp1

# AWS ElastiCache
# Via Console: Create cluster, enable Multi-AZ, add backup

# Connection string format:
REDIS_URL="redis://default:password@host:6379"
```

### Docker Deployment

```bash
# Build images (from root)
docker build -f Dockerfile.api -t milinshop-api:latest .
docker build -f Dockerfile.admin -t milinshop-admin:latest .

# Run via Docker Compose (production)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check logs
docker compose logs -f
```

### SSL/HTTPS Setup

```bash
# Using Let's Encrypt + Nginx

# 1. Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# 2. Obtain certificate
sudo certbot certonly --standalone -d milinshop.com -d api.milinshop.com

# 3. Point Nginx to certificates
# /etc/letsencrypt/live/milinshop.com/fullchain.pem
# /etc/letsencrypt/live/milinshop.com/privkey.pem

# 4. Auto-renewal
sudo systemctl enable certbot.timer
```

---

## Configuration Guide

### Stripe Setup

```bash
# 1. Sign up: https://dashboard.stripe.com/register
# 2. Get API keys:
#    - Publishable: pk_live_...
#    - Secret: sk_live_...

# 3. Create webhook endpoint:
#    - Endpoint: https://api.yourdomain.com/webhooks/stripe
#    - Events: payment_intent.succeeded, payment_intent.payment_failed

# 4. Update .env:
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# 5. Test payment flow:
# Use Stripe test card: 4242 4242 4242 4242
# Expiry: 12/25, CVC: 123
```

### Email Configuration

```bash
# SendGrid (Recommended)
# 1. Create account: https://sendgrid.com
# 2. Create API key with "Mail Send" permission
# 3. Update .env:
SENDGRID_API_KEY="SG.xxxxx"
SENDER_EMAIL="noreply@yourdomain.com"

# AWS SES Alternative:
AWS_SES_REGION="ap-southeast-1"
```

### Image Storage (S3)

```bash
# 1. Create AWS account
# 2. Create S3 bucket: milinshop-images
# 3. Enable versioning (for rollback)
# 4. Create IAM user with S3 access
# 5. Update .env:
AWS_REGION="ap-southeast-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="milinshop-images"

# Upload test image:
aws s3 cp test.jpg s3://milinshop-images/products/
```

### Branding Customization

Edit theme colors in:

```typescript
// apps/admin/tailwind.config.ts
colors: {
  milin: {
    500: '#your-pink-color', // Primary brand color
    600: '#darker-pink-color',
    // ... etc
  }
}
```

Update copy:

```typescript
// packages/config/src/index.ts
export const BRAND_NAME = "Your Shop Name";
export const BRAND_COLOR = "#ec4899";
export const BUSINESS_EMAIL = "support@yourshop.com";
```

---

## Testing & Validation

### Unit Tests

```bash
# API tests
cd apps/api
npm run test

# Admin tests
cd apps/admin
npm run test
```

### Integration Tests

```bash
# Full end-to-end flow
npm run test:e2e

# Specific flow: checkout
npm run test:e2e -- checkout.spec.ts
```

### Manual Testing Checklist

```
□ User registration & email verification
□ Product browsing & search
□ Add to cart & update quantities
□ Checkout with test Stripe card
□ Admin product creation
□ Admin order management
□ Rental date validation (no overlaps)
□ Payment webhook receipt
□ Order status updates
□ Return shipping label generation
```

### Performance Testing

```bash
# Load test (1000 concurrent users)
npm run load-test

# Expected results:
# - API response time: <500ms
# - Database: <100ms per query
# - Redis: <10ms per operation
```

---

## Launch Checklist

### Pre-Launch (1 Week Before)

- [ ] **Database**: Automated backups configured & tested
- [ ] **Monitoring**: Sentry/DataDog set up for error tracking
- [ ] **Email**: SendGrid domain verified, templates ready
- [ ] **Stripe**: Live mode enabled, webhooks configured
- [ ] **SSL/TLS**: HTTPS enabled, certificate valid
- [ ] **DNS**: Domain properly configured (A, MX records)
- [ ] **CDN**: CloudFlare or AWS CloudFront enabled
- [ ] **Analytics**: Google Analytics / Mixpanel installed
- [ ] **Legal**: Terms of Service, Privacy Policy, Damage Policy added
- [ ] **Content**: Product catalog seeded with real items

### Launch Day

- [ ] **Soft Launch**: Invite beta users (friends, family)
- [ ] **Monitor**: Check error logs, system performance
- [ ] **Test Flow**: Complete sample transactions end-to-end
- [ ] **Communicate**: Send launch email to waitlist
- [ ] **Support**: Have support team on standby
- [ ] **Documentation**: README and guides published

### Post-Launch (Week 1)

- [ ] **Monitor Metrics**: Revenue, user signups, errors
- [ ] **Gather Feedback**: Customer feedback survey
- [ ] **Bug Fixes**: Quick response to any issues
- [ ] **Onboarding**: Send welcome emails with tips
- [ ] **Promotions**: First-time customer discount

---

## Monitoring & Maintenance

### Daily Checks

```bash
# Check API health
curl https://api.yourstore.com/health

# View error logs
docker logs -f milinshop-api

# Monitor payment processing
# Dashboard: https://dashboard.stripe.com

# Check disk usage
df -h /var/lib/postgresql
```

### Weekly Maintenance

```bash
# Backup database
pg_dump milinshop > backup-$(date +%Y%m%d).sql

# Check logs for errors
grep ERROR /var/log/milinshop/*.log

# Update dependencies
npm update

# Test restore from backup
# (at least monthly)
```

### Monthly Tasks

- [ ] Review and optimize slow queries
- [ ] Check security updates
- [ ] Capacity planning (storage, RAM)
- [ ] Review payment transactions for disputes
- [ ] Analyze rental trends & popular items

### Scaling Considerations

When you reach **10k+ monthly rentals**:

1. **Database**: Switch to read replicas (separate read/write)
2. **Cache**: Increase Redis memory, implement caching layers
3. **Workers**: Add background job queue (Bull/RabbitMQ)
4. **CDN**: Cache product images globally
5. **Load Balancer**: Multiple API instances behind load balancer

---

## Support & Troubleshooting

### Common Issues

#### "Database connection refused"
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart database
docker restart postgres

# Verify connection string in .env
DATABASE_URL="postgresql://user:pass@localhost:5432/milinshop"
```

#### "Stripe payment failing"
```bash
# Check webhook configuration
# Dashboard > Developers > Webhooks

# Verify webhook secret in .env
STRIPE_WEBHOOK_SECRET="whsec_..."

# Test webhook
curl -X POST http://localhost:4000/webhooks/stripe \
  -H "stripe-signature: ..." \
  -d @webhook-payload.json
```

#### "Images not uploading"
```bash
# Check S3 bucket permissions
aws s3 ls s3://milinshop-images/

# Verify AWS credentials
echo "$AWS_ACCESS_KEY_ID"

# Check bucket CORS configuration
aws s3api get-bucket-cors --bucket milinshop-images
```

#### "Slow API responses"
```bash
# Check database performance
SELECT COUNT(*) FROM orders; -- Should be instant

# Monitor Redis
redis-cli INFO stats | grep ops

# Check CPU/Memory
top
ps aux | grep node
```

### Getting Help

📧 **Email**: devops@milinshop-support.com  
📚 **Docs**: https://docs.milinshop.com  
🐛 **Bug Reports**: https://github.com/milinshop/core/issues  
💬 **Community Chat**: [Slack/Discord link]

---

## What's Next?

🎯 **Growth Plan**:
1. **Month 1**: Launch, get first 100 customers
2. **Month 2**: Expand product catalog to 500+ items
3. **Month 3**: Reach 1000+ monthly active users
4. **Month 6**: Multi-location support, vendor integration
5. **Month 12**: International expansion

💡 **Feature Roadmap** (coming soon):
- Subscription rentals (monthly membership)
- Customer reviews & ratings
- Advanced search filters
- Livestream shopping events
- Mobile app (iOS/Android)

---

**Happy Launching! 🚀**

*Version 1.0 - February 2026*
*Next update: May 2026*

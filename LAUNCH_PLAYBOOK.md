# LAUNCH PLAYBOOK - Milin Shop Go-Live Guide

## Overview
This playbook provides a step-by-step guide for launching **Milin Shop** — a luxury women's fashion rental platform. It covers the 2-week preparation period through day 1 launch and the critical first week of operations.

---

## Table of Contents
1. [Timeline & Milestones](#timeline--milestones)
2. [Pre-Launch (Weeks 1-2)](#pre-launch-weeks-1-2)
3. [Launch Day (Week 3, Day 0)](#launch-day-week-3-day-0)
4. [Day 1-7 Operations](#day-1-7-operations)
5. [Success Metrics](#success-metrics)
6. [Troubleshooting](#troubleshooting)
7. [Escalation Chain](#escalation-chain)

---

## Timeline & Milestones

### Week 1: Foundation & Testing
| Day | Task | Owner | Status |
|-----|------|-------|--------|
| Mon | Finalize product catalog (50+ items) | Operations | ☐ |
| Tue | Setup Stripe live account & test payments | Finance/Tech | ☐ |
| Wed | Configure email service (SendGrid) & templates | Tech | ☐ |
| Thu | Load test (1000 concurrent users) & optimize | Tech | ☐ |
| Fri | Internal QA round 1 (all flows) | QA | ☐ |

### Week 2: Soft Launch & Beta
| Day | Task | Owner | Status |
|-----|------|-------|--------|
| Mon | Deploy to staging environment | Tech | ☐ |
| Tue | Beta tester invitations (50-100 friends/family) | Marketing | ☐ |
| Wed | Beta feedback collection & bug fixes | Tech/QA | ☐ |
| Thu | Security audit & penetration testing | Security | ☐ |
| Fri | Final QA pass, prepare launch day checklist | QA | ☐ |

### Week 3: Go Live
| Mon,Tue,Wed | Pre-launch activities | All Teams | ☐ |
| **Thu** | **LAUNCH DAY** | All Teams | ☐ |
| Fri-Sun | Day 1-3 monitoring & support | All Teams | ☐ |

---

## Pre-Launch (Weeks 1-2)

### Product Catalog Setup

**Checklist:**
- [ ] **50+ Products minimum** added to database
  - Evening gowns (15-20 items)
  - Blazers & jackets (10-15 items)
  - Accessories (10-15 items)
  - Dresses (10-15 items)
  
**For each product:**
- [ ] Title & detailed description (50+ words)
- [ ] High-quality images (minimum 3 angles)
- [ ] Daily rental price set
- [ ] Deposit amount configured
- [ ] Stock quantities accurate
- [ ] Category & tags assigned
- [ ] "Featured" items marked for homepage

**Database command:**
```bash
# Seed demo products
cd apps/api
npx prisma db seed

# Verify
npx prisma studio  # Open data explorer
```

### Stripe Live Account Configuration

**1. Upgrade to Live Mode**
```
1. Go to https://dashboard.stripe.com
2. Click "Activate" next to your account name
3. Complete business verification
4. Switching to Live mode takes 12-48 hours
```

**2. Create Webhook Endpoint**
```
1. Navigate to Developers > Webhooks
2. Create endpoint: https://api.milinshop.com/api/webhooks/stripe
3. Events to listen:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - charge.refunded
4. Copy Signing Secret → .env.production
```

**3. Configure Payment Methods**
```
1. Settings > Payment Methods
2. Enable: Cards (Visa, Mastercard, Amex)
3. Enable: Digital Wallets (Apple Pay, Google Pay, Thai QR)
4. Set currency to THB
```

**4. Test Payment Flow**
```bash
# Test with live credentials
curl -X POST https://api.milinshop.com/api/payments/create-intent \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"orderId": "test-order-123"}'

# This should return a client_secret for Stripe Elements
```

### Email Service Setup (SendGrid)

**1. Create SendGrid Account**
```
1. Sign up at sendgrid.com
2. Verify domain ownership (add DNS records)
3. Create API key with "Mail Send" permission
```

**2. Configure Email Templates**

Save these templates in SendGrid > Dynamic Templates:

**Order Confirmation Email**
```
Subject: Order Confirmation - Milin Shop Rental #{{orderId}}
From: noreply@milinshop.com

Dear {{customerName}},

Your rental order has been confirmed!

Order Details:
- Rental Items: {{itemCount}}
- Rental Period: {{rentalFromDate}} to {{rentalToDate}}
- Total: {{totalAmount}}

What's next?
1. Your items will be shipped within 2-3 business days
2. You'll receive tracking info via SMS/Email
3. Enjoy your rentals!
4. Return via prepaid label on {{returnDate}}

Questions? Contact us at support@milinshop.com

Best regards,
Milin Shop Team
```

**Rental Reminder Email** (3 days before return)
```
Subject: Your Milin Shop rental ends in 3 days!

Hi {{customerName}},

Don't forget to return your rental items by {{returnDate}}!

Return Instructions:
1. Print the included prepaid label
2. Pack items in original packaging
3. Drop off at any courier location
4. Track your return

View your order: [link]

Thanks for renting with Milin Shop!
```

**3. Activate Email Sending**
```bash
# Update .env.production
SENDGRID_API_KEY="SG.xxxxx"
SENDER_EMAIL="noreply@milinshop.com"

# Test email delivery
npm run test:email
```

### Load Testing

**Objective:** Ensure system handles 1000+ concurrent users

```bash
# Install k6 load testing tool
curl https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-linux-amd64.tar.gz -L | tar xvz

# Run load test (staging environment)
./k6 run tests/load-test.js --cloud

# Expected results:
# - API response time: <500ms (p95)
# - Error rate: <0.1%
# - Database CPU: <70%
```

**Load Test Script** (`tests/load-test.js`):
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp-up
    { duration: '5m', target: 1000 },  // Peak
    { duration: '2m', target: 0 },     // Ramp-down
  ],
};

export default function() {
  const res = http.get('https://api.staging.milinshop.com/products?page=1&limit=20');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

### Internal QA Testing

**Test Scenarios:**

✅ **User Registration & Authentication**
- Create new account
- Verify email sent
- Login/logout
- Password reset flow
- Session expiry

✅ **Product Browsing**
- Search by keyword
- Filter by category/price
- View product details
- Check image gallery
- Read reviews (if enabled)

✅ **Shopping & Checkout**
- Add single item to cart
- Add multiple items
- Update rental dates
- Remove from cart
- View cart summary
- Apply promo code (if available)
- Proceed to checkout

✅ **Payment Processing**
- Complete payment with test card
- Receive order confirmation
- Webhook received successfully
- Order status updated to "CONFIRMED"
- Email receipt sent

✅ **Order Management**
- View order history
- Track order status
- Print shipping label
- Submit damage report
- Request extension

✅ **Admin Dashboard**
- Login as admin
- Create new product
- Edit existing product
- View all orders
- Update order status
- Generate reports

**Test Case Tracker:**
```
Test ID | Scenario | Expected | Actual | Status
--------|----------|----------|--------|--------
TC-001  | User signup | Confirmation email | ✓ | ✓
TC-002  | Product search | Results load < 1s | ✓ | ✓
TC-003  | Add to cart | Item appears | ✓ | ✓
TC-004  | Stripe payment | payment_intent.succeeded | ✓ | ✓
...
```

---

## Launch Day (Week 3, Day 0)

### 48 Hours Before Launch

**Checklist:**
- [ ] All databases backed up
- [ ] SSL certificates valid & renewed
- [ ] API & Admin servers in healthy state
- [ ] Load balancers configured
- [ ] CDN cache warmed
- [ ] Customer support team trained
- [ ] Marketing assets (social media, emails) scheduled
- [ ] Monitoring & alerting systems active
- [ ] Incident response plan reviewed

**Monitoring Setup:**
```bash
# Verify all systems are operational
curl https://api.milinshop.com/health
curl https://milinshop.com/health

# Check database connectivity
psql -h $DB_HOST -U $DB_USER -d milinshop -c "SELECT COUNT(*) FROM products;"

# Verify Stripe webhook connectivity
# Dashboard > Developers > Webhooks > Test Endpoint
```

### 2 Hours Before Launch

**Operations Team Standup:**
- [ ] Confirm all team members online & ready
- [ ] Review escalation contacts (Slack channel created)
- [ ] Brief support team on common issues
- [ ] Enable detailed logging (DEBUG=true)
- [ ] Prepare canned responses for FAQs

**Announcement Channels:**
- [ ] Email to waitlist (if available)
- [ ] Social media posts scheduled
- [ ] Blog announced
- [ ] Press release issued

**Example Launch Email:**
```
Subject: 🎉 Milin Shop is LIVE!

Dear Fashion Lover,

Your luxury rental platform is here!

✨ What you can do now:
- Browse 50+ designer pieces
- Rent at 10% launch discount (code: MILIN10)
- Experience our white-glove service

💝 Special for Day 1:
- Free shipping on all orders
- Extended return window (5 days)

Start renting now: https://milinshop.com

Questions? support@milinshop.com

Best,
Milin Shop Team
```

### Launch Time (Hour 0)

**T-00:00 - Final Checks**
```bash
# Switch DNS to production (if not already done)
# Verify no traffic errors in monitoring

# Check key metrics
curl -s https://api.milinshop.com/health | jq '.'
# Expected: { "status": "ok", "timestamp": "2026-02-18T...", "uptime": "..."}

# Monitor logs
docker logs -f milinshop-api
docker logs -f milinshop-admin
```

**T+00:15 - Announce Launch**
- [ ] Post to social media
- [ ] Send launch email
- [ ] Update status page
- [ ] Notify team in Slack

**T+00:30 - First Order Celebration**
When first order comes in:
- [ ] Manually verify it processed correctly
- [ ] Send thank you email to customer
- [ ] Share screenshot in team chat

---

## Day 1-7 Operations

### Daily Monitoring Checklist

**Every Morning (9 AM):**
```bash
# Email report template
Subject: Milin Shop - Daily Status Report [DATE]

Metrics:
- Total Users: [X]
- Total Orders: [X]
- Revenue: ฿[Y]
- Error Rate: [Z]%
- API Response Time: [W]ms

Key Events:
- [List any incidents]
- [List customer feedback]
- [List performance issues]

Next Steps:
- [Action items]
```

**Every Hour (Business Hours):**
- [ ] Check error logs for new patterns
- [ ] Verify API health endpoint
- [ ] Monitor database performance
- [ ] Check Stripe webhook deliveries

**Every 4 Hours:**
- [ ] Review customer support tickets
- [ ] Check social media mentions
- [ ] Verify payment processing success rate

### Day 1 - Response Protocol

**If payment processing fails:**
```
1. Check Stripe dashboard > Events
2. Verify webhook endpoint is receiving events
3. Check database for stuck orders
4. Pull logs: docker logs milinshop-api | grep -i stripe
5. Contact Stripe support if critical
```

**If users report slow performance:**
```
1. Check CPU/Memory: docker stats
2. Monitor database queries: EXPLAIN ANALYZE
3. Clear Redis cache if stale: redis-cli FLUSHDB
4. Scale up resources if needed: docker-compose scale api=3
```

**If there's a critical bug:**
```
1. Hotfix branch: git checkout -b hotfix/issue-name
2. Patch code: [make changes]
3. Test locally: npm run test
4. Deploy: ./DEPLOYMENT.sh production
5. Monitor: watch 'curl -s https://api.milinshop.com/health'
```

### Day 2-3: Initial Growth

**Expected Activity:**
- 50-100 new users
- 10-20 orders
- Support tickets: 5-10

**Actions:**
- [ ] Feature requests log (compile feedback)
- [ ] Optimize slow endpoints
- [ ] Expand product catalog (add 20+ items)

### Day 4-7: Stabilization

**Key Milestones:**
- [ ] 500+ registered users
- [ ] 100+ orders
- [ ] <0.5% payment failure rate
- [ ] Zero critical incidents

**Post-Launch Review Meeting:**
- [ ] What went well?
- [ ] What needs improvement?
- [ ] Roadmap for Week 2+

---

## Success Metrics

### Day 1 Targets
| Metric | Target | Actual |
|--------|--------|--------|
| Uptime | 99.9% | |
| API Response Time | <500ms | |
| Payment Success Rate | >95% | |
| Support Response Time | <2 hours | |
| Bounce Rate | <30% | |

### Week 1 Targets
| Metric | Target | Actual |
|--------|--------|--------|
| New Users | 500+ | |
| New Orders | 100+ | |
| Revenue | ฿50,000+ | |
| Customer Satisfaction | >4.5/5 | |
| Repeat Visitors | >30% | |

### Month 1 Targets
| Metric | Target | Actual |
|--------|--------|--------|
| Active Users | 2,000+ | |
| Monthly Orders | 500+ | |
| Monthly Revenue | ฿500,000+ | |
| Net Promoter Score | >50 | |
| Product Reviews | >100 | |

---

## Troubleshooting

### Common Issues & Solutions

**Issue: "Payment declined" for all users**
```bash
# Check:
1. Stripe API keys are correct
   grep STRIPE .env.production
   
2. Webhook is configured
   curl https://dashboard.stripe.com/webhooks
   
3. Currency matches (also in Stripe)
   grep CURRENCY .env.production
   
4. Test card is not expired
   (Use 4242 4242 4242 4242 for testing)

# Solution:
docker restart milinshop-api
```

**Issue: Database connection errors**
```bash
# Check:
1. Connection string is valid
   psql $DATABASE_URL -c "SELECT 1;"
   
2. Database is accepting connections
   ssh $DB_HOST psql -l
   
3. Firewall allows connection
   nc -zv $DB_HOST 5432

# Solution:
# Restart database connection pool:
redis-cli FLUSHDB  # Clear sessions
```

**Issue: Images not loading**
```bash
# Check:
1. S3 bucket is accessible
   aws s3 ls s3://milinshop-images
   
2. CORS is configured
   aws s3api get-bucket-cors --bucket milinshop-images
   
3. CDN is caching properly
   curl -I https://images.milinshop.com/products/item.jpg

# Solution:
# Re-upload product images:
npm run scripts/resync-images
```

**Issue: High API latency**
```bash
# Check:
1. Database slow queries
   docker exec postgres psql -d milinshop -c \
     "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
   
2. Redis is functioning
   redis-cli INFO stats
   
3. System resources
   docker stats

# Solution:
# Add database index, clear cache, scale horizontally
```

---

## Escalation Chain

### For Technical Issues

**Tier 1: On-Call Engineer** (First response: 5 min)
- Phone: [number]
- Slack: @on-call
- Email: oncall@milinshop.com

**Tier 2: Engineering Lead** (If Tier 1 cannot resolve)
- Phone: [number]
- Slack: @eng-lead

**Tier 3: CTO/VP Engineering** (Critical incidents)
- Phone: [number]

### For Business Issues

**Tier 1: Support Manager** (First response: 15 min)
- Email: support@milinshop.com
- Slack: #support-urgent

**Tier 2: Operations Manager** (Customer escalations)
- Phone: [number]

### Critical Incident Response

**Severity Levels:**
- 🔴 **Critical**: System down, payments failing, data loss
  - Response: 15 min
  - Escalation: Immediate
  
- 🟠 **High**: Feature broken, performance degraded
  - Response: 1 hour
  - Escalation: 30 min if unresolved
  
- 🟡 **Medium**: Bug affecting some users
  - Response: 4 hours
  - Escalation: 24 hours if unresolved
  
- 🟢 **Low**: Minor bug, UI issue
  - Response: 24 hours

---

## Post-Launch (Week 2+)

### Activities for Week 2
- [ ] Expand product catalog to 200+ items
- [ ] Launch referral program
- [ ] Implement customer reviews
- [ ] Add blog with rental tips
- [ ] Plan first marketing campaign

### Long-Term Roadmap
- **Month 2**: Subscription/monthly rentals
- **Month 3**: Multi-location support
- **Month 6**: International expansion
- **Month 12**: B2B wholesale partnerships

---

**Launch Playbook Owner**: [Name]  
**Last Updated**: February 11, 2026  
**Next Review**: February 18, 2026

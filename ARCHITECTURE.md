# LUXE RENTAL - Architecture Documentation

## 🏛 System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                                 │
├────────────────────────┬──────────────────────┬─────────────────┤
│   Mobile (Flutter)     │  Admin (Next.js 14)  │   Web (Future)   │
│  - Riverpod            │  - Server Actions    │                  │
│  - GoRouter            │  - Real-time Sync    │                  │
│  - Stripe SDK          │  - Charts/Analytics  │                  │
└────────────────┬───────┴──────────┬───────────┴─────────────────┘
                 │                  │
                 └──────────┬───────┘
                            │
                   ┌────────▼─────────┐
                   │  API Gateway     │
                   │ (Express/Helmet) │
                   │ Rate Limiting    │
                   │ CORS             │
                   └────────┬─────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────────┐ ┌─────▼──────┐ ┌──────────▼──────────┐
│  REST API        │ │  WebSockets│ │  Webhook Listeners │
│  (NestJS)        │ │  (Socket)  │ │  (Stripe)          │
│                  │ │            │ │                    │
│ - Auth Service   │ │ - Orders   │ │ - Payment Handler  │
│ - User Service   │ │ - Checkout │ │ - Reconciliation   │
│ - Product Svc    │ │ - Updates  │ │                    │
│ - Order Service  │ │            │ │                    │
│ - Payment Svc    │ │            │ │                    │
│ - Admin Svc      │ │            │ │                    │
└────────┬─────────┘ └────────────┘ └────────────────────┘
         │
    ┌────┼────────────────────────────────────┐
    │    │                                    │
┌───▼────┴──────┐  ┌──────────────────┐  ┌───▼──────────────┐
│  PostgreSQL   │  │  Redis Cache     │  │  Stripe API      │
│  (Primary DB) │  │  Distributed     │  │  (Payments)      │
│               │  │  Locks (rental)  │  │                  │
│ - Users       │  │  Session Cache   │  │ - Intents        │
│ - Products    │  │  Rate Limits     │  │ - Webhooks       │
│ - Orders      │  │                  │  │ - Idempotency    │
│ - Payments    │  │                  │  │                  │
│ - Audit Logs  │  │                  │  │                  │
└───────────────┘  └──────────────────┘  └──────────────────┘
                            │
                    ┌───────▼────────┐
                    │   MinIO / S3   │
                    │  (Image Store) │
                    │ Signed URLs    │
                    └────────────────┘
```

## 🔐 Security Architecture

### Authentication Flow
```
User → Login → JWT (15min) + RefreshToken (DB, 7d) → HttpOnly Cookie
                ↓
            AccessToken Validator ← DB Check
                ↓
         JWT Claims: {userId, email, role}
```

### Authorization (RBAC)
- **ADMIN**: Full system access
- **VENDOR**: Manage own products
- **USER**: Browse, rent, order

### Data Protection
- Passwords: Bcrypt (10 rounds)
- Tokens: HS256 HMAC
- Sensitive fields: Encrypted in transit (HTTPS)
- Audit trail: All mutations logged

## 💾 Database Design

### Core Entities

**User**
```sql
CREATE TABLE "User" (
  id CUID PRIMARY KEY,
  email UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  role ENUM('ADMIN', 'VENDOR', 'USER'),
  emailVerified BOOLEAN DEFAULT false,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP,
  deletedAt TIMESTAMP NULL
);
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);
```

**Product** (with rental support)
```sql
CREATE TABLE "Product" (
  id CUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug UNIQUE NOT NULL,
  description TEXT NOT NULL,
  categoryId CUID REFERENCES Category(id),
  dailyPrice DECIMAL(10,2) NOT NULL,
  depositPrice DECIMAL(10,2) DEFAULT 0,
  stock INTEGER NOT NULL,
  status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED'),
  colors JSON,
  sizes JSON,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP,
  deletedAt TIMESTAMP NULL
);
CREATE INDEX idx_product_category ON "Product"(categoryId);
CREATE INDEX idx_product_status ON "Product"(status);
```

**Order & OrderItem** (transactional)
```sql
CREATE TABLE "Order" (
  id CUID PRIMARY KEY,
  userId CUID REFERENCES User(id),
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  deposit DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', ...) DEFAULT 'PENDING',
  paymentIntentId VARCHAR(255) UNIQUE,
  createdAt TIMESTAMP DEFAULT now()
);

CREATE TABLE "OrderItem" (
  id CUID PRIMARY KEY,
  orderId CUID REFERENCES Order(id),
  productId CUID REFERENCES Product(id),
  rentalFromDate TIMESTAMP NOT NULL,
  rentalToDate TIMESTAMP NOT NULL,
  status ENUM(...),
  UNIQUE(orderId, productId, rentalFromDate, rentalToDate)
);
CREATE INDEX idx_order_rental_dates ON "OrderItem"(productId, rentalFromDate, rentalToDate);
```

This index enables fast conflict detection:
```sql
-- Find overlapping rentals
SELECT * FROM "OrderItem"
WHERE productId = ?
  AND rentalFromDate < ? AND rentalToDate > ?;
```

## ⏱ Rental Algorithm

### Create Order (Concurrency-Safe)

```typescript
async createOrder(userId: string, items: OrderItem[]) {
  const locks: string[] = [];

  try {
    // Step 1: Acquire Redis locks for all items
    for (const item of items) {
      const lockKey = `product:${item.productId}:${item.from}:${item.to}`;
      const acquired = await redis.setLock(lockKey, 300); // 5 min TTL
      if (!acquired) throw ConflictException('Product locked');
      locks.push(lockKey);
    }

    // Step 2: Validate database (double-check)
    for (const item of items) {
      const overlapping = await db.orderItem.findFirst({
        where: {
          productId: item.productId,
          OR: [{
            AND: [
              { rentalFromDate: { lt: item.to } },
              { rentalToDate: { gt: item.from } }
            ]
          }]
        }
      });
      if (overlapping) throw ConflictException('Dates unavailable');
    }

    // Step 3: Create order in transaction
    const order = await db.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          userId,
          items: { create: items },
          total: calculateTotal(items)
        }
      });
    });

    // Success - release locks
    for (const lock of locks) await redis.releaseLock(lock);
    return order;

  } catch (error) {
    // Cleanup: Release all locks on error
    for (const lock of locks) await redis.releaseLock(lock);
    throw error;
  }
}
```

### Why This Works

1. **Redis Locks**: Prevent simultaneous orders within a 5-minute window
2. **DB Constraints**: UNIQUE index catches edge cases
3. **Transactions**: All-or-nothing order creation
4. **Cleanup**: Locks released immediately after order creation

## 💳 Payment Flow

```
┌─ User Clicks Checkout
│
├─ POST /payments/create-intent
│  └─ Stripe Creates PaymentIntent (idempotent key: {orderId})
│     Return clientSecret
│
├─ Mobile/Web: Confirm payment with clientSecret
│
├─ Stripe Processes Payment
│
├─ Stripe Sends Webhook (POST /payments/webhook)
│  ├─ payment_intent.succeeded
│  │  └─ Create Payment record
│  │  └─ Update Order status → CONFIRMED
│  │
│  └─ payment_intent.payment_failed
│     └─ Create Payment record with failure reason
│     └─ Order stays PENDING (user can retry)
│
└─ Admin can reconcile via /admin/payments
```

### Idempotency Protection

Stripe `PaymentIntent` prevents duplicate charges:
```javascript
// First attempt
stripe.paymentIntents.create(
  {...},
  {idempotencyKey: `order-${orderId}`}
); // Creates intent

// Retry (network error)
stripe.paymentIntents.create(
  {...},
  {idempotencyKey: `order-${orderId}`}
); // Returns same intent (no charge)
```

## 🚀 Scalability Considerations

### Current (Single Server)
✅ ~5K concurrent users
✅ 100K orders/day
✅ Adequate with t3.large RDS + Redis

### 10K→100K Users
- [ ] Read replicas for PostgreSQL
- [ ] ElasticSearch for product search
- [ ] CloudFront CDN for images
- [ ] Kafka for async events
- [ ] Multiple API instances (load balanced)

### 100K→1M+ Users
- [ ] Sharding (user-based or time-based)
- [ ] Event sourcing for orders
- [ ] Microservices split (payments, inventory, users)
- [ ] GraphQL API layer
- [ ] Real-time WebSocket updates

## 📊 Monitoring & Observability

```
┌─────────────────────────────────────────┐
│      Application Metrics (Prometheus)    │
├─────────────────────────────────────────┤
│ - Request latency (p50, p95, p99)        │
│ - Error rate (4xx, 5xx)                  │
│ - Active connections                     │
│ - Payment success rate                   │
│ - Redis hit ratio                        │
│ - DB connection pool usage                │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│    Visualization (Grafana Dashboards)    │
├─────────────────────────────────────────┤
│ - Revenue over time                      │
│ - User growth                            │
│ - Popular products                       │
│ - Payment failure reasons                │
│ - API health                             │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│    Alerting (PagerDuty/Slack)           │
├─────────────────────────────────────────┤
│ - Error rate > 1%                        │
│ - API response time > 500ms              │
│ - Database connection pool > 80%         │
│ - Payment failure spike                  │
│ - Redis evictions                        │
└─────────────────────────────────────────┘
```

## 🔄 CI/CD Pipeline

```
Git Push
  ↓
Lint & Type Check
  ↓
Unit Tests
  ↓
Build Artifacts
  ↓
Security Scan (Snyk)
  ↓
Build Docker Images
  ↓
Push to Registry (ghcr.io)
  ↓
Deploy to Staging
  ↓
Smoke Tests
  ↓
Manual Approval
  ↓
Deploy to Production
  ↓
Health Checks
```

See `.github/workflows/ci.yml` for implementation.

---

**Next Steps for Production**: See [README.md] for deployment guide.

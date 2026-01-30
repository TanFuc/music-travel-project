# Music & Travel System Architecture

## Tech Stack

| Layer         | Technology            | Version          |
| ------------- | --------------------- | ---------------- |
| Backend       | NestJS                | ^10.3.0          |
| Database      | MySQL + Prisma        | ^5.8.0           |
| Cache         | Redis (ioredis)       | ^5.3.2           |
| Auth          | JWT + Passport        | ^10.2.0          |
| API Docs      | Swagger               | ^7.2.0           |
| Frontend      | Next.js 14            | ^14.1.0          |
| State         | React Query + Zustand | ^5.17.0 / ^4.5.0 |
| Styling       | TailwindCSS           | ^3.4.0           |
| UI Components | Radix UI              | Various          |

---

## Backend Module Structure

```
backend/src/modules/
├── auth/           # Authentication (JWT, guards, strategies)
├── users/          # User management
├── wallet/         # Digital wallet transactions
├── shows/          # Show CRUD, seat maps, ticket classes
├── tickets/        # Ticket locking, QR generation, check-in
├── tours/          # Tour CRUD, schedules
├── bookings/       # Booking creation, management
├── payments/       # Payment gateways (MoMo, VNPay, Wallet)
├── vouchers/       # Discount voucher management
├── media/          # File upload, image processing
├── stages/         # Venue/stage management
├── locations/      # Location with coordinates
├── banners/        # Marketing banners
├── notifications/  # User notifications
└── admin/          # Admin-specific endpoints
```

---

## Data Flow Diagrams

### Booking Flow

```
User selects seats → POST /tickets/lock
      ↓
Lock stored in Redis (10min TTL) + DB status = LOCKED
      ↓
User creates booking → POST /bookings
      ↓
Booking created (PENDING) + Items linked
      ↓
User checkouts → POST /payments/checkout
      ├── WALLET: Deduct balance → Transaction SUCCESS
      └── MOMO/VNPAY: Create pending → Return paymentUrl
            ↓
      Gateway webhook → POST /payments/webhook/:gateway
            ↓
Transaction updated → Booking CONFIRMED → Tickets SOLD
```

### QR Check-in Flow

```
User requests QR → GET /tickets/:id/qrcode
      ↓
Server creates payload: { tc, bk, sh, iat }
      ↓
Sign with HMAC-SHA256 → Encode Base64 → "MTICKET:xxxxx"
      ↓
Generate QR PNG DataURL
      ↓
Staff scans QR → POST /tickets/checkin
      ↓
Verify signature + Check Redis for replay
      ↓
Mark isCheckedIn = true → Return success
```

---

## Cache Strategy

### Key Patterns

```
mtravel:{domain}:{identifier}:{sub}

Examples:
- mtravel:show:123              # Single show
- mtravel:show:list:page_1      # Paginated list
- mtravel:ticket:lock:uuid      # Ticket lock
- mtravel:ticket:qr:nonce:123   # QR nonce for replay prevention
```

### TTL Configuration

| Use Case     | TTL   | Constant    |
| ------------ | ----- | ----------- |
| Seat maps    | 60s   | VERY_SHORT  |
| Lists        | 5min  | SHORT       |
| Details      | 10min | MEDIUM      |
| Ticket locks | 10min | TICKET_LOCK |
| QR nonces    | 15min | QR_NONCE    |

---

## Security Implementation

### Authentication

- JWT access tokens (15min)
- Refresh tokens stored in Redis (30 days)
- Token blacklist on logout

### Authorization

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
```

### QR Security

- HMAC-SHA256 signing with QR_SECRET
- Timestamp validation (iat)
- Redis-based replay prevention
- Staff device tracking

---

## Frontend Architecture

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (main)/            # Main app pages
│   │   ├── shows/         # Show list, detail
│   │   ├── tours/         # Tour list, detail
│   │   ├── cart/          # Shopping cart
│   │   ├── checkout/      # Checkout flow
│   │   └── profile/       # User profile
│   └── admin/             # Admin dashboard
├── components/
│   ├── ui/                # Base UI (Button, Input, etc.)
│   ├── shows/             # Show-specific components
│   ├── layout/            # Header, Footer, Nav
│   └── common/            # Shared components
├── services/              # API service files
├── stores/                # Zustand stores
└── hooks/                 # Custom React hooks
```

---

## API Endpoints Summary

### Public

```
GET  /shows                 # List shows
GET  /shows/:slug           # Show detail
GET  /shows/:id/seats       # Seat map
GET  /tours                 # List tours
GET  /tours/:slug           # Tour detail
GET  /banners               # Marketing banners
```

### Authenticated

```
POST /tickets/lock          # Lock tickets
DELETE /tickets/lock/:id    # Release lock
POST /bookings              # Create booking
GET  /bookings              # User bookings
GET  /bookings/:code        # Booking detail
POST /payments/checkout     # Process payment
GET  /tickets/:id/qrcode    # Get ticket QR
```

### Admin

```
POST /shows                 # Create show
PUT  /shows/:id             # Update show
DELETE /shows/:id           # Delete show
POST /stages                # Create stage
POST /stages/:id/seats      # Add seats
POST /tickets/checkin       # Check-in ticket
```

---

## Environment Variables

```env
# Database
DATABASE_URL=mysql://user:pass@host:3306/db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# QR
QR_SECRET=qr-signing-secret

# Payment Gateways
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
MOMO_SECRET_KEY=
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=

# Google Maps
GOOGLE_MAPS_API_KEY=

# App
APP_URL=http://localhost:3000
API_URL=http://localhost:4000
```

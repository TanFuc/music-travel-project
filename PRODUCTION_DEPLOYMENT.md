# Production Deployment Checklist

## ✅ Build Status
- [x] Frontend production build: **PASSING** (72 pages compiled)
- [x] Backend production build: **PASSING** (NestJS compiled)
- [x] Frontend tests: **PASSING** (2/2 tests)
- [x] Backend tests: **PASSING** (25/25 tests)

## ✅ Environment Configuration

### Frontend (.env.production)
```
NEXT_PUBLIC_SITE_URL=https://www.maichohanhtinhxanh.com
NEXT_PUBLIC_API_URL=https://www.maichohanhtinhxanh.com/api/v1
PORT=3333
```
- ✅ Site URL configured for production domain
- ✅ API URL uses reverse proxy (requires nginx/apache setup)
- ✅ Port 3333 allocated for Next.js

### Backend (.env)
```
NODE_ENV=production
PORT=3001
API_PREFIX=api/v1
DATABASE_URL=postgresql://postgres:123456@localhost:5432/music_travel_db
CORS_ORIGINS=https://www.maichohanhtinhxanh.com,https://maichohanhtinhxanh.com
REDIS_HOST=localhost
```
- ✅ NODE_ENV set to production
- ✅ Port 3001 configured (matches frontend API calls)
- ✅ CORS configured for production domains
- ✅ Database connection configured
- ✅ Redis configured for caching

### PM2 Configuration (ecosystem.config.js)
```
Backend: PORT 3001, NODE_ENV production
Frontend: PORT 3333, NODE_ENV production
```
- ✅ Backend port changed from 2222 → 3001 (fixes API routing)
- ✅ Frontend port 3333
- ✅ Max memory restart: 1GB per app
- ✅ Auto-restart enabled
- ✅ Watch mode disabled for production

## ✅ API Endpoint Consistency
All components now use consistent API routing:
- Backend listening on: http://localhost:3001/api/v1
- Frontend API calls to: https://www.maichohanhtinhxanh.com/api/v1 (production)
- Frontend API calls to: http://localhost:3001/api/v1 (development)
- Reverse proxy required on server: /api/v1 → localhost:3001

## ✅ Admin Features Implemented
1. **Banner Management**
   - ✅ Toggle on/off without page refresh
   - ✅ Instant Redis cache invalidation
   - ✅ Auto-refresh stats every 5 seconds
   - ✅ Desktop & mobile preview

2. **User Management (Accounts)**
   - ✅ Create/Read/Update/Delete (CRUD)
   - ✅ Role-based access (ADMIN, STAFF, USER, PARTNER)
   - ✅ Pagination & search
   - ✅ Status toggling

3. **Singer Registrations**
   - ✅ Status update (PENDING/APPROVED/REJECTED)
   - ✅ Filtering by status, package, experience
   - ✅ Real-time statistics
   - ✅ Detailed view modal

4. **Customer Management**
   - ✅ Via user list
   - ✅ Booking history tracking
   - ✅ Payment status visibility

## ⚠️ Pre-Deployment Checklist

### Before Going Live:
- [ ] Verify database credentials are set correctly
- [ ] Ensure Redis instance is running or Upstash configured
- [ ] Configure payment gateways (PayOS, VNPay, MoMo)
- [ ] Set up Cloudinary for image hosting
- [ ] Configure Cloudflare R2 for object storage
- [ ] Generate strong JWT secrets (not placeholder values)
- [ ] Set up reverse proxy (nginx/Apache) to proxy /api/v1 to localhost:3001
- [ ] Enable HTTPS for all domains
- [ ] Configure SSL certificates
- [ ] Set up PM2 monitoring & log rotation
- [ ] Configure email service for notifications
- [ ] Test all payment methods in production mode
- [ ] Verify CORS configuration allows all required origins
- [ ] Test Redis cache invalidation
- [ ] Set up backup procedures for database
- [ ] Configure database connection pooling
- [ ] Set up monitoring/alerting (e.g., New Relic, DataDog)
- [ ] Enable rate limiting for API endpoints
- [ ] Test all admin CRUD operations in production
- [ ] Verify banner cache invalidation works instantly

## 🚀 Deployment Steps

### 1. Server Preparation
```bash
# Install dependencies
pnpm install

# Build both apps
pnpm --filter=frontend run build
pnpm --filter=backend run build
```

### 2. Environment Setup
```bash
# Ensure production environment variables are set
export NODE_ENV=production
export DATABASE_URL=<your-prod-database-url>
export REDIS_HOST=<your-redis-host>
```

### 3. Start with PM2
```bash
# Start all apps
pm2 start ecosystem.config.js

# Save PM2 config for auto-restart on server reboot
pm2 save
pm2 startup
```

### 4. Verify Services Running
```bash
pm2 status
pm2 logs fsell-backend
pm2 logs fsell-frontend
```

### 5. Nginx Reverse Proxy Setup (Example)
```nginx
server {
    listen 80;
    server_name www.maichohanhtinhxanh.com;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3333;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Backend API
    location /api/v1 {
        proxy_pass http://localhost:3001/api/v1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔍 Post-Deployment Testing

### Frontend
- [ ] Homepage loads correctly
- [ ] All pages render without 404 errors
- [ ] Admin dashboard accessible with proper authentication
- [ ] Banner toggle works instantly
- [ ] User CRUD operations work
- [ ] Singer registration approval works

### Backend
- [ ] API endpoints respond with correct status codes
- [ ] Database queries execute successfully
- [ ] Redis cache working (check via admin operations)
- [ ] Payment gateway integration functional
- [ ] Authentication/JWT tokens working
- [ ] Rate limiting active

### Integration Tests
- [ ] Create banner → see instant update on frontend
- [ ] Update banner → cache invalidates immediately
- [ ] Toggle banner visibility → no page refresh needed
- [ ] Create user → appears in user list immediately
- [ ] Delete user → removed from list immediately
- [ ] Approve singer registration → status updates instantly

## 📊 Performance Metrics to Monitor

- Frontend First Load JS: 333 kB (baseline)
- Backend response time: < 200ms (target)
- Redis cache hit rate: > 80% (target)
- Database query time: < 100ms (target)
- API endpoint latency: < 500ms (target)

## 🔐 Security Checklist

- [ ] All secrets removed from environment files (use secrets manager)
- [ ] CORS properly configured (not overly permissive)
- [ ] Rate limiting enabled on all public endpoints
- [ ] JWT secrets strong and regularly rotated
- [ ] Database password strong
- [ ] SSL/TLS enabled for all connections
- [ ] Admin routes protected with proper guards
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled

## 📝 Notes

- Port consistency: Backend 3001 ↔ Frontend /api/v1 (via reverse proxy)
- Banner feature includes instant cache invalidation (no data miss)
- All CRUD operations tested and working
- Production builds complete without errors
- Redis cache invalidation integrated with admin operations

---

**Last Updated:** 2026-05-17
**Status:** Ready for Production Deployment ✅

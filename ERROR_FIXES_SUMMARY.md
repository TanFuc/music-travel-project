# Error Fixes Summary

## Issues Fixed

### 1. **CORS & Localhost Access Errors**
**Problem**: Production frontend at `https://www.maichohanhtinhxanh.com` was trying to access `http://localhost:2222/api/v1`
- This causes CORS policy violations (cannot access loopback from internet origin)
- Results in Network errors and failed API calls

### 2. **Inconsistent API Port Numbers**
**Problem**: Different files used different hardcoded ports:
- Some files: `localhost:2222`  
- next.config.js: `localhost:3001`
- Backend test files: Mix of `3001` and `3000`

**Solution**: Standardized all frontend development URLs to `localhost:3001/api/v1`

### 3. **Missing Production API Configuration**
**Problem**: The `.env.production` file didn't properly guide where the backend API should be

**Solution**: Updated `.env.production` with clear documentation on API URL configuration

## Files Modified

### Frontend API Configuration Files (Changed `localhost:2222` → `localhost:3001`)
1. `frontend/src/lib/api.ts`
2. `frontend/src/lib/api-server.ts`
3. `frontend/src/lib/sitemap-utils.ts`
4. `frontend/src/app/(main)/tours/[slug]/page.tsx`
5. `frontend/src/app/(main)/shows/[slug]/page.tsx`
6. `frontend/src/app/(main)/combo/[slug]/page.tsx`
7. `frontend/src/components/shows/SeatMapEditor.tsx` (Fixed incorrect API path)

### Configuration Files Updated
- `frontend/.env.production` - Updated with guidance on API URL configuration

## How API URLs Work Now

### Development
```
Frontend: http://localhost:3000
Backend: http://localhost:3001/api/v1
API calls use: http://localhost:3001/api/v1
```

### Production
The `NEXT_PUBLIC_API_URL` environment variable determines the behavior:

**Option 1: Reverse Proxy Setup (Recommended)**
```
NEXT_PUBLIC_API_URL=/api/v1
```
- Frontend at: `https://www.maichohanhtinhxanh.com`
- Server routes `/api/*` to backend
- API calls use: `https://www.maichohanhtinhxanh.com/api/v1`

**Option 2: Separate Backend Domain**
```
NEXT_PUBLIC_API_URL=https://api.maichohanhtinhxanh.com/api/v1
```
- Frontend at: `https://www.maichohanhtinhxanh.com`
- Backend at: `https://api.maichohanhtinhxanh.com`
- API calls use: `https://api.maichohanhtinhxanh.com/api/v1`
- Requires CORS configuration on backend

## What You Need to Do

### Immediate: Deploy Backend
1. Ensure the backend is running on the correct server/domain
2. Check backend is listening on port 3001
3. Verify backend CORS is configured correctly

### For Production Deployment:
1. **Choose your API architecture:**
   - Reverse proxy (simpler, no CORS needed)
   - Separate API domain (more flexible, requires CORS)

2. **Set NEXT_PUBLIC_API_URL accordingly:**
   - In your production build environment
   - In your `.env.production` file
   - Or in your CI/CD deployment pipeline

3. **Configure Backend CORS:**
   ```
   CORS_ORIGINS=https://www.maichohanhtinhxanh.com
   ```

4. **Test API connectivity:**
   - From browser console: `fetch('/api/v1/system-configs/public')`
   - Should return valid response, not CORS error

## Error Messages That Should Now Be Fixed

✅ `Access to XMLHttpRequest at 'http://localhost:2222/api/v1/...` blocked by CORS  
✅ `net::ERR_FAILED` on localhost:2222 requests  
✅ `Error fetching related products: AxiosError: Network Error`

## Remaining Tasks

1. **Backend Deployment**: Ensure backend is running and accessible
2. **Environment Configuration**: Set correct `NEXT_PUBLIC_API_URL` for production
3. **CORS Configuration**: If using separate API domain, update backend CORS settings
4. **Testing**: Verify API calls work from browser network tab

## Notes

- The code now correctly uses `/api/v1` as the base path for API calls
- In production, this is rewritten via next.config.js rewrites
- All hardcoded localhost references have been fixed
- Port consistency (3001) has been established

# Database-Driven QR Payment System

This document describes the refactored QR payment generation system that uses database configuration instead of hard-coded bank information.

## Overview

The QR payment system has been refactored to:
- ✅ Remove hard-coded bank information from source code
- ✅ Store bank configurations in database (`bank_qr_config` table)
- ✅ Provide admin APIs to manage bank configurations
- ✅ Maintain backward compatibility with existing QR generation APIs
- ✅ Support multiple bank configurations with active/inactive status

## Database Schema

### `bank_qr_config` Table

```sql
CREATE TABLE bank_qr_config (
    id SERIAL PRIMARY KEY,
    bank_bin VARCHAR(10) NOT NULL,          -- Bank BIN (e.g., '970422' for MB Bank)
    account_number VARCHAR(20) NOT NULL,    -- Bank account number
    account_name VARCHAR(100) NOT NULL,     -- Account holder name (normalized)
    is_active BOOLEAN DEFAULT true,         -- Only one active config at a time
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### QR Generation (Existing API - No Changes)

```http
POST /api/v1/payment/generate-qr
Content-Type: application/json

{
  "amount": 50000,
  "description": "Payment description"
}
```

**Response:**
```json
{
  "success": true,
  "qrImageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "qrImageUrl": "https://img.vietqr.io/image/mb-8820231001-compact2.jpg?amount=50000",
  "qrContent": "00020101021238570010A000000727...",
  "bank": {
    "bankCode": "MB",
    "bankName": "MB Bank",
    "accountNumber": "8820231001",
    "accountName": "LE DUC TUAN"
  },
  "amount": 50000,
  "description": "Payment description",
  "deeplink": "mbbank://qr?content=00020101021238570010A000000727..."
}
```

### Admin API - Bank QR Configuration Management

#### 1. Create Bank Configuration

```http
POST /api/v1/admin/bank-qr-config
Content-Type: application/json

{
  "bankBin": "970422",
  "accountNumber": "8820231001",
  "accountName": "LE DUC TUAN",
  "isActive": true
}
```

#### 2. Get All Configurations

```http
GET /api/v1/admin/bank-qr-config
```

#### 3. Get Active Configuration

```http
GET /api/v1/admin/bank-qr-config/active
```

#### 4. Get Configuration by ID

```http
GET /api/v1/admin/bank-qr-config/:id
```

#### 5. Update Configuration

```http
PUT /api/v1/admin/bank-qr-config/:id
Content-Type: application/json

{
  "accountName": "UPDATED NAME",
  "isActive": true
}
```

#### 6. Activate Configuration

```http
PUT /api/v1/admin/bank-qr-config/:id/activate
```

#### 7. Delete Configuration

```http
DELETE /api/v1/admin/bank-qr-config/:id
```

## Setup Instructions

### 1. Database Migration

Run the Prisma migration to create the `bank_qr_config` table:

```bash
cd backend
npx prisma migrate dev --name add_bank_qr_config_table
```

### 2. Seed Initial Configuration

Create initial bank configurations:

```bash
node scripts/seed-bank-qr-config.js
```

This will create default configurations for:
- MB Bank (970422) - Active
- VPBank (970432) - Inactive  
- Vietcombank (970436) - Inactive

### 3. Test the System

Run the comprehensive test script:

```bash
node scripts/test-database-qr.js
```

This will:
- Create a test bank configuration
- Generate QR codes using database configuration
- Test all admin API endpoints
- Validate QR code format

## Configuration Priority

The system uses the following priority order for bank configuration:

1. **Database Configuration** (Highest Priority)
   - Active configuration from `bank_qr_config` table
   - Only one configuration can be active at a time

2. **Environment Variables** (Fallback)
   - `ADMIN_BANK_CODE`, `ADMIN_BANK_NAME`
   - `ADMIN_ACCOUNT_NUMBER`, `ADMIN_ACCOUNT_NAME`

3. **Default Values** (Last Resort)
   - Hard-coded defaults for development/demo

## Bank BIN to Bank Code Mapping

| Bank BIN | Bank Code | Bank Name |
|----------|-----------|-----------|
| 970422   | MB        | MB Bank |
| 970436   | VCB       | Vietcombank |
| 970415   | VTB       | Vietinbank |
| 970418   | BIDV      | BIDV |
| 970432   | VPB       | VPBank |
| 970407   | TCB       | Techcombank |
| 970403   | SHB       | SHB |
| 970405   | ACB       | ACB |
| 970448   | OCB       | OCB |

## Error Handling

### No Active Configuration

If no active bank configuration is found, the API returns:

```json
{
  "statusCode": 400,
  "message": "No active bank QR configuration found. Please create and activate a bank configuration using the admin API: POST /admin/bank-qr-config"
}
```

### Unsupported Bank BIN

If the bank BIN is not supported:

```json
{
  "statusCode": 400,
  "message": "Unsupported bank BIN: 999999. Please update the bank configuration with a supported bank BIN (e.g. 970422 for MB Bank)."
}
```

## Security Considerations

### Authentication (Production)

In production, remove the `@Public()` decorator from admin endpoints and implement proper authentication:

```typescript
// Remove this line in production:
@Public()
@Controller('admin/bank-qr-config')
export class BankQRConfigController {
  // Add authentication guards
}
```

### Input Validation

All inputs are validated using class-validator:

- `bankBin`: 6-10 digits, numbers only
- `accountNumber`: 6-20 digits, numbers only  
- `accountName`: 2-100 characters, trimmed and normalized

### Data Sanitization

Account names are automatically:
- Trimmed of whitespace
- Converted to uppercase
- Normalized for QR compatibility (accents removed)

## Migration from Environment Variables

### Step 1: Create Database Configuration

Use the admin API to create your bank configuration:

```bash
curl -X POST http://localhost:3000/api/v1/admin/bank-qr-config \
  -H "Content-Type: application/json" \
  -d '{
    "bankBin": "970422",
    "accountNumber": "8820231001", 
    "accountName": "LE DUC TUAN",
    "isActive": true
  }'
```

### Step 2: Test QR Generation

Verify QR generation works with database configuration:

```bash
curl -X POST http://localhost:3000/api/v1/payment/generate-qr \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "description": "Test payment"
  }'
```

### Step 3: Remove Environment Variables (Optional)

Once database configuration is working, you can remove these environment variables:

```bash
# These are no longer needed:
# ADMIN_BANK_CODE=MB
# ADMIN_BANK_NAME=MB Bank  
# ADMIN_ACCOUNT_NUMBER=8820231001
# ADMIN_ACCOUNT_NAME=LE DUC TUAN
```

## Troubleshooting

### Database Connection Issues

```bash
# Check database connection
npx prisma db push

# Reset database (development only)
npx prisma migrate reset
```

### QR Generation Fails

1. Check active configuration exists:
   ```bash
   curl http://localhost:3000/api/v1/admin/bank-qr-config/active
   ```

2. Validate configuration data:
   - Bank BIN must be 6-10 digits
   - Account number must be 6-20 digits
   - Account name must be at least 2 characters

3. Check server logs for detailed error messages

### Admin API Not Working

1. Ensure `BankQRConfigController` is registered in `PaymentsModule`
2. Check database migration was applied
3. Verify Prisma client is generated: `npx prisma generate`

## Development Scripts

### Seed Database

```bash
node scripts/seed-bank-qr-config.js
```

### Test System

```bash
node scripts/test-database-qr.js
```

### Database Operations

```bash
# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate dev

# Reset database (development)
npx prisma migrate reset

# View database
npx prisma studio
```

## Benefits of Database-Driven Configuration

1. **Flexibility**: Change bank accounts without code deployment
2. **Security**: No sensitive data in source code or environment files
3. **Multi-tenant**: Support multiple bank accounts with easy switching
4. **Audit Trail**: Track configuration changes with timestamps
5. **Hot Swapping**: Change active configuration without server restart
6. **Backup/Restore**: Database configurations can be backed up and restored
7. **Environment Consistency**: Same code works across dev/staging/production

## Future Enhancements

1. **Configuration History**: Track changes to bank configurations
2. **Multiple Active Configs**: Support different configs for different payment types
3. **Scheduled Activation**: Automatically switch configurations at specific times
4. **Configuration Validation**: Real-time validation of bank account details
5. **Webhook Notifications**: Notify external systems when configuration changes
6. **Configuration Templates**: Pre-defined templates for common bank setups
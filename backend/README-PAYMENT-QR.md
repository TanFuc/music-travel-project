# QR Payment API Documentation

## Overview

This API provides QR code generation for bank transfers using the admin bank account configured in environment variables. When the frontend calls the API, the backend dynamically generates a QR code for bank transfer and returns QR image + bank payment info + deeplink.

## Features

- ✅ Admin bank account configuration via environment variables
- ✅ VietQR/EMVCo format QR code generation
- ✅ Base64 PNG QR image generation
- ✅ Bank mobile app deeplink generation
- ✅ Input validation and error handling
- ✅ Clean architecture (Controller/Service/Config)
- ✅ Production-ready code
- ✅ Swagger API documentation

## Environment Configuration

Add these variables to your `.env` file:

```env
# Admin Bank Account (for QR payments)
ADMIN_BANK_CODE=MB
ADMIN_BANK_NAME=MB Bank
ADMIN_ACCOUNT_NUMBER=123456789
ADMIN_ACCOUNT_NAME=ADMIN COMPANY
```

### Supported Bank Codes

- `MB` - MB Bank
- `VCB` - Vietcombank
- `TCB` - Techcombank
- `BIDV` - BIDV
- `ACB` - ACB
- `VPB` - VPBank
- `SHB` - SHB
- `TPB` - TPBank
- `VIB` - VIB
- `MSB` - MSB
- And more...

## API Endpoints

### 1. Generate QR Payment (Main Endpoint)

**POST** `/api/v1/payment/generate-qr`

Generate QR code using admin bank account from environment configuration.

#### Request Body

```json
{
  "amount": 100000,          // optional, number
  "description": "Payment for order #123"  // optional, string
}
```

#### Response

```json
{
  "success": true,
  "qrImageBase64": "data:image/png;base64,iVBORw0KGgoAAA...",
  "qrContent": "00020101021238540010A00000072701270006970454...",
  "bank": {
    "bankCode": "MB",
    "bankName": "MB Bank",
    "accountNumber": "123456789",
    "accountName": "ADMIN COMPANY"
  },
  "amount": 100000,
  "description": "Payment for order #123",
  "deeplink": "mbbank://qr-payment?data=..."
}
```

### 2. Generate Custom QR (Legacy)

**POST** `/api/v1/payment/generate-custom-qr`

Generate QR code with custom bank account details.

#### Request Body

```json
{
  "bankCode": "MB",
  "accountNumber": "0123456789",
  "accountName": "NGUYEN VAN A",
  "amount": 100000,
  "description": "Custom payment"
}
```

### 3. Get QR as Image

**GET** `/api/v1/payment/qr-image`

Generate and return QR code as base64 image.

#### Query Parameters

- `bankCode` (required) - Bank code
- `accountNumber` (required) - Account number
- `accountName` (required) - Account holder name
- `amount` (optional) - Amount in VND
- `description` (optional) - Payment description

### 4. Get Supported Banks

**GET** `/api/v1/payment/banks`

Get list of all supported Vietnamese banks.

### 5. Health Check

**GET** `/api/v1/payment/health`

Check if the bank QR service is working properly.

## Bank Deeplinks

The API automatically generates deeplinks for supported bank mobile apps:

- **MB Bank**: `mbbank://qr-payment?data=...`
- **Vietcombank**: `vcb://qr-payment?data=...`
- **Techcombank**: `tcb://qr-payment?data=...`
- **BIDV**: `bidv://qr-payment?data=...`
- **ACB**: `acb://qr-payment?data=...`
- **VPBank**: `vpbank://qr-payment?data=...`

## Example Usage

### cURL Example

```bash
# Generate QR with admin account
curl -X POST http://localhost:3001/api/v1/payment/generate-qr \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "description": "Test payment"
  }'

# Generate custom QR
curl -X POST http://localhost:3001/api/v1/payment/generate-custom-qr \
  -H "Content-Type: application/json" \
  -d '{
    "bankCode": "MB",
    "accountNumber": "0123456789",
    "accountName": "NGUYEN VAN A",
    "amount": 50000,
    "description": "Custom payment test"
  }'

# Get supported banks
curl -X GET http://localhost:3001/api/v1/payment/banks

# Health check
curl -X GET http://localhost:3001/api/v1/payment/health
```

### JavaScript/TypeScript Example

```typescript
// Frontend service call
const response = await paymentService.generateQRPayment({
  amount: 100000,
  description: "Payment for order #123"
});

console.log('QR Generated:', response);
// Use response.qrImageBase64 to display QR code
// Use response.deeplink to open bank app
```

## Error Handling

The API returns structured error responses:

```json
{
  "success": false,
  "message": "Admin bank account not properly configured",
  "error": "BAD_REQUEST",
  "statusCode": 400
}
```

### Common Error Cases

1. **Admin bank not configured** (400)
   - Missing environment variables
   - Invalid bank code

2. **Invalid input** (400)
   - Invalid amount (negative or too large)
   - Description too long
   - Invalid characters

3. **QR generation failed** (500)
   - QR library error
   - Image generation error

## Testing

### Local Development

1. Set up environment variables in `.env`
2. Start the server: `npm run start:dev`
3. Visit Swagger docs: `http://localhost:3001/docs`
4. Test endpoints using Swagger UI or cURL

### Test Endpoint

**GET** `/api/v1/payment/test-qr` (Development only)

Generates a test QR code with sample data.

## Architecture

```
src/modules/payments/
├── controllers/
│   └── bank-qr.controller.ts     # API endpoints
├── services/
│   ├── admin-qr.service.ts       # Admin QR generation logic
│   ├── bank-qr.service.ts        # Custom QR generation logic
│   ├── vietqr.service.ts         # VietQR format handling
│   └── bank-deeplink.service.ts  # Deeplink generation
├── dto/
│   ├── admin-qr.dto.ts           # Admin QR request/response types
│   └── bank-qr.dto.ts            # Bank QR types
└── interfaces/
    └── bank.interface.ts         # Bank-related interfaces
```

## Security Considerations

- All endpoints are currently public for testing
- Input validation using class-validator
- Environment variables for sensitive bank account data
- Rate limiting should be implemented in production
- HTTPS required in production

## Production Deployment

1. Set proper environment variables
2. Enable authentication/authorization
3. Configure rate limiting
4. Set up monitoring and logging
5. Use HTTPS
6. Consider caching for better performance

## Frontend Integration

The frontend `PaymentQRModal` component automatically:

1. Calls the API when modal opens
2. Shows loading spinner during generation
3. Displays QR code and bank information
4. Provides deeplink button to open bank app
5. Handles errors with retry functionality

## Support

For issues or questions:
1. Check the logs for detailed error messages
2. Verify environment configuration
3. Test with the health check endpoint
4. Use Swagger docs for API testing
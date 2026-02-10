# Vietnam Bank Payment QR Code API

A production-ready backend API for generating Vietnam bank payment QR codes and deeplinks using VietQR/EMVCo standard.

## Features

- ✅ **VietQR EMVCo Format**: Generate standard VietQR payment codes
- ✅ **20+ Vietnamese Banks**: Support for major banks (MB, VCB, TCB, BIDV, ACB, VPBank, etc.)
- ✅ **QR Code Generation**: Base64 images and PNG file endpoints
- ✅ **Mobile App Deeplinks**: Direct links to bank mobile apps
- ✅ **Input Validation**: Comprehensive validation for all parameters
- ✅ **Clean Architecture**: Modular services and controllers
- ✅ **Production Ready**: Error handling, logging, caching
- ✅ **Swagger Documentation**: Complete API documentation
- ✅ **Test Mode**: Development testing capabilities

## Supported Banks

| Bank Code | Bank Name | QR Support | Deeplink Support |
|-----------|-----------|------------|------------------|
| MB | MB Bank | ✅ | ✅ |
| VCB | Vietcombank | ✅ | ✅ |
| TCB | Techcombank | ✅ | ✅ |
| BIDV | BIDV | ✅ | ✅ |
| ACB | ACB | ✅ | ✅ |
| VPB | VPBank | ✅ | ✅ |
| TPB | TPBank | ✅ | ✅ |
| SHB | SHB | ✅ | ❌ |
| VIB | VIB | ✅ | ❌ |
| MSB | MSB | ✅ | ❌ |
| SACOM | Sacombank | ✅ | ❌ |
| EIB | Eximbank | ✅ | ❌ |
| OCB | OCB | ✅ | ❌ |
| NAB | Nam A Bank | ✅ | ❌ |
| VAB | VietA Bank | ✅ | ❌ |
| PGB | PGBank | ✅ | ❌ |
| AGRI | Agribank | ✅ | ❌ |
| SCB | SCB | ✅ | ❌ |
| BAC_A_BANK | Bac A Bank | ✅ | ❌ |
| PVCOM | PVcomBank | ✅ | ❌ |

## API Endpoints

### 1. Generate QR Code with Deeplink
```http
POST /api/v1/payment/generate-qr
Content-Type: application/json

{
  "bankCode": "MB",
  "accountNumber": "0123456789",
  "accountName": "NGUYEN VAN A",
  "amount": 100000,
  "description": "Thanh toan don hang #12345"
}
```

**Response:**
```json
{
  "qrBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "qrContent": "00020101021238540010A00000072701270006970454011501234567890208QRIBFTTA53037045802VN6304...",
  "deeplink": "mbbank://qr-payment?data=...",
  "bankCode": "MB",
  "accountNumber": "0123456789",
  "accountName": "NGUYEN VAN A",
  "amount": 100000,
  "description": "Thanh toan don hang #12345",
  "bankName": "MB Bank (Military Commercial Joint Stock Bank)",
  "deeplinkSupported": true
}
```

### 2. Generate QR as PNG Image
```http
GET /api/v1/payment/qr-image?bankCode=MB&accountNumber=0123456789&accountName=NGUYEN%20VAN%20A&amount=100000&description=Test%20payment
```

Returns PNG image file directly.

### 3. Get Supported Banks
```http
GET /api/v1/payment/banks
```

### 4. Validate QR String
```http
POST /api/v1/payment/validate-qr
Content-Type: application/json

{
  "qrString": "00020101021238540010A00000072701270006970454011501234567890208QRIBFTTA53037045802VN6304..."
}
```

### 5. Test QR (Development Only)
```http
GET /api/v1/payment/test-qr
```

### 6. Health Check
```http
GET /api/v1/payment/health
```

## Installation & Setup

### 1. Install Dependencies
```bash
npm install qrcode @types/qrcode class-validator class-transformer
```

### 2. Environment Variables
Add to your `.env` file:
```env
# Bank QR Configuration
NODE_ENV=development
BANK_QR_TEST_MODE=true

# Optional: Custom QR settings
QR_ERROR_CORRECTION_LEVEL=M
QR_IMAGE_WIDTH=300
QR_IMAGE_MARGIN=2
```

### 3. Run the Application
```bash
npm run dev
```

The API will be available at:
- **Base URL**: `http://localhost:3001/api/v1/payment/`
- **Swagger Docs**: `http://localhost:3001/docs`

## Usage Examples

### cURL Examples

**Generate QR with amount:**
```bash
curl -X POST "http://localhost:3001/api/v1/payment/generate-qr" \
  -H "Content-Type: application/json" \
  -d '{
    "bankCode": "MB",
    "accountNumber": "0123456789",
    "accountName": "NGUYEN VAN A",
    "amount": 100000,
    "description": "Thanh toan don hang #12345"
  }'
```

**Generate static QR (no amount):**
```bash
curl -X POST "http://localhost:3001/api/v1/payment/generate-qr" \
  -H "Content-Type: application/json" \
  -d '{
    "bankCode": "VCB",
    "accountNumber": "1234567890",
    "accountName": "TRAN THI B"
  }'
```

**Download QR as PNG:**
```bash
curl "http://localhost:3001/api/v1/payment/qr-image?bankCode=TCB&accountNumber=9876543210&accountName=LE%20VAN%20C&amount=50000" \
  -o qr-code.png
```

### JavaScript/TypeScript Example

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/v1/payment';

// Generate QR code
async function generateBankQR() {
  try {
    const response = await axios.post(`${API_BASE}/generate-qr`, {
      bankCode: 'MB',
      accountNumber: '0123456789',
      accountName: 'NGUYEN VAN A',
      amount: 100000,
      description: 'Payment for order #12345'
    });

    console.log('QR Generated:', response.data);
    
    // Use the base64 image
    const qrImage = response.data.qrBase64;
    
    // Use the deeplink for mobile
    if (response.data.deeplink) {
      window.location.href = response.data.deeplink;
    }
    
    return response.data;
  } catch (error) {
    console.error('QR Generation failed:', error.response?.data);
  }
}

// Get supported banks
async function getSupportedBanks() {
  const response = await axios.get(`${API_BASE}/banks`);
  return response.data.data;
}
```

### React Example

```tsx
import React, { useState } from 'react';
import axios from 'axios';

const BankQRGenerator = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQR = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/v1/payment/generate-qr', formData);
      setQrData(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {qrData && (
        <div>
          <img src={qrData.qrBase64} alt="QR Code" />
          {qrData.deeplink && (
            <a href={qrData.deeplink}>Open in {qrData.bankName}</a>
          )}
        </div>
      )}
    </div>
  );
};
```

## Request/Response Schemas

### GenerateBankQRDto
```typescript
{
  bankCode: VietnamBankCode;     // Required: Bank code (MB, VCB, etc.)
  accountNumber: string;         // Required: 6-20 digits
  accountName: string;           // Required: Account holder name
  amount?: number;               // Optional: Amount in VND (1000-500000000)
  description?: string;          // Optional: Payment description (max 200 chars)
}
```

### BankQRResponse
```typescript
{
  qrBase64: string;              // Base64 encoded PNG image
  qrContent: string;             // Raw VietQR EMVCo string
  deeplink?: string;             // Bank mobile app deeplink
  bankCode: string;              // Bank code
  accountNumber: string;         // Account number
  accountName: string;           // Account holder name
  amount?: number;               // Amount (if specified)
  description?: string;          // Description (if specified)
  bankName: string;              // Full bank name
  deeplinkSupported: boolean;    // Whether deeplink is supported
}
```

## Validation Rules

- **bankCode**: Must be one of supported bank codes
- **accountNumber**: 6-20 digits, bank-specific validation
- **accountName**: 1-100 characters, auto-normalized for Vietnamese
- **amount**: Optional, 1,000 - 500,000,000 VND
- **description**: Optional, max 200 characters

## Error Handling

The API returns structured error responses:

```json
{
  "statusCode": 400,
  "message": "Invalid account number format for the selected bank",
  "error": "Bad Request"
}
```

Common error codes:
- `400`: Invalid input parameters
- `500`: QR generation failed

## Testing

### Test Mode
In development (`NODE_ENV=development`), you can use the test endpoint:

```bash
curl http://localhost:3001/api/v1/payment/test-qr
```

### Manual Testing
1. Use the `/health` endpoint to verify service status
2. Use `/banks` to get supported bank list
3. Test with different banks using `/generate-qr`
4. Validate generated QR codes using `/validate-qr`

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
BANK_QR_TEST_MODE=false

# Optional customization
QR_ERROR_CORRECTION_LEVEL=M
QR_IMAGE_WIDTH=300
QR_CACHE_TTL=3600
```

### Performance Considerations
- QR images are cached for 1 hour
- Use appropriate error correction level
- Consider rate limiting for public endpoints
- Monitor QR generation performance

### Security
- Validate all inputs thoroughly
- Sanitize account names and descriptions
- Log suspicious requests
- Consider API authentication for production

## Architecture

```
src/modules/payments/
├── controllers/
│   └── bank-qr.controller.ts       # API endpoints
├── services/
│   ├── bank-qr.service.ts          # Main service
│   ├── vietqr.service.ts           # VietQR/EMVCo generation
│   └── bank-deeplink.service.ts    # Mobile app deeplinks
├── dto/
│   └── bank-qr.dto.ts              # Request/response DTOs
├── interfaces/
│   └── bank.interface.ts           # Type definitions
└── payments.module.ts              # Module configuration
```

## Contributing

1. Add new banks to `VietQRService.bankInfo`
2. Implement bank-specific deeplinks in `BankDeeplinkService`
3. Add validation rules in `BankQRService.validateBankAccount`
4. Update documentation and tests

## License

This implementation follows Vietnam's VietQR standard and EMVCo QR Code specifications.
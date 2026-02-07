# Payment QR Code System

Hệ thống thanh toán QR Code cho các ngân hàng Việt Nam, hỗ trợ chuẩn VietQR và EMVCo.

## 🚀 Tính năng

### Backend API
- ✅ Tạo mã QR thanh toán theo chuẩn VietQR/EMVCo
- ✅ Hỗ trợ 20+ ngân hàng Việt Nam (VCB, MB, TCB, BIDV, ACB, VPBank...)
- ✅ Tạo deeplink mở trực tiếp app ngân hàng
- ✅ Tải xuống hình ảnh QR (PNG)
- ✅ Validate mã QR
- ✅ Test mode và production mode
- ✅ RESTful API với Swagger documentation

### Frontend Components
- ✅ Modal tạo QR thanh toán
- ✅ Selector ngân hàng với tìm kiếm
- ✅ Hiển thị QR code với thông tin chi tiết
- ✅ Nút download, copy, share, mở app ngân hàng
- ✅ Responsive design cho mobile và desktop
- ✅ Success screen sau khi thanh toán
- ✅ Tích hợp vào trang checkout

## 🏗️ Cấu trúc

### Backend
```
backend/src/modules/payments/
├── controllers/
│   └── bank-qr.controller.ts      # API endpoints
├── services/
│   ├── bank-qr.service.ts         # Main business logic
│   ├── vietqr.service.ts          # VietQR generation
│   └── bank-deeplink.service.ts   # Deeplink generation
├── dto/
│   └── bank-qr.dto.ts            # Request/Response DTOs
├── interfaces/
│   └── bank.interface.ts         # Type definitions
└── payments.module.ts            # Module configuration
```

### Frontend
```
frontend/src/components/payment/
├── BankQRPayment.tsx      # Main QR display component
├── BankSelector.tsx       # Bank selection dropdown
├── PaymentQRModal.tsx     # Payment form modal
├── BankQRSuccess.tsx      # Success screen
└── index.ts              # Exports

frontend/src/services/
└── payment.service.ts     # API service layer
```

## 🔧 Cài đặt và Chạy

### Backend

1. **Cài đặt dependencies:**
```bash
cd backend
npm install
```

2. **Cấu hình environment:**
```bash
cp .env.example .env
# Cập nhật DATABASE_URL và các config khác
```

3. **Chạy database:**
```bash
# Sử dụng Docker
docker compose up -d

# Hoặc sử dụng local PostgreSQL + Redis
brew services start postgresql@15
brew services start redis
```

4. **Migrate database:**
```bash
npx prisma generate
npx prisma migrate deploy
```

5. **Chạy backend:**
```bash
npm run dev
```

### Frontend

1. **Cài đặt dependencies:**
```bash
cd frontend
npm install
```

2. **Chạy frontend:**
```bash
npm run dev
```

## 📱 Sử dụng

### 1. Demo Page
Truy cập: `http://localhost:3000/payment-demo`

Trang demo cho phép test các tính năng:
- Thanh toán vé show (500,000 VND)
- Thanh toán tour (2,500,000 VND)  
- Thanh toán tự do (số tiền tùy chọn)

### 2. Checkout Integration
Trong trang checkout (`/checkout`), chọn phương thức "QR Ngân hàng" để mở modal thanh toán QR.

### 3. API Endpoints

#### Tạo mã QR
```http
POST /api/v1/payment/generate-qr
Content-Type: application/json

{
  "bankCode": "VCB",
  "accountNumber": "1234567890",
  "accountName": "NGUYEN VAN A",
  "amount": 100000,
  "description": "Thanh toan ve show"
}
```

#### Tải hình ảnh QR
```http
GET /api/v1/payment/qr-image?bankCode=VCB&accountNumber=1234567890&accountName=NGUYEN%20VAN%20A&amount=100000
```

#### Danh sách ngân hàng
```http
GET /api/v1/payment/banks
```

#### Health check
```http
GET /api/v1/payment/health
```

## 🏦 Ngân hàng hỗ trợ

| Mã ngân hàng | Tên ngân hàng | Deeplink |
|--------------|---------------|----------|
| VCB | Vietcombank | ✅ |
| MB | MBBank | ✅ |
| TCB | Techcombank | ✅ |
| BIDV | BIDV | ✅ |
| ACB | ACB | ✅ |
| VPB | VPBank | ✅ |
| VTB | Vietinbank | ✅ |
| SHB | SHB | ✅ |
| ... | 12+ ngân hàng khác | ✅ |

## 📱 Mobile Features

### Deeplink Support
- Tự động mở app ngân hàng khi ở chế độ mobile
- Fallback instructions nếu deeplink không hoạt động
- Support các scheme: `vcb://`, `mbbank://`, `tcb://`, etc.

### Responsive Design
- QR code tự động scale theo màn hình
- Touch-friendly buttons
- Optimized cho cả portrait và landscape

## 🔒 Bảo mật

- Validate input data (account number, amount)
- Sanitize Vietnamese text
- CRC-16 checksum cho QR content
- Test mode để tránh tạo QR thật trong development

## 🧪 Testing

### Backend API Test
```bash
cd backend
node test-qr-api.js
```

### Frontend Components
- Truy cập `/payment-demo` để test UI
- Test responsive trên mobile device
- Test deeplink trên mobile browser

## 🚀 Production Deployment

### Backend
1. Set `BANK_QR_TEST_MODE=false` trong production
2. Configure proper Redis và PostgreSQL
3. Set up proper CORS origins
4. Enable rate limiting

### Frontend
1. Update API base URL
2. Configure proper environment variables
3. Test trên các trình duyệt khác nhau
4. Test deeplink trên các thiết bị mobile thực

## 📝 TODO

- [ ] Webhook để xác nhận thanh toán thực tế
- [ ] Lưu transaction history
- [ ] Email notification
- [ ] SMS notification
- [ ] Analytics và reporting
- [ ] Multi-language support
- [ ] Dark mode support

## 🐛 Troubleshooting

### Backend không start
- Kiểm tra DATABASE_URL trong .env
- Đảm bảo PostgreSQL và Redis đang chạy
- Chạy `npx prisma generate` nếu có lỗi Prisma

### QR không hiển thị
- Kiểm tra network tab trong browser
- Verify API endpoint đang hoạt động
- Check console errors

### Deeplink không hoạt động
- Chỉ hoạt động trên mobile device
- Cần cài app ngân hàng tương ứng
- iOS có thể cần user interaction trước

## 📞 Support

Nếu có vấn đề, hãy kiểm tra:
1. Backend logs
2. Browser console
3. Network requests
4. Environment variables

---

**Tác giả:** AI Assistant  
**Cập nhật:** 2026-02-07
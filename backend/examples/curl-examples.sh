#!/bin/bash

# Vietnam Bank QR API - cURL Examples
# Make sure the backend is running on http://localhost:3001

API_BASE="http://localhost:3001/api/v1/payment"

echo "🏦 Vietnam Bank QR API - cURL Examples"
echo "======================================"
echo

# 1. Health Check
echo "1️⃣ Health Check"
echo "curl $API_BASE/health"
curl -s "$API_BASE/health" | jq '.'
echo
echo

# 2. Get Supported Banks
echo "2️⃣ Get Supported Banks"
echo "curl $API_BASE/banks"
curl -s "$API_BASE/banks" | jq '.data[0:3]'
echo
echo

# 3. Generate QR with Amount (MB Bank)
echo "3️⃣ Generate QR with Amount (MB Bank)"
echo "curl -X POST $API_BASE/generate-qr -H 'Content-Type: application/json' -d '{...}'"
curl -s -X POST "$API_BASE/generate-qr" \
  -H "Content-Type: application/json" \
  -d '{
    "bankCode": "MB",
    "accountNumber": "0123456789",
    "accountName": "NGUYEN VAN A",
    "amount": 100000,
    "description": "Thanh toan don hang #12345"
  }' | jq '{bankName, amount, deeplinkSupported, qrContent: (.qrContent | length)}'
echo
echo

# 4. Generate Static QR (Vietcombank)
echo "4️⃣ Generate Static QR (Vietcombank)"
curl -s -X POST "$API_BASE/generate-qr" \
  -H "Content-Type: application/json" \
  -d '{
    "bankCode": "VCB",
    "accountNumber": "1234567890123",
    "accountName": "TRAN THI B"
  }' | jq '{bankName, amount, accountNumber}'
echo
echo

# 5. Generate QR for Techcombank
echo "5️⃣ Generate QR for Techcombank"
curl -s -X POST "$API_BASE/generate-qr" \
  -H "Content-Type: application/json" \
  -d '{
    "bankCode": "TCB",
    "accountNumber": "9876543210",
    "accountName": "LE VAN C",
    "amount": 250000,
    "description": "Chuyen tien ung ho"
  }' | jq '{bankName, deeplinkSupported, deeplink: (.deeplink // "N/A")}'
echo
echo

# 6. Download QR as PNG (saves to file)
echo "6️⃣ Download QR as PNG Image"
echo "curl '$API_BASE/qr-image?...' -o sample-qr.png"
curl -s "$API_BASE/qr-image?bankCode=BIDV&accountNumber=5555666677&accountName=PHAM%20VAN%20D&amount=75000&description=Test%20PNG" \
  -o "sample-qr.png"
echo "✅ QR image saved to sample-qr.png ($(wc -c < sample-qr.png) bytes)"
echo
echo

# 7. Validate QR String
echo "7️⃣ Validate QR String"
QR_STRING=$(curl -s -X POST "$API_BASE/generate-qr" \
  -H "Content-Type: application/json" \
  -d '{
    "bankCode": "ACB",
    "accountNumber": "1111222233",
    "accountName": "TEST USER",
    "amount": 50000
  }' | jq -r '.qrContent')

curl -s -X POST "$API_BASE/validate-qr" \
  -H "Content-Type: application/json" \
  -d "{\"qrString\": \"$QR_STRING\"}" | jq '.'
echo
echo

# 8. Test QR (Development only)
echo "8️⃣ Test QR (Development only)"
echo "curl $API_BASE/test-qr"
curl -s "$API_BASE/test-qr" | jq '{bankName, amount, deeplinkSupported}' 2>/dev/null || echo "Test mode not available"
echo
echo

# 9. Error handling example
echo "9️⃣ Error Handling Example"
echo "curl -X POST $API_BASE/generate-qr (with invalid data)"
curl -s -X POST "$API_BASE/generate-qr" \
  -H "Content-Type: application/json" \
  -d '{
    "bankCode": "INVALID",
    "accountNumber": "123",
    "accountName": "TEST"
  }' | jq '.'
echo
echo

echo "🎉 All examples completed!"
echo
echo "📚 Next steps:"
echo "   1. Check the generated QR image: sample-qr.png"
echo "   2. Visit http://localhost:3001/docs for Swagger documentation"
echo "   3. Test deeplinks on mobile devices"
echo "   4. Integrate with your application"
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1';

async function testBankQRAPI() {
  try {
    console.log('🧪 Testing Bank QR API...\n');

    // Test health check
    try {
      const health = await axios.get(`${API_BASE}/payment/health`);
      console.log('✅ Health check:', health.data);
    } catch (err) {
      console.log('❌ Health check failed:', err.response?.data || err.message);
    }

    // Test generate QR
    try {
      const qrData = {
        bankCode: 'VCB',
        accountNumber: '1234567890',
        accountName: 'NGUYEN VAN A',
        amount: 100000,
        description: 'Test payment'
      };

      const response = await axios.post(`${API_BASE}/payment/generate-qr`, qrData);
      console.log('✅ Generate QR:', {
        bankCode: response.data.data.bankCode,
        qrContent: response.data.data.qrContent.substring(0, 50) + '...',
        hasQrBase64: !!response.data.data.qrBase64,
        deeplink: response.data.data.deeplink
      });
    } catch (err) {
      console.log('❌ Generate QR failed:', err.response?.data || err.message);
    }

    // Test list banks
    try {
      const banks = await axios.get(`${API_BASE}/payment/banks`);
      console.log('✅ List banks:', Object.keys(banks.data.data).length, 'banks available');
    } catch (err) {
      console.log('❌ List banks failed:', err.response?.data || err.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBankQRAPI();
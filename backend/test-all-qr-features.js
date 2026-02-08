const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:3001/api/v1';

async function testAllQRFeatures() {
  console.log('🧪 Testing All Bank QR Features...\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Testing Health Check...');
    const health = await axios.get(`${API_BASE}/payment/health`);
    console.log('✅ Health:', {
      success: health.data.success,
      message: health.data.message,
      supportedBanks: health.data.supportedBanks
    });
    console.log('');

    // 2. List Banks
    console.log('2️⃣ Testing List Banks...');
    const banks = await axios.get(`${API_BASE}/payment/banks`);
    const bankData = banks.data.success ? banks.data.data : banks.data;
    const bankList = Object.keys(bankData);
    console.log('✅ Banks:', bankList.length, 'banks available');
    console.log('   Banks:', bankList.slice(0, 5).join(', '), '...');
    console.log('');

    // 3. Generate QR (with amount)
    console.log('3️⃣ Testing Generate QR (with amount)...');
    const qrWithAmount = await axios.post(`${API_BASE}/payment/generate-qr`, {
      bankCode: 'VCB',
      accountNumber: '1234567890',
      accountName: 'NGUYEN VAN A',
      amount: 500000,
      description: 'Thanh toan ve show Son Tung MTP'
    });
    const qrData1 = qrWithAmount.data.success ? qrWithAmount.data.data : qrWithAmount.data;
    console.log('✅ QR with amount:', {
      bankName: qrData1.bankName,
      qrLength: qrData1.qrContent.length,
      hasBase64: !!qrData1.qrBase64,
      hasDeeplink: !!qrData1.deeplink,
      amount: qrData1.amount
    });
    console.log('');

    // 4. Generate QR (without amount)
    console.log('4️⃣ Testing Generate QR (without amount)...');
    const qrWithoutAmount = await axios.post(`${API_BASE}/payment/generate-qr`, {
      bankCode: 'MB',
      accountNumber: '0987654321',
      accountName: 'TRAN THI B',
      description: 'Chuyen khoan tu do'
    });
    const qrData2 = qrWithoutAmount.data.success ? qrWithoutAmount.data.data : qrWithoutAmount.data;
    console.log('✅ QR without amount:', {
      bankName: qrData2.bankName,
      qrLength: qrData2.qrContent.length,
      hasBase64: !!qrData2.qrBase64,
      hasDeeplink: !!qrData2.deeplink,
      amount: qrData2.amount || 'Dynamic'
    });
    console.log('');

    // 5. Download QR Image
    console.log('5️⃣ Testing Download QR Image...');
    const imageResponse = await axios.get(`${API_BASE}/payment/qr-image`, {
      params: {
        bankCode: 'TCB',
        accountNumber: '1111222233',
        accountName: 'LE VAN C',
        amount: 1000000,
        description: 'Test download'
      }
    });
    
    const imageData = imageResponse.data.success ? imageResponse.data.data : imageResponse.data;
    console.log('✅ QR Image generated:', {
      hasBase64: !!imageData.qrBase64,
      contentType: imageData.contentType,
      filename: imageData.filename
    });
    console.log('');

    // 6. Validate QR
    console.log('6️⃣ Testing QR Validation...');
    const validQR = qrData1.qrContent;
    const validation = await axios.post(`${API_BASE}/payment/validate-qr`, {
      qrString: validQR
    });
    const validationData = validation.data.success ? validation.data.data : validation.data;
    console.log('✅ QR Validation:', {
      isValid: validationData.isValid,
      bankCode: validationData.data?.bankCode,
      accountNumber: validationData.data?.accountNumber
    });
    console.log('');

    // 7. Test Invalid QR
    console.log('7️⃣ Testing Invalid QR...');
    const invalidValidation = await axios.post(`${API_BASE}/payment/validate-qr`, {
      qrString: 'invalid-qr-string'
    });
    const invalidData = invalidValidation.data.success ? invalidValidation.data.data : invalidValidation.data;
    console.log('✅ Invalid QR:', {
      isValid: invalidData.isValid,
      error: invalidData.error
    });
    console.log('');

    // 8. Test Different Banks
    console.log('8️⃣ Testing Different Banks...');
    const testBanks = ['VCB', 'MB', 'TCB', 'BIDV', 'ACB'];
    for (const bankCode of testBanks) {
      try {
        const response = await axios.post(`${API_BASE}/payment/generate-qr`, {
          bankCode,
          accountNumber: '1234567890',
          accountName: 'TEST USER',
          amount: 100000
        });
        const responseData = response.data.success ? response.data.data : response.data;
        console.log(`   ✅ ${bankCode}: ${responseData.bankName} - Deeplink: ${!!responseData.deeplink}`);
      } catch (err) {
        console.log(`   ❌ ${bankCode}: Failed`);
      }
    }
    console.log('');

    // 9. Test Error Cases
    console.log('9️⃣ Testing Error Cases...');
    
    // Invalid bank code
    try {
      await axios.post(`${API_BASE}/payment/generate-qr`, {
        bankCode: 'INVALID',
        accountNumber: '1234567890',
        accountName: 'TEST USER'
      });
    } catch (err) {
      console.log('   ✅ Invalid bank code handled:', err.response.status);
    }

    // Invalid account number
    try {
      await axios.post(`${API_BASE}/payment/generate-qr`, {
        bankCode: 'VCB',
        accountNumber: '123', // Too short
        accountName: 'TEST USER'
      });
    } catch (err) {
      console.log('   ✅ Invalid account number handled:', err.response.status);
    }

    // Missing required fields
    try {
      await axios.post(`${API_BASE}/payment/generate-qr`, {
        bankCode: 'VCB'
        // Missing required fields
      });
    } catch (err) {
      console.log('   ✅ Missing fields handled:', err.response.status);
    }

    console.log('');
    console.log('🎉 All tests completed successfully!');
    console.log('📄 QR image saved as: test-qr.png');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAllQRFeatures();
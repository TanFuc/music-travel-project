#!/usr/bin/env node

/**
 * Bank QR API Examples
 * 
 * Run with: node examples/bank-qr-examples.js
 * Make sure the backend is running on http://localhost:3001
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api/v1/payment';

async function testBankQRAPI() {
  console.log('🏦 Testing Vietnam Bank QR API\n');

  try {
    // 1. Health check
    console.log('1️⃣ Health Check...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Service Status:', health.data.message);
    console.log('📊 Supported Banks:', health.data.supportedBanks);
    console.log();

    // 2. Get supported banks
    console.log('2️⃣ Getting Supported Banks...');
    const banks = await axios.get(`${API_BASE}/banks`);
    console.log('✅ Total Banks:', banks.data.total);
    console.log('📋 Sample Banks:');
    banks.data.data.slice(0, 5).forEach(bank => {
      console.log(`   ${bank.code} - ${bank.name} (QR: ${bank.qrSupported ? '✅' : '❌'}, Deeplink: ${bank.deeplinkSupported ? '✅' : '❌'})`);
    });
    console.log();

    // 3. Generate QR with amount (MB Bank)
    console.log('3️⃣ Generating QR Code with Amount (MB Bank)...');
    const qrWithAmount = await axios.post(`${API_BASE}/generate-qr`, {
      bankCode: 'MB',
      accountNumber: '0123456789',
      accountName: 'NGUYEN VAN A',
      amount: 100000,
      description: 'Thanh toan don hang #12345'
    });
    
    console.log('✅ QR Generated Successfully!');
    console.log('🏦 Bank:', qrWithAmount.data.data.bankName);
    console.log('💰 Amount:', qrWithAmount.data.data.amount?.toLocaleString(), 'VND');
    console.log('📱 Deeplink Available:', qrWithAmount.data.data.deeplinkSupported ? '✅' : '❌');
    console.log('🔗 QR Content Length:', qrWithAmount.data.data.qrContent.length, 'characters');
    
    if (qrWithAmount.data.data.deeplink) {
      console.log('📲 Deeplink:', qrWithAmount.data.data.deeplink.substring(0, 50) + '...');
    }
    console.log();

    // 4. Generate static QR (no amount) - Vietcombank
    console.log('4️⃣ Generating Static QR Code (Vietcombank)...');
    const staticQR = await axios.post(`${API_BASE}/generate-qr`, {
      bankCode: 'VCB',
      accountNumber: '1234567890123',
      accountName: 'TRAN THI B'
    });
    
    console.log('✅ Static QR Generated!');
    console.log('🏦 Bank:', staticQR.data.data.bankName);
    console.log('💰 Amount:', staticQR.data.data.amount || 'Not specified (Static QR)');
    console.log();

    // 5. Generate QR for Techcombank with deeplink
    console.log('5️⃣ Generating QR with Deeplink (Techcombank)...');
    const tcbQR = await axios.post(`${API_BASE}/generate-qr`, {
      bankCode: 'TCB',
      accountNumber: '9876543210',
      accountName: 'LE VAN C',
      amount: 250000,
      description: 'Chuyen tien ung ho'
    });
    
    console.log('✅ TCB QR Generated!');
    console.log('🏦 Bank:', tcbQR.data.data.bankName);
    console.log('📱 Deeplink:', tcbQR.data.data.deeplinkSupported ? '✅ Available' : '❌ Not supported');
    console.log();

    // 6. Download QR as PNG image
    console.log('6️⃣ Downloading QR as PNG Image...');
    const imageResponse = await axios.get(`${API_BASE}/qr-image`, {
      params: {
        bankCode: 'BIDV',
        accountNumber: '5555666677',
        accountName: 'PHAM VAN D',
        amount: 75000,
        description: 'Test PNG download'
      },
      responseType: 'arraybuffer'
    });
    
    const imagePath = path.join(__dirname, 'sample-qr.png');
    fs.writeFileSync(imagePath, imageResponse.data);
    console.log('✅ QR Image saved to:', imagePath);
    console.log('📏 Image size:', imageResponse.data.length, 'bytes');
    console.log();

    // 7. Validate QR string
    console.log('7️⃣ Validating QR String...');
    const validation = await axios.post(`${API_BASE}/validate-qr`, {
      qrString: qrWithAmount.data.data.qrContent
    });
    
    console.log('✅ QR Validation Result:', validation.data.valid ? 'Valid' : 'Invalid');
    if (validation.data.data) {
      console.log('📋 Parsed Data:');
      console.log('   Bank Code:', validation.data.data.bankCode);
      console.log('   Account:', validation.data.data.accountNumber);
      console.log('   Amount:', validation.data.data.amount?.toLocaleString() || 'N/A');
    }
    console.log();

    // 8. Test QR (Development only)
    console.log('8️⃣ Generating Test QR (Development)...');
    try {
      const testQR = await axios.get(`${API_BASE}/test-qr`);
      console.log('✅ Test QR Generated!');
      console.log('🧪 Test Bank:', testQR.data.data.bankName);
      console.log('💰 Test Amount:', testQR.data.data.amount?.toLocaleString(), 'VND');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('ℹ️ Test mode not available (Production environment)');
      } else {
        throw error;
      }
    }
    console.log();

    // 9. Error handling example
    console.log('9️⃣ Testing Error Handling...');
    try {
      await axios.post(`${API_BASE}/generate-qr`, {
        bankCode: 'INVALID',
        accountNumber: '123',
        accountName: 'TEST'
      });
    } catch (error) {
      console.log('✅ Error handling works:', error.response?.data?.message || error.message);
    }
    console.log();

    console.log('🎉 All tests completed successfully!');
    console.log('\n📚 Next steps:');
    console.log('   1. Check the generated QR image:', imagePath);
    console.log('   2. Test deeplinks on mobile devices');
    console.log('   3. Visit http://localhost:3001/docs for Swagger documentation');
    console.log('   4. Integrate with your frontend application');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  testBankQRAPI();
}

module.exports = { testBankQRAPI };
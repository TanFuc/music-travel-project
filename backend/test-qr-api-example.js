#!/usr/bin/env node

/**
 * QR Payment API Test Script
 * 
 * This script tests the QR Payment API endpoints
 * Run with: node test-qr-api-example.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api/v1/payment';
const TEST_DATA = {
  admin: {
    amount: 100000,
    description: 'Test payment from API script'
  },
  custom: {
    bankCode: 'MB',
    accountNumber: '0123456789',
    accountName: 'NGUYEN VAN TEST',
    amount: 50000,
    description: 'Custom QR test payment'
  }
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestModule = url.startsWith('https') ? https : http;
    
    const req = requestModule.request(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/health`);
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`📊 Response:`, JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

async function testSupportedBanks() {
  console.log('\n🏦 Testing Supported Banks...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/banks`);
    console.log(`✅ Status: ${response.statusCode}`);
    console.log(`📊 Total banks: ${response.data.total}`);
    console.log(`🏦 First 3 banks:`, JSON.stringify(response.data.data.slice(0, 3), null, 2));
  } catch (error) {
    console.error('❌ Get banks failed:', error.message);
  }
}

async function testAdminQRGeneration() {
  console.log('\n🎯 Testing Admin QR Generation...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/generate-qr`, {
      method: 'POST',
      body: TEST_DATA.admin
    });
    
    console.log(`✅ Status: ${response.statusCode}`);
    
    if (response.data.success) {
      console.log(`🏦 Bank: ${response.data.bank.bankName}`);
      console.log(`💳 Account: ${response.data.bank.accountNumber}`);
      console.log(`👤 Name: ${response.data.bank.accountName}`);
      console.log(`💰 Amount: ${response.data.amount ? response.data.amount.toLocaleString('vi-VN') + ' VND' : 'Not specified'}`);
      console.log(`📝 Description: ${response.data.description || 'Not specified'}`);
      console.log(`🔗 Deeplink: ${response.data.deeplink ? 'Available' : 'Not available'}`);
      console.log(`📱 QR Image: ${response.data.qrImageBase64 ? 'Generated (' + Math.round(response.data.qrImageBase64.length / 1024) + 'KB)' : 'Not generated'}`);
      
      // Save QR image to file for testing
      if (response.data.qrImageBase64) {
        const base64Data = response.data.qrImageBase64.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync('test-admin-qr.png', base64Data, 'base64');
        console.log('💾 QR image saved as test-admin-qr.png');
      }
    } else {
      console.log('❌ Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Admin QR generation failed:', error.message);
  }
}

async function testCustomQRGeneration() {
  console.log('\n🛠️ Testing Custom QR Generation...');
  try {
    const response = await makeRequest(`${API_BASE_URL}/generate-custom-qr`, {
      method: 'POST',
      body: TEST_DATA.custom
    });
    
    console.log(`✅ Status: ${response.statusCode}`);
    
    if (response.data.data) {
      const data = response.data.data;
      console.log(`🏦 Bank: ${data.bankName}`);
      console.log(`💳 Account: ${data.accountNumber}`);
      console.log(`👤 Name: ${data.accountName}`);
      console.log(`💰 Amount: ${data.amount ? data.amount.toLocaleString('vi-VN') + ' VND' : 'Not specified'}`);
      console.log(`📝 Description: ${data.description || 'Not specified'}`);
      console.log(`🔗 Deeplink: ${data.deeplink ? 'Available' : 'Not available'}`);
      console.log(`📱 QR Image: ${data.qrBase64 ? 'Generated (' + Math.round(data.qrBase64.length / 1024) + 'KB)' : 'Not generated'}`);
      
      // Save QR image to file for testing
      if (data.qrBase64) {
        const base64Data = data.qrBase64.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync('test-custom-qr.png', base64Data, 'base64');
        console.log('💾 QR image saved as test-custom-qr.png');
      }
    } else {
      console.log('❌ Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Custom QR generation failed:', error.message);
  }
}

async function testQRImageEndpoint() {
  console.log('\n🖼️ Testing QR Image Endpoint...');
  try {
    const params = new URLSearchParams(TEST_DATA.custom);
    const response = await makeRequest(`${API_BASE_URL}/qr-image?${params.toString()}`);
    
    console.log(`✅ Status: ${response.statusCode}`);
    
    if (response.data.data) {
      const data = response.data.data;
      console.log(`📱 QR Base64: ${data.qrBase64 ? 'Generated (' + Math.round(data.qrBase64.length / 1024) + 'KB)' : 'Not generated'}`);
      console.log(`📄 Content Type: ${data.contentType}`);
      console.log(`📁 Filename: ${data.filename}`);
      
      // Save QR image to file for testing
      if (data.qrBase64) {
        const base64Data = data.qrBase64.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync('test-image-endpoint-qr.png', base64Data, 'base64');
        console.log('💾 QR image saved as test-image-endpoint-qr.png');
      }
    } else {
      console.log('❌ Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('❌ QR image endpoint failed:', error.message);
  }
}

async function testErrorHandling() {
  console.log('\n⚠️ Testing Error Handling...');
  
  // Test with invalid amount
  try {
    const response = await makeRequest(`${API_BASE_URL}/generate-qr`, {
      method: 'POST',
      body: {
        amount: -1000,
        description: 'Invalid amount test'
      }
    });
    
    console.log(`📊 Invalid amount test - Status: ${response.statusCode}`);
    console.log(`📊 Response:`, JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('✅ Error handling working:', error.message);
  }
  
  // Test with missing admin config (this will work if config is set)
  try {
    const response = await makeRequest(`${API_BASE_URL}/generate-custom-qr`, {
      method: 'POST',
      body: {
        bankCode: 'INVALID',
        accountNumber: '123',
        accountName: 'TEST'
      }
    });
    
    console.log(`📊 Invalid bank test - Status: ${response.statusCode}`);
    console.log(`📊 Response:`, JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('✅ Error handling working:', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting QR Payment API Tests');
  console.log('=====================================');
  
  await testHealthCheck();
  await testSupportedBanks();
  await testAdminQRGeneration();
  await testCustomQRGeneration();
  await testQRImageEndpoint();
  await testErrorHandling();
  
  console.log('\n✅ All tests completed!');
  console.log('=====================================');
  console.log('📁 Generated files:');
  console.log('  - test-admin-qr.png');
  console.log('  - test-custom-qr.png');
  console.log('  - test-image-endpoint-qr.png');
  console.log('\n💡 Tips:');
  console.log('  - Open the PNG files to see the generated QR codes');
  console.log('  - Use a QR scanner app to test the codes');
  console.log('  - Check your .env file for admin bank configuration');
  console.log('  - Visit http://localhost:3001/docs for Swagger documentation');
}

// Run tests
runAllTests().catch(console.error);
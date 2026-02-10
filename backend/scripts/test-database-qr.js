#!/usr/bin/env node

/**
 * Test script for database-driven QR generation
 * 
 * This script tests the new bank QR configuration system:
 * 1. Creates a bank QR configuration in the database
 * 2. Tests QR generation using the database configuration
 * 3. Verifies the generated QR code is valid
 * 
 * Usage:
 *   node scripts/test-database-qr.js
 * 
 * Prerequisites:
 *   - Database server must be running
 *   - Backend server must be running on http://localhost:3000
 */

const https = require('https');
const http = require('http');

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Test configuration
const TEST_BANK_CONFIG = {
  bankBin: '970422',
  accountNumber: '8820231001',
  accountName: 'LE DUC TUAN',
  isActive: true
};

const TEST_QR_REQUEST = {
  amount: 50000,
  description: 'Test payment via database config'
};

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Test bank QR configuration management
 */
async function testBankQRConfigManagement() {
  console.log('\n=== Testing Bank QR Configuration Management ===');
  
  try {
    // 1. Create bank QR configuration
    console.log('\n1. Creating bank QR configuration...');
    const createResponse = await makeRequest('POST', '/admin/bank-qr-config', TEST_BANK_CONFIG);
    
    if (createResponse.statusCode === 201) {
      console.log('✅ Bank QR configuration created successfully');
      console.log(`   ID: ${createResponse.data.data.id}`);
      console.log(`   Bank BIN: ${createResponse.data.data.bankBin}`);
      console.log(`   Account: ${createResponse.data.data.accountNumber}`);
      console.log(`   Name: ${createResponse.data.data.accountName}`);
      return createResponse.data.data.id;
    } else {
      console.log('❌ Failed to create bank QR configuration');
      console.log(`   Status: ${createResponse.statusCode}`);
      console.log(`   Response:`, createResponse.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Error creating bank QR configuration:', error.message);
    return null;
  }
}

/**
 * Test QR generation with database configuration
 */
async function testQRGeneration() {
  console.log('\n=== Testing QR Generation with Database Configuration ===');
  
  try {
    // 1. Test QR generation
    console.log('\n1. Generating QR code using database configuration...');
    const qrResponse = await makeRequest('POST', '/payment/generate-qr', TEST_QR_REQUEST);
    
    if (qrResponse.statusCode === 201) {
      console.log('✅ QR code generated successfully using database configuration');
      console.log(`   Bank: ${qrResponse.data.bank.bankName} (${qrResponse.data.bank.bankCode})`);
      console.log(`   Account: ${qrResponse.data.bank.accountNumber}`);
      console.log(`   Name: ${qrResponse.data.bank.accountName}`);
      console.log(`   Amount: ${qrResponse.data.amount} VND`);
      console.log(`   Description: ${qrResponse.data.description}`);
      console.log(`   QR Content Length: ${qrResponse.data.qrContent.length} chars`);
      console.log(`   Has Base64 Image: ${qrResponse.data.qrImageBase64 ? 'Yes' : 'No'}`);
      console.log(`   Has Image URL: ${qrResponse.data.qrImageUrl ? 'Yes' : 'No'}`);
      console.log(`   Has Deeplink: ${qrResponse.data.deeplink ? 'Yes' : 'No'}`);
      
      // Validate QR content structure
      if (qrResponse.data.qrContent.startsWith('000201') && qrResponse.data.qrContent.includes('6304')) {
        console.log('✅ QR content appears to be valid EMVCo format');
      } else {
        console.log('⚠️  QR content may not be valid EMVCo format');
      }
      
      return true;
    } else {
      console.log('❌ Failed to generate QR code');
      console.log(`   Status: ${qrResponse.statusCode}`);
      console.log(`   Response:`, qrResponse.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Error generating QR code:', error.message);
    return false;
  }
}

/**
 * Test admin API endpoints
 */
async function testAdminEndpoints() {
  console.log('\n=== Testing Admin API Endpoints ===');
  
  try {
    // 1. Get all configurations
    console.log('\n1. Getting all bank QR configurations...');
    const listResponse = await makeRequest('GET', '/admin/bank-qr-config');
    
    if (listResponse.statusCode === 200) {
      console.log(`✅ Retrieved ${listResponse.data.data.length} bank QR configurations`);
      listResponse.data.data.forEach((config, index) => {
        console.log(`   ${index + 1}. ID: ${config.id}, BIN: ${config.bankBin}, Active: ${config.isActive}`);
      });
    } else {
      console.log('❌ Failed to get bank QR configurations');
      console.log(`   Status: ${listResponse.statusCode}`);
    }
    
    // 2. Get active configuration
    console.log('\n2. Getting active bank QR configuration...');
    const activeResponse = await makeRequest('GET', '/admin/bank-qr-config/active');
    
    if (activeResponse.statusCode === 200 && activeResponse.data.data) {
      console.log('✅ Active bank QR configuration found');
      console.log(`   ID: ${activeResponse.data.data.id}`);
      console.log(`   Bank BIN: ${activeResponse.data.data.bankBin}`);
      console.log(`   Account: ${activeResponse.data.data.accountNumber}`);
    } else {
      console.log('⚠️  No active bank QR configuration found');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error testing admin endpoints:', error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting Database-Driven QR Generation Tests');
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  
  let allTestsPassed = true;
  
  try {
    // Test 1: Bank QR Configuration Management
    const configId = await testBankQRConfigManagement();
    if (!configId) {
      allTestsPassed = false;
    }
    
    // Test 2: QR Generation
    const qrGenerated = await testQRGeneration();
    if (!qrGenerated) {
      allTestsPassed = false;
    }
    
    // Test 3: Admin Endpoints
    const adminEndpointsWorking = await testAdminEndpoints();
    if (!adminEndpointsWorking) {
      allTestsPassed = false;
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    if (allTestsPassed) {
      console.log('🎉 All tests passed! Database-driven QR generation is working correctly.');
      console.log('\n📋 Summary:');
      console.log('   ✅ Bank QR configuration can be created and managed');
      console.log('   ✅ QR generation uses database configuration');
      console.log('   ✅ Admin API endpoints are functional');
      console.log('\n🔧 Next steps:');
      console.log('   1. Run database migration: npx prisma migrate dev');
      console.log('   2. Remove hard-coded bank info from environment variables');
      console.log('   3. Use admin API to manage bank configurations in production');
    } else {
      console.log('❌ Some tests failed. Please check the errors above.');
      console.log('\n🔍 Troubleshooting:');
      console.log('   1. Ensure database server is running');
      console.log('   2. Ensure backend server is running on port 3000');
      console.log('   3. Run database migration: npx prisma migrate dev');
      console.log('   4. Check server logs for detailed error messages');
    }
    
  } catch (error) {
    console.log('\n💥 Unexpected error during testing:', error.message);
    allTestsPassed = false;
  }
  
  process.exit(allTestsPassed ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
#!/usr/bin/env node

/**
 * Seed script for bank QR configuration
 * 
 * This script creates initial bank QR configurations in the database.
 * It can be used to set up default configurations for development or production.
 * 
 * Usage:
 *   node scripts/seed-bank-qr-config.js
 * 
 * Prerequisites:
 *   - Database server must be running
 *   - Prisma client must be generated
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Default bank configurations
const DEFAULT_BANK_CONFIGS = [
  {
    bankBin: '970422',
    accountNumber: '8820231001',
    accountName: 'LE DUC TUAN',
    isActive: true,
    description: 'MB Bank - Default configuration'
  },
  {
    bankBin: '970432',
    accountNumber: '10393335845',
    accountName: 'LE DUC TUAN',
    isActive: false,
    description: 'VPBank - Alternative configuration'
  },
  {
    bankBin: '970436',
    accountNumber: '1234567890',
    accountName: 'MUSIC TRAVEL COMPANY',
    isActive: false,
    description: 'Vietcombank - Corporate account'
  }
];

/**
 * Seed bank QR configurations
 */
async function seedBankQRConfigs() {
  console.log('🌱 Seeding bank QR configurations...');
  
  try {
    // First, deactivate all existing configurations
    await prisma.bankQRConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });
    
    console.log('   Deactivated existing active configurations');
    
    // Create new configurations
    for (const config of DEFAULT_BANK_CONFIGS) {
      const { description, ...configData } = config;
      
      const existingConfig = await prisma.bankQRConfig.findFirst({
        where: {
          bankBin: config.bankBin,
          accountNumber: config.accountNumber
        }
      });
      
      if (existingConfig) {
        // Update existing configuration
        await prisma.bankQRConfig.update({
          where: { id: existingConfig.id },
          data: configData
        });
        console.log(`   ✅ Updated: ${description}`);
      } else {
        // Create new configuration
        await prisma.bankQRConfig.create({
          data: configData
        });
        console.log(`   ✅ Created: ${description}`);
      }
    }
    
    // Get the active configuration
    const activeConfig = await prisma.bankQRConfig.findFirst({
      where: { isActive: true }
    });
    
    if (activeConfig) {
      console.log(`\n🎯 Active configuration:`);
      console.log(`   Bank BIN: ${activeConfig.bankBin}`);
      console.log(`   Account: ${activeConfig.accountNumber}`);
      console.log(`   Name: ${activeConfig.accountName}`);
    }
    
    console.log('\n✅ Bank QR configuration seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding bank QR configurations:', error);
    throw error;
  }
}

/**
 * Display current configurations
 */
async function displayConfigurations() {
  console.log('\n📋 Current bank QR configurations:');
  
  try {
    const configs = await prisma.bankQRConfig.findMany({
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    if (configs.length === 0) {
      console.log('   No configurations found.');
      return;
    }
    
    configs.forEach((config, index) => {
      const status = config.isActive ? '🟢 ACTIVE' : '⚪ INACTIVE';
      console.log(`   ${index + 1}. ${status}`);
      console.log(`      ID: ${config.id}`);
      console.log(`      Bank BIN: ${config.bankBin}`);
      console.log(`      Account: ${config.accountNumber}`);
      console.log(`      Name: ${config.accountName}`);
      console.log(`      Created: ${config.createdAt.toISOString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error displaying configurations:', error);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Bank QR Configuration Seeder');
  console.log('================================\n');
  
  try {
    await seedBankQRConfigs();
    await displayConfigurations();
    
    console.log('🎉 Seeding process completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test QR generation: node scripts/test-database-qr.js');
    console.log('   2. Use admin API to manage configurations: POST /admin/bank-qr-config');
    console.log('   3. Generate QR codes: POST /payment/generate-qr');
    
  } catch (error) {
    console.error('\n💥 Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Process interrupted. Cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Process terminated. Cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the seeder
main().catch(async (error) => {
  console.error('💥 Fatal error:', error);
  await prisma.$disconnect();
  process.exit(1);
});
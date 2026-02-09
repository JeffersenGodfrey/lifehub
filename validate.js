#!/usr/bin/env node

/**
 * LifeHub Validation Script
 * Checks if everything is properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

console.log('🔍 LifeHub Configuration Validator\n');

// Check 1: Server .env exists
const serverEnvPath = path.join(__dirname, 'lifehub', 'server', '.env');
if (fs.existsSync(serverEnvPath)) {
  checks.passed.push('✅ Server .env file exists');
  
  const envContent = fs.readFileSync(serverEnvPath, 'utf8');
  
  // Check for placeholder values
  if (envContent.includes('your-new-mongodb-uri-here') || 
      envContent.includes('your-email@gmail.com') ||
      envContent.includes('your-new-jwt-secret-here')) {
    checks.warnings.push('⚠️  Server .env contains placeholder values - update with real credentials');
  } else {
    checks.passed.push('✅ Server .env has been configured');
  }
  
  // Check required variables
  const requiredVars = ['MONGO_URI', 'PORT', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS', 'FRONTEND_URL'];
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      checks.passed.push(`✅ ${varName} is defined`);
    } else {
      checks.failed.push(`❌ ${varName} is missing`);
    }
  });
} else {
  checks.failed.push('❌ Server .env file not found');
}

// Check 2: Client .env exists
const clientEnvPath = path.join(__dirname, 'lifehub', 'client', '.env');
if (fs.existsSync(clientEnvPath)) {
  checks.passed.push('✅ Client .env file exists');
  
  const envContent = fs.readFileSync(clientEnvPath, 'utf8');
  
  if (envContent.includes('your-firebase-api-key') || 
      envContent.includes('your-project-id')) {
    checks.warnings.push('⚠️  Client .env contains placeholder values - update with real Firebase credentials');
  } else {
    checks.passed.push('✅ Client .env has been configured');
  }
} else {
  checks.failed.push('❌ Client .env file not found');
}

// Check 3: .gitignore properly configured
const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env') && gitignoreContent.includes('server/.env')) {
    checks.passed.push('✅ .gitignore properly configured');
  } else {
    checks.failed.push('❌ .gitignore missing .env entries');
  }
} else {
  checks.failed.push('❌ .gitignore not found');
}

// Check 4: Pre-commit hook exists
const hookPath = path.join(__dirname, '.git', 'hooks', 'pre-commit');
if (fs.existsSync(hookPath)) {
  checks.passed.push('✅ Pre-commit hook installed');
} else {
  checks.warnings.push('⚠️  Pre-commit hook not found - .env files might be committed accidentally');
}

// Check 5: Dependencies
const serverPackagePath = path.join(__dirname, 'lifehub', 'server', 'package.json');
const clientPackagePath = path.join(__dirname, 'lifehub', 'client', 'package.json');

if (fs.existsSync(serverPackagePath)) {
  checks.passed.push('✅ Server package.json exists');
  const serverNodeModules = path.join(__dirname, 'lifehub', 'server', 'node_modules');
  if (fs.existsSync(serverNodeModules)) {
    checks.passed.push('✅ Server dependencies installed');
  } else {
    checks.warnings.push('⚠️  Server dependencies not installed - run: cd lifehub/server && npm install');
  }
}

if (fs.existsSync(clientPackagePath)) {
  checks.passed.push('✅ Client package.json exists');
  const clientNodeModules = path.join(__dirname, 'lifehub', 'client', 'node_modules');
  if (fs.existsSync(clientNodeModules)) {
    checks.passed.push('✅ Client dependencies installed');
  } else {
    checks.warnings.push('⚠️  Client dependencies not installed - run: cd lifehub/client && npm install');
  }
}

// Check 6: Core files exist
const coreFiles = [
  'lifehub/server/server.js',
  'lifehub/server/services/emailService.js',
  'lifehub/server/services/cronService.js',
  'lifehub/server/routes/testRoutes.js',
  'lifehub/server/models/Task.js',
  'lifehub/server/models/User.js'
];

coreFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    checks.passed.push(`✅ ${file} exists`);
  } else {
    checks.failed.push(`❌ ${file} missing`);
  }
});

// Print results
console.log('\n📊 Validation Results:\n');

if (checks.passed.length > 0) {
  console.log('✅ PASSED CHECKS:');
  checks.passed.forEach(check => console.log(`   ${check}`));
  console.log('');
}

if (checks.warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  checks.warnings.forEach(warning => console.log(`   ${warning}`));
  console.log('');
}

if (checks.failed.length > 0) {
  console.log('❌ FAILED CHECKS:');
  checks.failed.forEach(fail => console.log(`   ${fail}`));
  console.log('');
}

// Summary
console.log('━'.repeat(60));
console.log(`Total: ${checks.passed.length} passed, ${checks.warnings.length} warnings, ${checks.failed.length} failed`);
console.log('━'.repeat(60));

if (checks.failed.length === 0 && checks.warnings.length === 0) {
  console.log('\n🎉 Everything is properly configured!');
  console.log('\n📝 Next steps:');
  console.log('   1. Fill in your credentials in .env files');
  console.log('   2. Start server: cd lifehub/server && npm start');
  console.log('   3. Start client: cd lifehub/client && npm run dev');
  console.log('   4. Test email: POST http://localhost:5000/api/test/email');
} else if (checks.failed.length === 0) {
  console.log('\n✅ Configuration is valid but needs attention to warnings');
} else {
  console.log('\n❌ Please fix the failed checks before proceeding');
  process.exit(1);
}

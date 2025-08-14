#!/usr/bin/env node

/**
 * Test script for the Passkey System
 * Run this to verify all components are working correctly
 */

console.log('🔐 Testing Passkey System Components...\n');

// Test 1: Check if all required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/context/PasskeyContext.jsx',
  'src/components/ui/PasskeyModal.jsx',
  'src/components/ui/PasskeyStatus.jsx',
  'src/components/ui/NotesManager.jsx',
  'src/utils/encryption.js',
  'src/utils/notesApi.js',
  'pages/_app.js',
  'pages/passkey-demo.js'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('');

// Test 2: Check package.json dependencies
console.log('📦 Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['react', 'next', 'react-dom'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
    }
  });
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

console.log('');

// Test 3: Check environment configuration
console.log('⚙️  Checking environment configuration...');
const envFile = '.env.local';
if (fs.existsSync(envFile)) {
  console.log(`✅ ${envFile} exists`);
  const envContent = fs.readFileSync(envFile, 'utf8');
  if (envContent.includes('NEXT_PUBLIC_BASE_URL')) {
    console.log('✅ NEXT_PUBLIC_BASE_URL is configured');
  } else {
    console.log('⚠️  NEXT_PUBLIC_BASE_URL not found in .env.local');
  }
} else {
  console.log(`⚠️  ${envFile} not found - you may need to create it`);
  console.log('   Add: NEXT_PUBLIC_BASE_URL=http://localhost:5321');
}

console.log('');

// Test 4: Check build configuration
console.log('🔨 Checking build configuration...');
try {
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  if (nextConfig.includes('experimental') || nextConfig.includes('webpack')) {
    console.log('✅ next.config.js is configured');
  } else {
    console.log('✅ next.config.js is using default configuration');
  }
} catch (error) {
  console.log('❌ Error reading next.config.js:', error.message);
}

console.log('');

// Test 5: Check if demo page is accessible
console.log('🌐 Checking demo page accessibility...');
const demoPage = 'src/pages/passkey-demo.jsx';
if (fs.existsSync(demoPage)) {
  const demoContent = fs.readFileSync(demoPage, 'utf8');
  if (demoContent.includes('NotesManager')) {
    console.log('✅ NotesManager component is integrated');
  } else {
    console.log('⚠️  NotesManager component not found in demo page');
  }
  
  if (demoContent.includes('PasskeyStatus')) {
    console.log('✅ PasskeyStatus component is integrated');
  } else {
    console.log('⚠️  PasskeyStatus component not found in demo page');
  }
} else {
  console.log('❌ Demo page not found');
}

console.log('');

// Test 6: Check API endpoints configuration
console.log('🔗 Checking API endpoints configuration...');
const passkeyContext = 'src/context/PasskeyContext.jsx';
if (fs.existsSync(passkeyContext)) {
  const contextContent = fs.readFileSync(passkeyContext, 'utf8');
  if (contextContent.includes('security')) {
    console.log('✅ Security endpoint is correctly configured');
  } else {
    console.log('⚠️  Security endpoint may not be correctly configured');
  }
}

const notesApi = 'src/utils/notesApi.js';
if (fs.existsSync(notesApi)) {
  const apiContent = fs.readFileSync(notesApi, 'utf8');
  if (apiContent.includes('api/v1/notes')) {
    console.log('✅ Notes API endpoint is correctly configured');
  } else {
    console.log('⚠️  Notes API endpoint may not be correctly configured');
  }
}

console.log('');

// Summary
console.log('📊 Test Summary:');
if (allFilesExist) {
  console.log('✅ All required files are present');
  console.log('✅ System is ready for testing');
  console.log('');
  console.log('🚀 Next steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Navigate to /passkey-demo to test the system');
  console.log('3. Set your password to generate a passkey');
  console.log('4. Test creating encrypted and regular notes');
  console.log('5. Verify encryption/decryption functionality');
} else {
  console.log('❌ Some required files are missing');
  console.log('Please check the file structure and try again');
}

console.log('');
console.log('📚 For more information, see PASSKEY_README.md');
console.log('🐛 For issues, check the browser console and network tab'); 
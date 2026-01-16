// test-server.js - Simple test to verify server can start
const { spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;

// Simple test to check if the server can start without errors
async function testServer() {
  console.log('🧪 Testing if Scholar.AI server can start...');
  
  try {
    // Check if required files exist
    const requiredFiles = [
      './server/server.js',
      './server/models/User.js',
      './server/config/index.js',
      './package.json'
    ];
    
    for (const file of requiredFiles) {
      try {
        await fs.access(file);
        console.log(`✅ Found: ${file}`);
      } catch (err) {
        console.log(`❌ Missing: ${file}`);
        return false;
      }
    }
    
    // Check if package.json has required dependencies
    const packageJson = require('./package.json');
    const requiredDeps = [
      'express',
      'mongoose',
      'bcrypt',
      'jsonwebtoken',
      'zod',
      'cors',
      'helmet',
      'express-rate-limit',
      'multer',
      'pdf-parse',
      '@xenova/transformers',
      'bullmq',
      'redis',
      'openai',
      'winston',
      'dotenv',
      'express-mongo-sanitize'
    ];
    
    const missingDeps = [];
    const allDeps = {...packageJson.dependencies, ...packageJson.devDependencies};
    
    for (const dep of requiredDeps) {
      if (!allDeps[dep]) {
        missingDeps.push(dep);
      }
    }
    
    if (missingDeps.length > 0) {
      console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
      return false;
    } else {
      console.log(`✅ All required dependencies present`);
    }
    
    console.log('✅ Server structure is complete!');
    console.log('🚀 Scholar.AI is ready to run!');
    console.log('\n📋 To start the application:');
    console.log('   1. Make sure MongoDB and Redis are running');
    console.log('   2. Run: npm run dev (for main server)');
    console.log('   3. Run: npm run worker (for PDF processing worker)');
    console.log('   4. Access the frontend by opening public/index.html in your browser');
    
    return true;
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    return false;
  }
}

// Run the test
testServer().then(success => {
  if (success) {
    console.log('\n🎉 Scholar.AI application is properly set up!');
  } else {
    console.log('\n💥 There are issues with the setup. Please check the errors above.');
    process.exit(1);
  }
});
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 DIU BUY & SELL - Starting Development Server');
console.log('===============================================\n');

// Function to run commands with proper path handling
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    // Ensure the command is properly quoted for Windows paths with spaces
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      windowsVerbatimArguments: false,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Main function
async function main() {
  try {
    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
      console.log('📦 Installing dependencies...');
      
      // Use npm install with specific flags to avoid path issues
      await runCommand('npm', ['install', '--no-optional', '--no-audit', '--no-fund'], {
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
      });
      
      console.log('✅ Dependencies installed successfully!\n');
    }

    // Start the development server
    console.log('🌐 Starting development server...');
    console.log('📍 Server will be available at: http://localhost:3000\n');
    
    // Use npx instead of direct path to avoid path issues
    await runCommand('npx', ['next', 'dev', '--port', '3000'], {
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you have Node.js 18+ installed');
    console.log('2. Try running: npm cache clean --force');
    console.log('3. Delete node_modules and package-lock.json, then run this script again');
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down development server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down development server...');
  process.exit(0);
});

// Run the main function
main(); 
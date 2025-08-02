const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 DIU BUY & SELL - Clean Installation');
console.log('======================================\n');

// Function to run commands
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
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
    console.log('🧹 Cleaning previous installation...');
    
    // Remove node_modules if exists
    if (fs.existsSync('node_modules')) {
      fs.rmSync('node_modules', { recursive: true, force: true });
      console.log('✅ Removed node_modules');
    }
    
    // Remove package-lock.json if exists
    if (fs.existsSync('package-lock.json')) {
      fs.unlinkSync('package-lock.json');
      console.log('✅ Removed package-lock.json');
    }

    console.log('\n📦 Installing dependencies...');
    
    // Clean npm cache first
    await runCommand('npm', ['cache', 'clean', '--force']);
    console.log('✅ Cleaned npm cache');
    
    // Install dependencies with specific flags
    await runCommand('npm', ['install', '--no-optional', '--no-audit', '--no-fund'], {
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
    });
    
    console.log('\n✅ Installation completed successfully!');
    console.log('🚀 You can now run "node start.js" or "start.bat" to start the development server');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure you have Node.js 18+ installed');
    console.log('2. Try running: npm cache clean --force');
    console.log('3. Check your internet connection');
    process.exit(1);
  }
}

// Run the main function
main(); 
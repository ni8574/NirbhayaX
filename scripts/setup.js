const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('====================================================');
console.log('🛡️  NIRBHAYA X - ONE-COMMAND SETUP INITIALIZING');
console.log('====================================================\n');

const rootDir = path.resolve(__dirname, '..');
const runCmd = (cmd, cwd = rootDir) => {
  console.log(`\n📦 Running: "${cmd}" in ${path.relative(rootDir, cwd) || 'root'}...`);
  try {
    execSync(cmd, { cwd, stdio: 'inherit', shell: true });
  } catch (err) {
    console.error(`❌ Failed: ${cmd}`);
    process.exit(1);
  }
};

// 1. Ensure .env exists
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');
if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('📄 Copying .env.example to .env...');
  fs.copyFileSync(envExamplePath, envPath);
}

// 2. Install Root Dependencies
console.log('\n[1/4] Installing Root dependencies...');
runCmd('npm install --no-audit --no-fund', rootDir);

// 3. Install Backend Dependencies
console.log('\n[2/4] Installing Backend dependencies...');
runCmd('npm install --no-audit --no-fund', path.join(rootDir, 'backend'));

// 4. Install Frontend Dependencies
console.log('\n[3/4] Installing Frontend dependencies...');
runCmd('npm install --no-audit --no-fund', path.join(rootDir, 'frontend'));

// 5. Install Contracts Dependencies & Compile
console.log('\n[4/5] Installing Smart Contract dependencies & compiling...');
runCmd('npm install --no-audit --no-fund', path.join(rootDir, 'contracts'));
runCmd('npx hardhat compile', path.join(rootDir, 'contracts'));

// 6. Optional Python AI Service Dependencies
console.log('\n[5/5] Checking Python AI Service dependencies...');
try {
  execSync('python --version', { stdio: 'ignore' });
  console.log('🐍 Python runtime detected. Installing AI service requirements...');
  runCmd('pip install -r requirements.txt', path.join(rootDir, 'ai-service'));
} catch (e) {
  console.log('ℹ️  Python runtime optional or not detected. Backend includes resilient internal AI fallback engine.');
}

console.log('\n====================================================');
console.log('🎉 SETUP COMPLETE!');
console.log('🚀 Run "npm run dev" to launch the complete NIRBHAYA X platform.');
console.log('====================================================\n');


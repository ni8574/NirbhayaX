const { spawn } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('🛡️  NIRBHAYA X PLATFORM ORCHESTRATOR');
console.log('    "From Safety to Evidence, From Evidence to Justice."');
console.log('================================================================\n');

const rootDir = path.resolve(__dirname, '..');
const processes = [];

const startProcess = (name, cmd, args, cwd) => {
  console.log(`🚀 [Launcher] Starting ${name} in ${path.relative(rootDir, cwd) || 'root'}...`);
  const child = spawn(cmd, args, {
    cwd,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  child.on('error', (err) => {
    console.error(`❌ [${name}] Process error:`, err.message);
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.warn(`⚠️ [${name}] Process exited with code ${code}`);
    }
  });

  processes.push(child);
  return child;
};

// 1. Contracts / Local Blockchain (Hardhat node)
startProcess(
  'HARDHAT_NODE',
  'npx',
  ['hardhat', 'node', '--hostname', '127.0.0.1'],
  path.join(rootDir, 'contracts')
);

// 2. Python AI Evidence Microservice
startProcess(
  'AI_SERVICE',
  'python',
  ['run.py'],
  path.join(rootDir, 'ai-service')
);

// 3. Backend API Gateway & Real-Time WebSocket Hub
startProcess(
  'BACKEND',
  'node',
  ['src/server.js'],
  path.join(rootDir, 'backend')
);

// 4. Mobile-First React Frontend (Vite)
startProcess(
  'FRONTEND',
  'npm',
  ['run', 'dev'],
  path.join(rootDir, 'frontend')
);

const cleanup = () => {
  console.log('\n🛑 [Manager] Gracefully terminating all NIRBHAYA X services...');
  processes.forEach(proc => {
    try {
      proc.kill('SIGINT');
    } catch {}
  });
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

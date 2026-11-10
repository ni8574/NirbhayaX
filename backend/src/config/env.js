const path = require('path');
const dotenv = require('dotenv');

// Load .env from root or local backend
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config(); // fallback to local

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEMO_MODE: process.env.DEMO_MODE !== 'false',
  JWT_SECRET: process.env.JWT_SECRET || 'nirbhaya_x_super_secure_jwt_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nirbhaya_x',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  HARDHAT_RPC_URL: process.env.SEPOLIA_RPC_URL || process.env.BLOCKCHAIN_RPC_URL || process.env.HARDHAT_RPC_URL || 'http://127.0.0.1:8545',
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  DEPLOYER_PRIVATE_KEY: process.env.DEPLOYER_PRIVATE_KEY,
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  CLIENT_URL: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173'
};


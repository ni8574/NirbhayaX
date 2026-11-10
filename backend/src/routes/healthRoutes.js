const express = require('express');
const router = express.Router();
const { getDBStatus } = require('../config/db');
const env = require('../config/env');

router.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'online',
    platform: 'NIRBHAYA X',
    tagline: 'From Safety to Evidence, From Evidence to Justice',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    demoMode: env.DEMO_MODE,
    database: dbStatus,
    services: {
      auth: 'operational',
      database: dbStatus.connected ? 'operational' : 'degraded',
      storageVault: 'operational',
      blockchainRpc: env.HARDHAT_RPC_URL,
      aiMicroservice: env.AI_SERVICE_URL
    }
  });
});

module.exports = router;


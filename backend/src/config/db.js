const mongoose = require('mongoose');
const env = require('./env');
const memoryStore = require('./memoryStore');

let isInMemory = false;
let isConnected = false;

const connectDB = async () => {
  // If explicitly requested or as default trial, attempt real MongoDB
  if (!process.env.FORCE_MEMORY_DB) {
    try {
      const sanitizedUri = env.MONGODB_URI ? env.MONGODB_URI.replace(/:([^:@]{1,})@/, ':****@') : '';
      console.log(`[Database] Attempting connection to MongoDB at: ${sanitizedUri}...`);
      const conn = await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000
      });
      console.log(`[Database] Connected successfully to MongoDB: ${conn.connection.host}`);
      isConnected = true;
      isInMemory = false;
      return conn;
    } catch (err) {
      console.warn(`[Database] MongoDB unavailable (${err.message}).`);
    }
  }

  // Graceful fallback to zero-dependency In-Memory Document Store
  console.log('[Database] 🛡️ Activating Zero-Setup Resilient In-Memory Database Store for demo...');
  isInMemory = true;
  isConnected = true;
  return { connection: { host: 'in-memory-store', name: 'nirbhaya_x' } };
};

const disconnectDB = async () => {
  if (!isInMemory && mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  isConnected = false;
};

const getDBStatus = () => ({
  connected: isConnected,
  isInMemory,
  host: isInMemory ? 'in-memory-zero-config' : mongoose.connection.host,
  name: 'nirbhaya_x'
});

const isInMemoryActive = () => isInMemory;

module.exports = {
  connectDB,
  disconnectDB,
  getDBStatus,
  isInMemoryActive
};

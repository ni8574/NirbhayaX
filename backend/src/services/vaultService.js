const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const env = require('../config/env');

const VAULT_DIR = path.resolve(__dirname, '../../vault_storage');
if (!fs.existsSync(VAULT_DIR)) {
  fs.mkdirSync(VAULT_DIR, { recursive: true });
}

// 32-byte key for AES-256-GCM
const getKey = () => {
  return crypto.createHash('sha256').update(env.ENCRYPTION_KEY).digest();
};

/**
 * Compute SHA-256 hash of a buffer or string
 */
function computeSha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Encrypt file buffer using AES-256-GCM and store in local vault
 */
function encryptAndStore(fileBuffer, evidenceId) {
  const serverSha256 = computeSha256(fileBuffer);
  const iv = crypto.randomBytes(16);
  const key = getKey();

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encryptedBuffer = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const filePath = path.join(VAULT_DIR, `${evidenceId}.enc`);
  fs.writeFileSync(filePath, encryptedBuffer);

  return {
    encryptedFilePath: filePath,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    serverSha256,
    fileSizeBytes: fileBuffer.length
  };
}

/**
 * Decrypt file from vault
 */
function decryptFile(evidenceItem) {
  if (!fs.existsSync(evidenceItem.encryptedFilePath)) {
    throw new Error('Encrypted file not found on disk');
  }

  const encryptedBuffer = fs.readFileSync(evidenceItem.encryptedFilePath);
  const key = getKey();
  const iv = Buffer.from(evidenceItem.iv, 'hex');
  const authTag = Buffer.from(evidenceItem.authTag, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

  return decrypted;
}

/**
 * Simulate 1-byte tamper for judge demonstration
 * Mutates 1 byte in the file buffer and demonstrates cryptographic avalanche effect
 */
function simulateTamper(originalBuffer) {
  const tampered = Buffer.from(originalBuffer);
  
  // Flip bit in the first byte or last byte
  const targetIndex = Math.floor(tampered.length / 2);
  const originalByte = tampered[targetIndex];
  tampered[targetIndex] = originalByte ^ 0x01; // flip 1 bit

  const originalHash = computeSha256(originalBuffer);
  const tamperedHash = computeSha256(tampered);

  // Calculate hex character difference count
  let diffCount = 0;
  for (let i = 0; i < originalHash.length; i++) {
    if (originalHash[i] !== tamperedHash[i]) diffCount++;
  }
  const avalanchePercentage = Math.round((diffCount / originalHash.length) * 100);

  return {
    tamperedBuffer: tampered,
    originalHash,
    tamperedHash,
    byteModifiedIndex: targetIndex,
    originalByteHex: originalByte.toString(16).padStart(2, '0'),
    tamperedByteHex: tampered[targetIndex].toString(16).padStart(2, '0'),
    avalanchePercentage,
    explanation: `Flipping a single bit at byte index ${targetIndex} altered ${diffCount} of 64 hexadecimal characters in the SHA-256 digest (${avalanchePercentage}% avalanche effect). The blockchain smart contract will immediately reject this mismatched hash.`
  };
}

module.exports = {
  computeSha256,
  encryptAndStore,
  decryptFile,
  simulateTamper,
  VAULT_DIR
};


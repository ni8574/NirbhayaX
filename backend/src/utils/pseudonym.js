const crypto = require('crypto');

/**
 * Generate a pseudonymous ID for user privacy on-chain and off-chain.
 * Format: NX-XXXXXX (e.g., NX-F482AC)
 */
function generatePseudonym(prefix = 'NX') {
  const bytes = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${bytes}`;
}

/**
 * Hash a pseudonym or string into bytes32 for blockchain storage
 */
function toBytes32(str) {
  return '0x' + crypto.createHash('sha256').update(str).digest('hex');
}

module.exports = {
  generatePseudonym,
  toBytes32
};


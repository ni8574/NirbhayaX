const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadEvidence,
  verifyEvidence,
  tamperDemo,
  getEvidenceItems,
  grantConsent,
  revokeConsent,
  getAuditTrail
} = require('../controllers/vaultController');
const { protect, optionalAuth } = require('../middleware/auth');

// Multer memory storage (files up to 50MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Evidence upload & encryption
router.post('/upload', protect, upload.single('file'), uploadEvidence);

// Verification (can verify by re-uploading file OR by providing hash)
router.post('/verify', optionalAuth, upload.single('file'), verifyEvidence);

// Judge WOW: 1-byte live tamper demo
router.post('/tamper-demo', protect, tamperDemo);

// User Vault Items
router.get('/items', protect, getEvidenceItems);

// Consent-based access management
router.post('/consent/grant', protect, grantConsent);
router.post('/consent/revoke', protect, revokeConsent);

// Immutable-style audit trail
router.get('/audit-trail', protect, getAuditTrail);

module.exports = router;


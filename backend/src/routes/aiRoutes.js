const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  analyzeEvidence,
  checkDuplicates,
  getTimeline,
  getCompleteness,
  getMissingInfo
} = require('../controllers/aiController');
const { protect, optionalAuth } = require('../middleware/auth');

// Multer memory storage (files up to 50MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Upload and analyze media with Responsible AI (Count Only)
router.post('/analyze', optionalAuth, upload.single('file'), analyzeEvidence);

// Duplicate evidence detection
router.post('/check-duplicates', optionalAuth, checkDuplicates);

// Chronological visual evidence timeline
router.get('/timeline/:caseId', optionalAuth, getTimeline);

// Evidence completeness scoring
router.get('/completeness/:caseId', optionalAuth, getCompleteness);

// Missing-information checker
router.post('/missing-info', optionalAuth, getMissingInfo);

module.exports = router;


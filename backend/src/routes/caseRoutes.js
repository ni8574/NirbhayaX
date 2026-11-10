const express = require('express');
const router = express.Router();
const {
  getAllCases,
  getCaseDetails,
  createCase,
  seedJudgeDemoCase
} = require('../controllers/caseController');
const { protect, optionalAuth } = require('../middleware/auth');

// Get all cases
router.get('/', optionalAuth, getAllCases);

// 1-Click Judge Demo Preload Seeder
router.post('/judge-demo-seed', optionalAuth, seedJudgeDemoCase);

// Get single case details (aggregates all 5 stages)
router.get('/:caseId', optionalAuth, getCaseDetails);

// Create new case
router.post('/create', optionalAuth, createCase);

module.exports = router;


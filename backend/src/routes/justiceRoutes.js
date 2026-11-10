const express = require('express');
const router = express.Router();
const {
  createOrUpdateDraft,
  submitComplaint,
  getComplaint,
  getUserComplaints,
  updateStatus,
  generateAIDraft,
  getBSACertificate
} = require('../controllers/justiceController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

// Create or update complaint draft
router.post('/draft', optionalAuth, createOrUpdateDraft);

// Submit complaint to authorities
router.post('/submit/:complaintId', optionalAuth, submitComplaint);

// Get single complaint by complaintId or caseId
router.get('/complaint/:identifier', optionalAuth, getComplaint);

// Get all complaints for user
router.get('/list', optionalAuth, getUserComplaints);

// Update status (police / legal aid role)
router.put('/status/:complaintId', protect, authorize('authority', 'admin'), updateStatus);

// Generate AI bilingual drafting suggestion
router.post('/ai-suggest', optionalAuth, generateAIDraft);

// Get Section 63 BSA 2023 Electronic Evidence Certificate
router.get('/certificate/:complaintId', optionalAuth, getBSACertificate);

module.exports = router;


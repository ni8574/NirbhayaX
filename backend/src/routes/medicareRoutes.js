const express = require('express');
const router = express.Router();
const {
  getFacilities,
  getMedicalLocker,
  updateMedicalLocker,
  logInjury,
  createAccessPass,
  verifyAccessPass,
  startTeleconsultation
} = require('../controllers/medicareController');
const { protect, optionalAuth } = require('../middleware/auth');

// Nearby emergency healthcare facilities
router.get('/facilities', getFacilities);

// Encrypted medical locker
router.get('/locker', optionalAuth, getMedicalLocker);
router.put('/locker', optionalAuth, updateMedicalLocker);

// MLC trauma injury documentation
router.post('/injury', optionalAuth, logInjury);

// 24-hour doctor emergency access pass
router.post('/pass/create', optionalAuth, createAccessPass);
router.get('/pass/verify/:passCode', verifyAccessPass);

// Simulated teleconsultation
router.post('/teleconsult/start', optionalAuth, startTeleconsultation);

module.exports = router;


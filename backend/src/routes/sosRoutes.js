const express = require('express');
const router = express.Router();
const {
  triggerSOS,
  updateLocation,
  getTrackingSession,
  resolveSOS,
  getNearbyFacilities,
  startCheckIn,
  cancelCheckIn,
  getAlertLogs
} = require('../controllers/sosController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public tracking and telemetry
router.get('/track/:sessionId', getTrackingSession);
router.get('/nearby-facilities', getNearbyFacilities);
router.get('/alert-logs', getAlertLogs);

// Location stream update (can be called by active session or authenticated user)
router.post('/location-update', updateLocation);

// Protected SOS actions
router.post('/trigger', protect, triggerSOS);
router.post('/resolve', protect, resolveSOS);
router.post('/checkin/start', protect, startCheckIn);
router.post('/checkin/cancel', protect, cancelCheckIn);

module.exports = router;


const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  updateSafetyCircle,
  demoLogin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);

// Protected endpoints
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/safety-circle', protect, updateSafetyCircle);

module.exports = router;


const User = require('../models/User');

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject()
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, role, languagePreference } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email and password'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: role || 'user',
      languagePreference: languagePreference || 'en'
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user.toSafeObject ? user.toSafeObject() : user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, languagePreference } = req.body;
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (languagePreference) user.languagePreference = languagePreference;

    await user.save();

    res.status(200).json({
      success: true,
      user: user.toSafeObject ? user.toSafeObject() : user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Manage Safety Circle contacts (Add / Update / Delete)
 * @route   PUT /api/auth/safety-circle
 * @access  Private
 */
exports.updateSafetyCircle = async (req, res, next) => {
  try {
    const { contacts } = req.body;
    if (!Array.isArray(contacts)) {
      return res.status(400).json({
        success: false,
        message: 'Contacts must be an array of emergency contacts'
      });
    }

    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.safetyCircle = contacts;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Safety circle updated successfully',
      safetyCircle: user.safetyCircle
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    One-Click Demo / Judge Login for instant review
 * @route   POST /api/auth/demo-login
 * @access  Public
 */
exports.demoLogin = async (req, res, next) => {
  try {
    const roleType = req.body.role || 'user';
    const demoEmail = roleType === 'authority' 
      ? 'inspector.sharma@delhipolice.demo'
      : roleType === 'admin'
        ? 'admin@nirbhayax.org'
        : 'priya.sharma@nirbhayax.demo';

    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      // Create user on the fly if not seeded yet
      user = await User.create({
        fullName: roleType === 'authority' ? 'Inspector Rajesh Sharma' : roleType === 'admin' ? 'Nirbhaya X Admin' : 'Priya Sharma',
        email: demoEmail,
        password: 'Password123!',
        phone: '+919876543210',
        role: roleType === 'authority' ? 'authority' : roleType === 'admin' ? 'admin' : 'user',
        languagePreference: 'en',
        safetyCircle: [
          {
            name: 'Aarti Sharma (Sister)',
            phone: '+919811223344',
            email: 'aarti.sharma@demo.com',
            relationship: 'Sister',
            notifyViaSms: true,
            notifyViaPush: true
          },
          {
            name: 'Sunil Verma (Colleague)',
            phone: '+919822334455',
            email: 'sunil.verma@demo.com',
            relationship: 'Colleague',
            notifyViaSms: true,
            notifyViaPush: true
          }
        ]
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};


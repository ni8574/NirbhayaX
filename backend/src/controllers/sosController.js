const crypto = require('crypto');
const SOSSession = require('../models/SOSSession');
const Case = require('../models/Case');
const User = require('../models/User');

// In-memory alert log buffer for live demo inspection
let simulatedAlertLogs = [];

// Seed nearby verified emergency facilities (Delhi NCR demo coordinates + general emergency data)
const EMERGENCY_FACILITIES = [
  {
    id: 'FAC-01',
    name: 'Parliament Street Police Station (Women Help Desk)',
    type: 'police',
    address: 'Parliament Street, Connaught Place, New Delhi',
    phone: '011-23361100',
    emergencyNumber: '112',
    lat: 28.6256,
    lng: 77.2140,
    isOpen24Hours: true,
    hasWomenCell: true
  },
  {
    id: 'FAC-02',
    name: 'Lady Hardinge Medical College & Smt. S.K. Hospital (Trauma Center)',
    type: 'hospital',
    address: 'Shaheed Bhagat Singh Marg, Connaught Place, New Delhi',
    phone: '011-23363728',
    emergencyNumber: '102',
    lat: 28.6329,
    lng: 77.2132,
    isOpen24Hours: true,
    hasGynecology: true
  },
  {
    id: 'FAC-03',
    name: 'Connaught Place Police Station',
    type: 'police',
    address: 'Block A, Connaught Place, New Delhi',
    phone: '011-23412233',
    emergencyNumber: '100',
    lat: 28.6328,
    lng: 77.2195,
    isOpen24Hours: true,
    hasWomenCell: true
  },
  {
    id: 'FAC-04',
    name: 'Dr. Ram Manohar Lohia Hospital (RML Hospital Emergency)',
    type: 'hospital',
    address: 'Baba Kharak Singh Marg, New Delhi',
    phone: '011-23365525',
    emergencyNumber: '102',
    lat: 28.6241,
    lng: 77.2014,
    isOpen24Hours: true,
    hasGynecology: true
  },
  {
    id: 'FAC-05',
    name: 'Special Police Unit for Women and Children (SPUWAC)',
    type: 'police',
    address: 'Malviya Nagar, New Delhi',
    phone: '011-20862022',
    emergencyNumber: '1091',
    lat: 28.5284,
    lng: 77.2085,
    isOpen24Hours: true,
    hasWomenCell: true
  }
];

/**
 * Calculate distance in km between two GPS coordinates (Haversine formula)
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

/**
 * @desc    Trigger Emergency SOS
 * @route   POST /api/sos/trigger
 * @access  Private
 */
exports.triggerSOS = async (req, res, next) => {
  try {
    const { lat, lng, accuracy, speed, heading, address, triggerType } = req.body;
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    const latitude = Number(lat) || 28.6289;
    const longitude = Number(lng) || 77.2065;
    const sessionId = `SOS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Auto-create an integrated Case for the Proof-to-Justice Engine
    const newCase = await Case.create({
      userId,
      pseudonymId: user.pseudonymId,
      title: `Emergency Distress Alert (${triggerType || 'Manual SOS'})`,
      currentStage: 1,
      stageProgress: {
        stage1Protection: true,
        stage2Evidence: false,
        stage3Integrity: false,
        stage4Justice: false,
        stage5Support: false
      },
      sosSessionId: sessionId,
      status: 'active'
    });

    // Build tracking URL
    const trackingUrl = `/track/${sessionId}`;

    // Dispatch simulated alerts to user's Safety Circle
    const safetyCircle = user.safetyCircle && user.safetyCircle.length > 0
      ? user.safetyCircle
      : [
          { name: 'Emergency Contact (Sister)', phone: '+919811223344', relationship: 'Sister' },
          { name: 'Emergency Contact (Colleague)', phone: '+919822334455', relationship: 'Colleague' }
        ];

    const alertRecipients = [];
    for (const contact of safetyCircle) {
      const smsText = `🚨 EMERGENCY ALERT: ${user.fullName} (${user.pseudonymId}) has triggered an urgent SOS on NIRBHAYA X! Live tracking link: http://localhost:5173${trackingUrl} • Immediate assistance requested.`;
      
      const alertItem = {
        contactName: contact.name,
        contactPhone: contact.phone,
        relationship: contact.relationship,
        status: 'delivered',
        smsContent: smsText,
        deliveredAt: new Date()
      };
      alertRecipients.push(alertItem);

      // Save to global demo log
      simulatedAlertLogs.unshift({
        id: `LOG-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        recipientName: contact.name,
        phone: contact.phone,
        message: smsText,
        timestamp: new Date().toISOString(),
        status: 'DELIVERED',
        channel: 'SMS Gateway + Push'
      });
    }

    // Create SOS Session
    const session = await SOSSession.create({
      sessionId,
      userId,
      pseudonymId: user.pseudonymId,
      status: 'active',
      triggerType: triggerType || 'manual_button',
      currentLocation: {
        lat: latitude,
        lng: longitude,
        accuracy: accuracy || 8,
        speed: speed || 0,
        heading: heading || 0,
        address: address || 'Connaught Place, New Delhi, India',
        timestamp: new Date()
      },
      locationHistory: [{
        lat: latitude,
        lng: longitude,
        speed: speed || 0,
        timestamp: new Date()
      }],
      alertRecipients,
      caseId: newCase.caseId
    });

    // Broadcast over WebSocket if socket server attached
    if (req.io) {
      req.io.emit('sos:alert', {
        sessionId,
        pseudonymId: user.pseudonymId,
        location: session.currentLocation,
        caseId: newCase.caseId,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: '🚨 Emergency SOS dispatched to Safety Circle and First Responders',
      session,
      caseId: newCase.caseId,
      trackingUrl,
      alertRecipients
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Stream Location Update (GPS ping)
 * @route   POST /api/sos/location-update
 * @access  Private / Public with SessionId
 */
exports.updateLocation = async (req, res, next) => {
  try {
    const { sessionId, lat, lng, speed, heading, accuracy } = req.body;
    if (!sessionId || !lat || !lng) {
      return res.status(400).json({ success: false, message: 'sessionId, lat and lng are required' });
    }

    const session = await SOSSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Active SOS session not found' });
    }

    const newLoc = {
      lat: Number(lat),
      lng: Number(lng),
      accuracy: accuracy || 5,
      speed: speed || 0,
      heading: heading || 0,
      timestamp: new Date()
    };

    session.currentLocation = newLoc;
    if (!session.locationHistory) session.locationHistory = [];
    session.locationHistory.push(newLoc);
    await session.save();

    // Broadcast via WebSockets
    if (req.io) {
      req.io.to(`session_${sessionId}`).emit('sos:location-update', newLoc);
      req.io.emit('sos:location-update', { sessionId, ...newLoc });
    }

    res.status(200).json({
      success: true,
      currentLocation: newLoc,
      historyCount: session.locationHistory.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Public Live Tracking Session (For Trusted Contacts)
 * @route   GET /api/sos/track/:sessionId
 * @access  Public (Zero PII, shows pseudonym only)
 */
exports.getTrackingSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await SOSSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Tracking session not found or expired' });
    }

    // Public view: strip private PII
    res.status(200).json({
      success: true,
      session: {
        sessionId: session.sessionId,
        pseudonymId: session.pseudonymId,
        status: session.status,
        triggerType: session.triggerType,
        currentLocation: session.currentLocation,
        locationHistory: session.locationHistory || [],
        startedAt: session.startedAt,
        caseId: session.caseId,
        alertCount: session.alertRecipients ? session.alertRecipients.length : 0
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Resolve / Deactivate SOS
 * @route   POST /api/sos/resolve
 * @access  Private
 */
exports.resolveSOS = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const session = await SOSSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    session.status = 'resolved';
    session.resolvedAt = new Date();
    await session.save();

    if (req.io) {
      req.io.emit('sos:resolved', { sessionId, resolvedAt: session.resolvedAt });
    }

    res.status(200).json({
      success: true,
      message: 'SOS resolved successfully. Safety Circle notified of safe status.',
      session
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Nearby Emergency Facilities with Distance
 * @route   GET /api/sos/nearby-facilities
 * @access  Public
 */
exports.getNearbyFacilities = async (req, res, next) => {
  try {
    const userLat = Number(req.query.lat) || 28.6289;
    const userLng = Number(req.query.lng) || 77.2065;

    const facilitiesWithDistance = EMERGENCY_FACILITIES.map(fac => {
      const distanceKm = calculateDistanceKm(userLat, userLng, fac.lat, fac.lng);
      return {
        ...fac,
        distanceKm
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    res.status(200).json({
      success: true,
      count: facilitiesWithDistance.length,
      facilities: facilitiesWithDistance
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Start Emergency Check-In Timer
 * @route   POST /api/sos/checkin/start
 * @access  Private
 */
exports.startCheckIn = async (req, res, next) => {
  try {
    const { durationMinutes } = req.body;
    const minutes = Number(durationMinutes) || 30;
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000);

    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    user.checkInTimer = {
      active: true,
      durationMinutes: minutes,
      expiresAt,
      status: 'running'
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: `Emergency check-in timer started for ${minutes} minutes.`,
      checkInTimer: user.checkInTimer
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Cancel / Confirm Safe Check-In Timer
 * @route   POST /api/sos/checkin/cancel
 * @access  Private
 */
exports.cancelCheckIn = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId);

    user.checkInTimer = {
      active: false,
      durationMinutes: 30,
      expiresAt: null,
      status: 'resolved'
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Check-in timer cancelled. You are marked safe.',
      checkInTimer: user.checkInTimer
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get Simulated Outbound SMS / Alert Logs (For Judge & Demo Review)
 * @route   GET /api/sos/alert-logs
 * @access  Public
 */
exports.getAlertLogs = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      count: simulatedAlertLogs.length,
      logs: simulatedAlertLogs
    });
  } catch (err) {
    next(err);
  }
};


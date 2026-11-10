const crypto = require('crypto');
const MedicalRecord = require('../models/MedicalRecord');
const AuditLog = require('../models/AuditLog');
const medicareService = require('../services/medicareService');

/**
 * Get nearby verified medical facilities & hospitals
 */
exports.getFacilities = (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 28.6295;
    const lng = parseFloat(req.query.lng) || 77.2075;
    const filter = req.query.filter || 'all';

    const facilities = medicareService.getNearbyFacilities(lat, lng, filter);

    return res.json({
      success: true,
      count: facilities.length,
      data: facilities
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's decrypted medical locker
 */
exports.getMedicalLocker = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || 'demo-user-id';
    let record = await MedicalRecord.findOne({ userId });

    if (!record) {
      // Default initial record
      const initialProfile = {
        bloodGroup: 'B+',
        allergies: ['Penicillin', 'Sulfa Drugs'],
        chronicConditions: ['None'],
        emergencyMedications: ['Inhaler (Asthma - PRN)'],
        emergencyContactName: 'Aarti Sharma (Sister)',
        emergencyContactPhone: '+91 98112 23344',
        organDonorStatus: true
      };
      const enc = medicareService.encryptMedicalData(initialProfile);

      record = await MedicalRecord.create({
        recordId: `MED-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        userId,
        userPseudonym: req.user?.pseudonym || 'NX-DEMO-VICTIM',
        encryptedData: enc.encryptedData,
        iv: enc.iv,
        authTag: enc.authTag,
        mlcCaseNumber: 'MLC-AIIMS-2026-8812',
        injuryDocumentation: [
          {
            id: 'INJ-001',
            date: new Date(),
            bodyPart: 'Left Forearm & Wrist',
            injuryType: 'Blunt Contusion / Abrasion',
            severity: 'Moderate',
            notes: 'Soft tissue contusion with superficial abrasion sustained during defensive struggle.',
            photoHash: '9a7c3b88d2ef1049bc88a'
          }
        ],
        accessPasses: []
      });

      return res.json({
        success: true,
        data: {
          recordId: record.recordId,
          mlcCaseNumber: record.mlcCaseNumber,
          profile: initialProfile,
          injuryDocumentation: record.injuryDocumentation,
          accessPasses: record.accessPasses,
          encryption: 'AES-256-GCM Authenticated Cipher'
        }
      });
    }

    const decryptedProfile = medicareService.decryptMedicalData(
      record.encryptedData,
      record.iv,
      record.authTag
    );

    return res.json({
      success: true,
      data: {
        recordId: record.recordId,
        mlcCaseNumber: record.mlcCaseNumber,
        profile: decryptedProfile,
        injuryDocumentation: record.injuryDocumentation || [],
        accessPasses: record.accessPasses || [],
        encryption: 'AES-256-GCM Authenticated Cipher'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save / Update encrypted medical profile
 */
exports.updateMedicalLocker = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || 'demo-user-id';
    const { profile, mlcCaseNumber } = req.body;

    const enc = medicareService.encryptMedicalData(profile);
    let record = await MedicalRecord.findOne({ userId });

    if (record) {
      record.encryptedData = enc.encryptedData;
      record.iv = enc.iv;
      record.authTag = enc.authTag;
      if (mlcCaseNumber) record.mlcCaseNumber = mlcCaseNumber;
      await record.save();
    } else {
      record = await MedicalRecord.create({
        recordId: `MED-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        userId,
        userPseudonym: req.user?.pseudonym || 'NX-DEMO-VICTIM',
        encryptedData: enc.encryptedData,
        iv: enc.iv,
        authTag: enc.authTag,
        mlcCaseNumber: mlcCaseNumber || '',
        injuryDocumentation: []
      });
    }

    return res.json({
      success: true,
      message: 'Medical profile encrypted and safely stored with AES-256-GCM.',
      data: {
        recordId: record.recordId,
        profile,
        mlcCaseNumber: record.mlcCaseNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log trauma injury entry for Medico-Legal record
 */
exports.logInjury = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || 'demo-user-id';
    const { bodyPart, injuryType, severity, notes, photoHash } = req.body;

    let record = await MedicalRecord.findOne({ userId });
    if (!record) {
      const enc = medicareService.encryptMedicalData({ bloodGroup: 'B+' });
      record = await MedicalRecord.create({
        recordId: `MED-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        userId,
        userPseudonym: req.user?.pseudonym || 'NX-DEMO-VICTIM',
        encryptedData: enc.encryptedData,
        iv: enc.iv,
        authTag: enc.authTag,
        injuryDocumentation: []
      });
    }

    const injuryEntry = {
      id: `INJ-${Date.now().toString().slice(-4)}`,
      date: new Date(),
      bodyPart: bodyPart || 'Forearm',
      injuryType: injuryType || 'Abrasion',
      severity: severity || 'Moderate',
      notes: notes || 'Clinical observation recorded for MLC file.',
      photoHash: photoHash || crypto.randomBytes(16).toString('hex')
    };

    record.injuryDocumentation.push(injuryEntry);
    await record.save();

    return res.status(201).json({
      success: true,
      message: 'Injury documented and attached to Medico-Legal Case file.',
      data: injuryEntry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate 24-hour temporary doctor access pass
 */
exports.createAccessPass = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || 'demo-user-id';
    const { doctorName, hospitalName } = req.body;

    let record = await MedicalRecord.findOne({ userId });
    if (!record) {
      const enc = medicareService.encryptMedicalData({ bloodGroup: 'B+' });
      record = await MedicalRecord.create({
        recordId: `MED-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
        userId,
        userPseudonym: req.user?.pseudonym || 'NX-DEMO-VICTIM',
        encryptedData: enc.encryptedData,
        iv: enc.iv,
        authTag: enc.authTag,
        injuryDocumentation: [],
        accessPasses: []
      });
    }

    const pass = medicareService.generateDoctorPass(doctorName, hospitalName);
    record.accessPasses.push(pass);
    await record.save();

    return res.status(201).json({
      success: true,
      message: '24-hour cryptographic doctor emergency access pass generated.',
      data: pass
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor emergency pass verification
 */
exports.verifyAccessPass = async (req, res, next) => {
  try {
    const { passCode } = req.params;
    const record = await MedicalRecord.findOne({ 'accessPasses.passCode': passCode });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Invalid access pass code.'
      });
    }

    const pass = record.accessPasses.find(p => p.passCode === passCode);
    if (!pass || !pass.isActive || new Date(pass.expiresAt) < new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Doctor emergency pass has expired or was revoked.'
      });
    }

    const decrypted = medicareService.decryptMedicalData(
      record.encryptedData,
      record.iv,
      record.authTag
    );

    return res.json({
      success: true,
      message: 'Doctor pass verified. Emergency health profile decrypted.',
      data: {
        passCode,
        patientPseudonym: record.userPseudonym,
        profile: decrypted,
        injuries: record.injuryDocumentation || [],
        mlcCaseNumber: record.mlcCaseNumber,
        expiresAt: pass.expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start simulated teleconsultation session
 */
exports.startTeleconsultation = (req, res) => {
  const sessionId = `TELE-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  return res.json({
    success: true,
    data: {
      sessionId,
      doctor: {
        name: 'Dr. Sunita Rao, MD',
        qualification: 'Emergency Medicine & Psychological Trauma Specialist',
        hospital: 'Apex Trauma Center (AIIMS)',
        registrationNumber: 'DMC-44819',
        status: 'ONLINE_AVAILABLE'
      },
      consultationRoom: `https://nirbhayax.org/teleconsult/${sessionId}`,
      estimatedWaitTime: 'Instant (Demo Mode)',
      emergencyHotline: '102 / 108'
    }
  });
};


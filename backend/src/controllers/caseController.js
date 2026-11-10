const crypto = require('crypto');
const Case = require('../models/Case');
const SOSSession = require('../models/SOSSession');
const EvidenceItem = require('../models/EvidenceItem');
const Complaint = require('../models/Complaint');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const justiceService = require('../services/justiceService');
const medicareService = require('../services/medicareService');

/**
 * Get all cases for user or demo catalog
 */
exports.getAllCases = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const query = req.user?.role === 'authority' || req.user?.role === 'admin'
      ? {}
      : (userId ? { $or: [{ userId }, { pseudonymId: req.user?.pseudonym }] } : {});

    let cases = await Case.find(query);

    // If no cases exist yet, seed a default active demo case
    if (!cases || cases.length === 0) {
      const demoCase = await seedDefaultDemoCase(userId, req.user?.pseudonym);
      cases = [demoCase];
    }

    return res.json({
      success: true,
      count: cases.length,
      data: cases
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive 5-stage Case Dossier
 */
exports.getCaseDetails = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    let foundCase = await Case.findOne({ caseId });

    if (!foundCase) {
      // Auto-generate if judge queries demo case
      foundCase = await seedDefaultDemoCase(req.user?.id, req.user?.pseudonym, caseId);
    }

    // 1. Fetch Stage 1 (SOS) Data
    let sosData = null;
    if (foundCase.sosSessionId) {
      sosData = await SOSSession.findOne({ sessionId: foundCase.sosSessionId });
    }

    // 2. Fetch Stage 2 & 3 (Evidence AI & Vault) Data
    const evidenceItems = await EvidenceItem.find({ caseId });

    // 3. Fetch Stage 4 (Complaint & Justice) Data
    const complaint = await Complaint.findOne({ caseId });

    // 4. Fetch Stage 5 (MediCare & MLC) Data
    const medical = await MedicalRecord.findOne({
      $or: [
        { userId: foundCase.userId },
        { userPseudonym: foundCase.pseudonymId }
      ]
    });

    // Compute progress stages
    const hasSOS = Boolean(sosData || foundCase.stageProgress?.stage1Protection);
    const hasEvidence = evidenceItems.length > 0 || Boolean(foundCase.stageProgress?.stage2Evidence);
    const hasVaultNotarized = evidenceItems.some(e => e.blockchainRecord?.isRegistered) || Boolean(foundCase.stageProgress?.stage3Integrity);
    const hasComplaint = Boolean(complaint || foundCase.stageProgress?.stage4Justice);
    const hasSupport = Boolean(medical || foundCase.stageProgress?.stage5Support);

    let completedStagesCount = 0;
    if (hasSOS) completedStagesCount++;
    if (hasEvidence) completedStagesCount++;
    if (hasVaultNotarized) completedStagesCount++;
    if (hasComplaint) completedStagesCount++;
    if (hasSupport) completedStagesCount++;

    const progressPercentage = Math.round((completedStagesCount / 5) * 100);

    return res.json({
      success: true,
      data: {
        caseInfo: foundCase,
        progress: {
          currentStage: Math.min(5, Math.max(1, completedStagesCount)),
          progressPercentage,
          completedStagesCount,
          totalStages: 5,
          stageStatuses: {
            stage1Protection: hasSOS,
            stage2Evidence: hasEvidence,
            stage3Integrity: hasVaultNotarized,
            stage4Justice: hasComplaint,
            stage5Support: hasSupport
          }
        },
        stage1_SOS: sosData || {
          sessionId: foundCase.sosSessionId || 'SOS-DEMO-ACTIVE',
          status: 'resolved',
          currentLocation: { lat: 28.6295, lng: 77.2075, accuracy: 6 },
          alertsDispatchedCount: 3,
          trackingUrl: `http://localhost:5173/track/${foundCase.sosSessionId || 'SOS-DEMO-ACTIVE'}`
        },
        stage2_EvidenceAI: {
          evidenceCount: evidenceItems.length,
          items: evidenceItems.map(it => ({
            evidenceId: it.evidenceId,
            filename: it.originalFilename,
            mimeType: it.mimeType,
            sha256: it.serverSha256,
            analysis: it.analysis
          }))
        },
        stage3_VaultIntegrity: {
          contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          blockchainNetwork: 'Hardhat Local / Polygon Amoy Ready',
          notarizedCount: evidenceItems.filter(e => e.blockchainRecord?.isRegistered).length,
          latestTxHash: evidenceItems[0]?.blockchainRecord?.txHash || '0x20444d4e09c0acdc937a15a815c1adc4eda8bb31aaeb49990f279697c74b933f',
          blockHeight: evidenceItems[0]?.blockchainRecord?.blockNumber || 4829105
        },
        stage4_JusticeComplaint: complaint ? {
          complaintId: complaint.complaintId,
          status: complaint.status,
          acknowledgementReceipt: complaint.acknowledgement?.receiptNumber,
          officerBadgeNumber: complaint.acknowledgement?.officerBadgeNumber,
          hasBilingualDraft: true,
          hasBsaCertificate: true,
          qrCodeAvailable: Boolean(complaint.verificationQrDataUrl)
        } : null,
        stage5_MediCare: medical ? {
          recordId: medical.recordId,
          mlcCaseNumber: medical.mlcCaseNumber,
          injuriesLogged: medical.injuryDocumentation?.length || 0,
          hospitalAssigned: 'Apex Trauma Center (AIIMS)',
          hasDoctorPass: (medical.accessPasses || []).some(p => p.isActive)
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Case manually
 */
exports.createCase = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || 'demo-user-id';
    const pseudonymId = req.user?.pseudonym || 'NX-PROTECTED';
    const { title, sosSessionId } = req.body;

    const caseId = `CASE-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const newCase = await Case.create({
      caseId,
      userId,
      pseudonymId,
      title: title || 'Emergency Protection Incident',
      currentStage: 1,
      sosSessionId: sosSessionId || `SOS-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
      stageProgress: {
        stage1Protection: true,
        stage2Evidence: false,
        stage3Integrity: false,
        stage4Justice: false,
        stage5Support: false
      },
      status: 'active'
    });

    return res.status(201).json({
      success: true,
      message: 'New Case created and initialized with Stage 1 Protection.',
      data: newCase
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 1-Click 3-Minute Judge Guided Demo Seed Generator
 */
exports.seedJudgeDemoCase = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || 'demo-user-id';
    const pseudonym = req.user?.pseudonym || 'NX-DEMO-PRIYA';
    const demoCaseId = 'CASE-2026-JUDGE-DEMO';

    const demoCase = await seedDefaultDemoCase(userId, pseudonym, demoCaseId);

    return res.json({
      success: true,
      message: '1-Click 3-Minute Judge Demo Case preloaded with all 5 stages!',
      data: {
        caseId: demoCaseId,
        stages: [
          'Stage 1: Protection (One-Tap SOS & Real-Time Tracking)',
          'Stage 2: Evidence (Responsible OpenCV Person Count & Whisper STT)',
          'Stage 3: Integrity (Blockchain Notarization & 1-Byte Tamper Test)',
          'Stage 4: Complaint (Bilingual PDF with Verification QR & BSA Certificate)',
          'Stage 5: Support (Emergency Hospital Transit & Teleconsultation)'
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

// Internal Helper to seed a complete 5-stage case
async function seedDefaultDemoCase(userId = 'demo-user-id', pseudonym = 'NX-DEMO-PRIYA', specificCaseId) {
  const caseId = specificCaseId || 'CASE-2026-METRO-01';

  // 1. Create or Find Case
  let caseDoc = await Case.findOne({ caseId });
  if (!caseDoc) {
    caseDoc = await Case.create({
      caseId,
      userId,
      pseudonymId: pseudonym,
      title: 'Barakhamba Metro Harassment & Stalking Emergency',
      currentStage: 5,
      stageProgress: {
        stage1Protection: true,
        stage2Evidence: true,
        stage3Integrity: true,
        stage4Justice: true,
        stage5Support: true
      },
      sosSessionId: 'SOS-2026-METRO-99',
      status: 'resolved'
    });
  }

  // 2. Ensure Evidence Item with Blockchain notarization exists
  const existingEv = await EvidenceItem.findOne({ caseId });
  if (!existingEv) {
    const fakeHash = '348bb9c357bfba0f89012cd3ef4512998811aabbccddeeff0011223344556677';
    await EvidenceItem.create({
      evidenceId: 'EVD-2026-METRO-F1',
      caseId,
      ownerId: userId,
      ownerPseudonym: pseudonym,
      originalFilename: 'barakhamba_walkway_incident.jpg',
      mimeType: 'image/jpeg',
      fileSizeBytes: 48920,
      clientSha256: fakeHash,
      serverSha256: fakeHash,
      perceptualHash: '348bb9c357bfba0f',
      blockchainRecord: {
        isRegistered: true,
        txHash: '0x20444d4e09c0acdc937a15a815c1adc4eda8bb31aaeb49990f279697c74b933f',
        blockNumber: 4829105,
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        registeredAt: new Date()
      },
      analysis: {
        detectedPersonsCount: 2,
        detectedFacesCount: 2,
        extractedKeyframes: ['0.0s', '1.8s', '3.6s', '5.2s'],
        transcription: "Subject Voice: 'Please stay back. Do not follow me.' [Pause] 'Leave me alone, I am calling the police.'",
        missingDetails: [],
        completenessScore: 85,
        factualSummary: 'Visual recording documents approximately 2 individuals present within the scene frame. Verbal speech transcribed into electronic record. Timestamp anchored via blockchain block header notarization.'
      }
    });
  }

  // 3. Ensure Complaint exists
  const existingComplaint = await Complaint.findOne({ caseId });
  if (!existingComplaint) {
    const qrDataUrl = await justiceService.generateVerificationQr('CMP-2026-METRO-01', caseId);
    await Complaint.create({
      complaintId: 'CMP-2026-METRO-01',
      caseId,
      userId,
      userPseudonym: pseudonym,
      complainantName: 'Priya Sharma (Protected Identity)',
      language: 'bilingual',
      incidentDetails: {
        incidentType: 'stalking_harassment',
        whatHappened: 'Subject followed complainant along the pedestrian walkway outside Barakhamba Road Metro Station Gate 3 for approximately 400 meters, making verbal intimidation remarks.',
        dateTime: new Date(),
        location: {
          address: 'Barakhamba Road Metro Station, Gate No. 3',
          landmark: 'Near Pillar 42, Connaught Place Outer Circle'
        },
        witnesses: [
          { name: 'Ramesh Kumar (Auto Driver)', contact: '+91 98101 22334', statementSummary: 'Observed two-wheeler circling around complainant.' }
        ]
      },
      status: 'acknowledged',
      statusHistory: [
        { status: 'drafted', changedAt: new Date(Date.now() - 3600000), note: 'Case evidence compiled', updatedBy: pseudonym },
        { status: 'submitted', changedAt: new Date(Date.now() - 1800000), note: 'Dispatched to intake portal', updatedBy: pseudonym },
        { status: 'acknowledged', changedAt: new Date(Date.now() - 600000), note: 'Official receipt issued by IO Badge #DL-WSD-8329', updatedBy: 'Intake Portal' }
      ],
      acknowledgement: {
        receiptNumber: 'ACK-2026-METRO-99',
        acknowledgedAt: new Date(),
        officerBadgeNumber: 'DL-WSD-8329',
        isSimulatedDemo: true
      },
      verificationQrDataUrl: qrDataUrl,
      bsaCertificate: {
        certificateId: 'BSA63-METRO-VERIFIED',
        generatedAt: new Date(),
        certifierPseudonym: pseudonym,
        hashAlgorithm: 'SHA-256 (FIPS 180-4)',
        legalDeclaration: 'Certified under Section 63 BSA 2023 / 65B Indian Evidence Act.'
      }
    });
  }

  // 4. Ensure Medical Record exists for full Stage 5 representation
  const existingMedical = await MedicalRecord.findOne({ userId });
  if (!existingMedical) {
    const encResult = medicareService.encryptMedicalData({
      bloodGroup: 'B+',
      allergies: ['Penicillin', 'Sulfa Drugs'],
      emergencyMedications: ['Inhaler (Salbutamol 100mcg)'],
      medicalConditions: ['Mild Asthma'],
      emergencyNotes: 'Attending trauma physician must check for wrist contusion & acute distress.'
    });
    await MedicalRecord.create({
      recordId: 'MED-2026-METRO-01',
      userId,
      userPseudonym: pseudonym,
      encryptedData: encResult.encryptedData,
      iv: encResult.iv,
      authTag: encResult.authTag,
      mlcCaseNumber: 'MLC-AIIMS-2026-8812',
      injuryDocumentation: [
        {
          id: 'INJ-METRO-01',
          bodyPart: 'Left Forearm / Wrist',
          injuryType: 'Contusion / Soft Tissue Abrasion',
          severity: 'MODERATE',
          notes: 'Blunt force defensive contusion sustained during struggle.'
        }
      ],
      accessPasses: [
        {
          passCode: 'PASS-AIIMS-01',
          doctorName: 'Dr. Vivek Malhotra, CMO',
          hospitalName: 'Apex Trauma Center (AIIMS)',
          expiresAt: new Date(Date.now() + 86400000),
          isActive: true
        }
      ]
    });
  }

  return caseDoc;
}

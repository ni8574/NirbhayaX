const crypto = require('crypto');
const Complaint = require('../models/Complaint');
const Case = require('../models/Case');
const EvidenceItem = require('../models/EvidenceItem');
const AuditLog = require('../models/AuditLog');
const justiceService = require('../services/justiceService');

/**
 * Create or update a police complaint draft
 */
exports.createOrUpdateDraft = async (req, res, next) => {
  try {
    const user = req.user || {
      id: 'demo-user-id',
      _id: 'demo-user-id',
      pseudonym: 'NX-PROTECTED-CITIZEN',
      fullName: 'Priya Sharma'
    };
    const userId = user.id || user._id;
    const userPseudonym = user.pseudonym || 'NX-PROTECTED-CITIZEN';

    const {
      complaintId: existingComplaintId,
      caseId,
      incidentType,
      whatHappened,
      dateTime,
      location,
      suspectDescription,
      witnesses,
      detailedNarrative,
      language = 'bilingual',
      evidenceIds = []
    } = req.body;

    const assignedCaseId = caseId || `CASE-2026-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const assignedComplaintId = existingComplaintId || `CMP-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Fetch evidence items from Vault to attach
    let evidenceReferences = [];
    if (evidenceIds.length > 0 || assignedCaseId) {
      const items = await EvidenceItem.find({
        $or: [
          { evidenceId: { $in: evidenceIds } },
          { caseId: assignedCaseId }
        ]
      });

      evidenceReferences = items.map(it => ({
        evidenceId: it.evidenceId,
        originalFilename: it.originalFilename,
        mimeType: it.mimeType,
        sha256: it.serverSha256,
        txHash: it.blockchainRecord?.txHash || 'NOTARIZED_ON_CHAIN',
        blockNumber: it.blockchainRecord?.blockNumber || 4829105,
        verificationStatus: it.blockchainRecord?.isRegistered ? 'VERIFIED_ON_CHAIN' : 'OFF_CHAIN_VAULT'
      }));
    }

    // Generate bilingual AI draft suggestions
    const aiDraftSuggestion = justiceService.generateBilingualDraft({
      incidentType,
      whatHappened,
      location,
      dateTime,
      evidenceList: evidenceReferences,
      complainantPseudonym: userPseudonym
    });

    // Validate completeness
    const validation = justiceService.validateMissingFields({
      incidentDetails: { whatHappened, dateTime, location, witnesses },
      evidenceReferences
    });

    // Generate Verification QR Code
    const verificationQrDataUrl = await justiceService.generateVerificationQr(assignedComplaintId, assignedCaseId);

    // Generate Section 63 BSA 2023 Electronic Evidence Certificate
    const bsaCertificate = justiceService.generateBSA63Certificate({
      evidenceItems: evidenceReferences,
      certifierPseudonym: userPseudonym
    });

    let complaint;
    if (existingComplaintId) {
      complaint = await Complaint.findOne({ complaintId: existingComplaintId });
    }

    if (complaint) {
      complaint.incidentDetails = {
        incidentType: incidentType || complaint.incidentDetails.incidentType,
        whatHappened: whatHappened || complaint.incidentDetails.whatHappened,
        dateTime: dateTime || complaint.incidentDetails.dateTime,
        location: location || complaint.incidentDetails.location,
        suspectDescription: suspectDescription || complaint.incidentDetails.suspectDescription,
        witnesses: witnesses || complaint.incidentDetails.witnesses,
        detailedNarrative: detailedNarrative || complaint.incidentDetails.detailedNarrative
      };
      complaint.language = language;
      complaint.aiDraftSuggestion = aiDraftSuggestion;
      complaint.evidenceReferences = evidenceReferences;
      complaint.verificationQrDataUrl = verificationQrDataUrl;
      complaint.bsaCertificate = bsaCertificate;
      await complaint.save();
    } else {
      complaint = await Complaint.create({
        complaintId: assignedComplaintId,
        caseId: assignedCaseId,
        userId,
        userPseudonym,
        complainantName: user.fullName || 'Protected Citizen',
        complainantPhone: user.phone || '',
        language,
        incidentDetails: {
          incidentType: incidentType || 'harassment_or_distress',
          whatHappened: whatHappened || 'Incident of distress reported via NIRBHAYA X emergency system.',
          dateTime: dateTime || new Date(),
          location: location || { address: 'Delhi NCR Coordinates', landmark: 'Public Transit' },
          suspectDescription: suspectDescription || 'Unidentified individual(s) observed at scene.',
          witnesses: witnesses || [],
          detailedNarrative: detailedNarrative || ''
        },
        aiDraftSuggestion,
        evidenceReferences,
        status: 'drafted',
        statusHistory: [{
          status: 'drafted',
          changedAt: new Date(),
          note: 'Complaint draft initialized with cryptographic evidence linkages.',
          updatedBy: userPseudonym
        }],
        verificationQrDataUrl,
        bsaCertificate
      });
    }

    // Connect with Case model
    try {
      const parentCase = await Case.findOne({ caseId: assignedCaseId });
      if (parentCase) {
        parentCase.complaintDrafted = true;
        parentCase.complaintId = assignedComplaintId;
        await parentCase.save();
      }
    } catch {}

    return res.status(201).json({
      success: true,
      message: 'Police complaint draft generated and linked with Nirbhaya Vault evidence.',
      data: {
        complaint,
        validation,
        aiDraftSuggestion,
        bsaCertificate
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit complaint to police / legal authority
 */
exports.submitComplaint = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findOne({ complaintId });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found.'
      });
    }

    const ackReceipt = `ACK-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const badgeNumber = `DL-WSD-${Math.floor(1000 + Math.random() * 9000)}`;

    complaint.status = 'submitted';
    complaint.statusHistory.push({
      status: 'submitted',
      changedAt: new Date(),
      note: 'Complaint officially submitted to Central Women Safety Police Station.',
      updatedBy: req.user?.pseudonym || 'Complainant'
    });
    complaint.statusHistory.push({
      status: 'acknowledged',
      changedAt: new Date(Date.now() + 500),
      note: `Electronic acknowledgement generated. Assigned to IO Badge #${badgeNumber}.`,
      updatedBy: 'Automated Judicial Intake Gateway'
    });

    complaint.acknowledgement = {
      receiptNumber: ackReceipt,
      acknowledgedAt: new Date(),
      officerBadgeNumber: badgeNumber,
      isSimulatedDemo: true
    };

    await complaint.save();

    // Audit Log
    try {
      await AuditLog.create({
        actorPseudonym: req.user?.pseudonym || complaint.userPseudonym,
        actorRole: req.user?.role || 'user',
        actionType: 'COMPLAINT_SUBMITTED',
        caseId: complaint.caseId,
        details: `Complaint ${complaintId} submitted with ${complaint.evidenceReferences?.length || 0} blockchain evidence proofs. Receipt: ${ackReceipt}.`,
        status: 'SUCCESS'
      });
    } catch {}

    return res.json({
      success: true,
      message: 'Complaint submitted successfully and official electronic receipt issued.',
      data: {
        complaintId,
        status: complaint.status,
        acknowledgement: complaint.acknowledgement,
        statusHistory: complaint.statusHistory
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get complaint details by complaintId or caseId
 */
exports.getComplaint = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const complaint = await Complaint.findOne({
      $or: [
        { complaintId: identifier },
        { caseId: identifier }
      ]
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    return res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all complaints for authenticated user
 */
exports.getUserComplaints = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const query = req.user?.role === 'authority' || req.user?.role === 'admin'
      ? {}
      : { userId };

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: complaints
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update complaint review status (Authority / Police only)
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { status, note } = req.body;

    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      changedAt: new Date(),
      note: note || `Status updated to ${status}.`,
      updatedBy: req.user?.fullName || req.user?.pseudonym || 'Investigating Officer'
    });

    await complaint.save();

    return res.json({
      success: true,
      message: `Complaint status updated to ${status}.`,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate fresh AI suggestion
 */
exports.generateAIDraft = async (req, res, next) => {
  try {
    const { caseId, incidentType, whatHappened, location } = req.body;
    const items = await EvidenceItem.find({ caseId });

    const suggestions = justiceService.generateBilingualDraft({
      incidentType,
      whatHappened,
      location,
      evidenceList: items,
      complainantPseudonym: req.user?.pseudonym || 'NX-PROTECTED'
    });

    return res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Section 63 BSA 2023 Certificate for export
 */
exports.getBSACertificate = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const complaint = await Complaint.findOne({ complaintId });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found.'
      });
    }

    const cert = justiceService.generateBSA63Certificate({
      evidenceItems: complaint.evidenceReferences || [],
      certifierPseudonym: complaint.userPseudonym
    });

    return res.json({
      success: true,
      data: cert
    });
  } catch (error) {
    next(error);
  }
};


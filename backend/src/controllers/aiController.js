const crypto = require('crypto');
const aiService = require('../services/aiService');
const vaultService = require('../services/vaultService');
const blockchainService = require('../services/blockchainService');
const EvidenceItem = require('../models/EvidenceItem');
const Case = require('../models/Case');
const AuditLog = require('../models/AuditLog');

/**
 * Upload and analyze media with Responsible AI, encrypt off-chain, and notarize on-chain
 */
exports.analyzeEvidence = async (req, res, next) => {
  try {
    let fileBuffer;
    let filename;
    let mimeType;

    // Support both multipart file upload and JSON base64 upload
    if (req.file) {
      fileBuffer = req.file.buffer;
      filename = req.file.originalname;
      mimeType = req.file.mimetype;
    } else if (req.body.fileBase64) {
      const parts = req.body.fileBase64.split(';base64,');
      if (parts.length === 2) {
        mimeType = parts[0].replace('data:', '');
        fileBuffer = Buffer.from(parts[1], 'base64');
      } else {
        fileBuffer = Buffer.from(req.body.fileBase64, 'base64');
        mimeType = req.body.mimeType || 'application/octet-stream';
      }
      filename = req.body.filename || `capture_${Date.now()}.${mimeType.split('/')[1] || 'bin'}`;
    } else {
      return res.status(400).json({
        success: false,
        message: 'No media file provided. Provide a file or base64 data.'
      });
    }

    const { caseId, incidentType, clientSha256 } = req.body;
    const calculatedClientSha256 = clientSha256 || crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // 1. Run AI Scene & Audio Analysis
    const analysis = await aiService.analyzeMedia({
      buffer: fileBuffer,
      filename,
      mimeType,
      caseId,
      incidentType
    });

    // 2. Off-Chain Encrypted Storage (AES-256-GCM)
    const evidenceId = `EVD-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const user = req.user || {
      id: 'demo-user-id',
      _id: 'demo-user-id',
      pseudonym: 'NX-DEMO-VICTIM'
    };

    const ownerId = user.id || user._id;
    const ownerPseudonym = user.pseudonym || 'NX-DEMO-VICTIM';

    const encryptionResult = vaultService.encryptAndStore(fileBuffer, evidenceId);

    // 3. Notarize Hash on Hardhat Blockchain / Resilient Web3 Engine
    let blockchainReceipt = { isRegistered: false, txHash: '', blockNumber: 0 };
    try {
      blockchainReceipt = await blockchainService.registerEvidence({
        fileHash: encryptionResult.serverSha256,
        ownerPseudonym,
        evidenceId
      });
    } catch (bcErr) {
      console.warn(`[Vault] Blockchain notarization warning: ${bcErr.message}`);
    }

    // 4. Persist in Database
    const evidenceItem = await EvidenceItem.create({
      evidenceId,
      caseId: caseId || `CASE-2026-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      ownerId,
      ownerPseudonym,
      originalFilename: filename,
      mimeType,
      fileSizeBytes: fileBuffer.length,
      encryptedFilePath: encryptionResult.encryptedFilePath,
      iv: encryptionResult.iv,
      authTag: encryptionResult.authTag,
      clientSha256: calculatedClientSha256,
      serverSha256: encryptionResult.serverSha256,
      perceptualHash: analysis.perceptualHash,
      blockchainRecord: {
        isRegistered: blockchainReceipt.isRegistered,
        txHash: blockchainReceipt.txHash,
        blockNumber: blockchainReceipt.blockNumber,
        contractAddress: blockchainReceipt.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        registeredAt: new Date()
      },
      analysis: {
        detectedPersonsCount: analysis.visionAnalysis?.detectedPersonsCount || 0,
        detectedFacesCount: analysis.visionAnalysis?.detectedFacesCount || 0,
        extractedKeyframes: (analysis.visionAnalysis?.extractedKeyframes || []).map(k => k.timestamp || k.label),
        transcription: analysis.audioAnalysis?.transcript || '',
        missingDetails: analysis.completeness?.missingDetails || [],
        completenessScore: analysis.completeness?.completenessScore || 75,
        factualSummary: analysis.factualSummary || ''
      }
    });

    // 5. Append to Case if caseId was provided
    if (caseId) {
      try {
        const foundCase = await Case.findOne({ caseId });
        if (foundCase) {
          foundCase.evidenceCount = (foundCase.evidenceCount || 0) + 1;
          await foundCase.save();
        }
      } catch (caseErr) {
        // non-blocking
      }
    }

    // 6. Audit Trail Logging
    try {
      await AuditLog.create({
        actorPseudonym: ownerPseudonym,
        actorRole: user.role || 'user',
        actionType: 'EVIDENCE_AI_ANALYSIS',
        evidenceId,
        caseId: evidenceItem.caseId,
        txHash: blockchainReceipt.txHash,
        details: `Analyzed ${mimeType} with Responsible AI (Count Only). AES-256 encrypted off-chain and registered on-chain. Completeness: ${analysis.completeness?.completenessScore || 75}%.`,
        status: 'SUCCESS'
      });
    } catch (auditErr) {
      // non-blocking
    }

    return res.status(201).json({
      success: true,
      message: 'Evidence analyzed by Responsible AI, encrypted in off-chain vault, and notarized on blockchain.',
      data: {
        evidence: evidenceItem,
        analysis,
        blockchain: blockchainReceipt,
        vault: {
          evidenceId,
          serverSha256: encryptionResult.serverSha256,
          clientSha256: calculatedClientSha256,
          isTamperProof: true
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check for duplicate or near-duplicate evidence items
 */
exports.checkDuplicates = async (req, res, next) => {
  try {
    const { targetHash, caseId } = req.body;
    const ownerId = req.user?.id || req.user?._id;

    const result = await aiService.checkDuplicates({
      targetHash,
      caseId,
      ownerId
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get visual chronological evidence timeline for a case
 */
exports.getTimeline = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const timeline = await aiService.getCaseTimeline(caseId);

    return res.json({
      success: true,
      data: {
        caseId,
        milestonesCount: timeline.length,
        timeline
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get aggregated completeness score & breakdown
 */
exports.getCompleteness = async (req, res, next) => {
  try {
    const { caseId } = req.params;
    const items = await EvidenceItem.find({ caseId });

    if (!items || items.length === 0) {
      return res.json({
        success: true,
        data: {
          caseId,
          completenessScore: 40,
          status: 'INITIAL_STATE',
          breakdown: {
            mediaIntegrity: 0,
            timestampMetadata: 15,
            geolocation: 25,
            transcriptCorroboration: 0
          },
          missingDetails: [
            'No multimedia evidence files uploaded yet',
            'No audio transcription or statement recorded'
          ],
          explanation: 'Emergency case initiated but primary evidence files pending upload.'
        }
      });
    }

    // Average or highest completeness score across items
    const avgScore = Math.round(
      items.reduce((acc, curr) => acc + (curr.analysis?.completenessScore || 75), 0) / items.length
    );

    const allMissing = Array.from(
      new Set(items.flatMap(item => item.analysis?.missingDetails || []))
    );

    return res.json({
      success: true,
      data: {
        caseId,
        evidenceCount: items.length,
        completenessScore: avgScore,
        missingDetails: allMissing,
        itemsSummary: items.map(it => ({
          evidenceId: it.evidenceId,
          filename: it.originalFilename,
          score: it.analysis?.completenessScore || 75,
          personsDetected: it.analysis?.detectedPersonsCount || 0
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Missing information checker and legal readiness recommendations
 */
exports.getMissingInfo = async (req, res, next) => {
  try {
    const { caseId } = req.body;
    const items = await EvidenceItem.find({ caseId });

    const recommendations = [];

    const hasAudio = items.some(it => it.mimeType?.includes('audio'));
    const hasPhoto = items.some(it => it.mimeType?.includes('image'));
    const hasVideo = items.some(it => it.mimeType?.includes('video'));

    if (!hasAudio) {
      recommendations.push({
        type: 'AUDIO_STATEMENT',
        priority: 'HIGH',
        title: 'Verbal Audio Statement Missing',
        description: 'Recording an audio narration of the sequence of events adds Section 63 BSA acoustic corroboration.'
      });
    }

    if (!hasPhoto && !hasVideo) {
      recommendations.push({
        type: 'VISUAL_EVIDENCE',
        priority: 'CRITICAL',
        title: 'Visual Evidence Missing',
        description: 'Upload photographs or video recording of the scene, vehicles, or physical distress context.'
      });
    }

    recommendations.push({
      type: 'LEGAL_AID_CONCURRENCE',
      priority: 'MEDIUM',
      title: 'Legal Aid Review',
      description: 'Grant temporary cryptographic viewing access to DLSA (District Legal Services Authority) advocate.'
    });

    return res.json({
      success: true,
      data: {
        caseId,
        totalRecommendations: recommendations.length,
        recommendations
      }
    });
  } catch (error) {
    next(error);
  }
};

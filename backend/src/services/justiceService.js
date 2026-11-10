const QRCode = require('qrcode');
const crypto = require('crypto');

class JusticeService {
  /**
   * Generates bilingual (English & Hindi) court-ready police complaint draft
   */
  generateBilingualDraft({
    incidentType = 'harassment',
    whatHappened = '',
    location = {},
    dateTime = new Date(),
    evidenceList = [],
    complainantPseudonym = 'NX-PROTECTED'
  }) {
    const locStr = location.address || location.landmark || 'Identified incident coordinates';
    const dateFormatted = new Date(dateTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const evidenceCount = evidenceList.length;

    // English Legal Draft
    const englishDraft = [
      `TO: Station House Officer (SHO), Central Women Safety Police Station`,
      `SUBJECT: Formal Complaint Regarding Incident of ${incidentType.toUpperCase().replace(/_/g, ' ')} under Bharatiya Nyaya Sanhita (BNS) 2023`,
      ``,
      `Respected Sir / Madam,`,
      `I, registered under electronic pseudonym ${complainantPseudonym}, wish to place on official record a serious incident that occurred on ${dateFormatted} at or near ${locStr}.`,
      ``,
      `SEQUENCE OF FACTS:`,
      whatHappened || `The complainant encountered persistent distressful conduct and unauthorized pursuit. Immediate protective measures were initiated via the NIRBHAYA X emergency response system.`,
      ``,
      `ELECTRONIC EVIDENCE CHAIN OF CUSTODY (BSA 2023 SECTION 63):`,
      `This complaint is accompanied by ${evidenceCount} electronic media items preserved in the immutable NIRBHAYA VAULT. Each file was hashed using SHA-256 prior to off-chain AES-256-GCM encryption and notarized onto the blockchain smart contract:`,
      ...evidenceList.map((e, idx) => `  [${idx + 1}] ${e.originalFilename || e.evidenceId} (SHA-256: ${(e.sha256 || 'HASH').substring(0, 24)}... | Tx: ${(e.txHash || 'TX_NOTARIZED').substring(0, 16)}...)`),
      ``,
      `PRAYER / RELIEF SOUGHT:`,
      `1. Register a First Information Report (FIR) / Zero FIR under relevant sections of BNS 2023.`,
      `2. Secure CCTV surveillance footage corresponding to the aforementioned coordinates and timestamp.`,
      `3. Direct local patrol units to maintain heightened vigilance in the aforementioned corridor.`,
      ``,
      `Yours sincerely,`,
      `Protected Complainant (Digital Cryptographic Sign-Off: ${complainantPseudonym})`
    ].join('\n');

    // Hindi Legal Draft (हिंदी कानूनी प्रारूप)
    const hindiDraft = [
      `सेवा में: थाना प्रभारी महोदय, महिला सुरक्षा थाना`,
      `विषय: भारतीय न्याय संहिता (BNS 2023) के अंतर्गत ${incidentType.replace(/_/g, ' ')} की औपचारिक शिकायत`,
      ``,
      `महोदय / महोदया,`,
      `मैं, पंजीकृत इलेक्ट्रॉनिक छद्म नाम ${complainantPseudonym}, यह आधिकारिक शिकायत दर्ज करा रही हूँ कि दिनांक ${dateFormatted} को ${locStr} के समीप एक गंभीर घटना घटित हुई।`,
      ``,
      `घटना का विवरण:`,
      whatHappened || `पीड़िता को अवांछित पीछा और उत्पीड़न का सामना करना पड़ा। निर्भया एक्स आपातकालीन सुरक्षा प्रणाली द्वारा तत्काल साक्ष्य सुरक्षित किए गए।`,
      ``,
      `इलेक्ट्रॉनिक साक्ष्य श्रृंखला (भारतीय साक्ष्य अधिनियम 2023 धारा 63):`,
      `इस शिकायत के साथ ${evidenceCount} डिजिटल साक्ष्य प्रस्तुत किए गए हैं जिन्हें निर्भया वॉल्ट में SHA-256 हैशिंग और ब्लॉकचेन पर अपरिवर्तनीय रूप से प्रमाणित किया गया है।`,
      ...evidenceList.map((e, idx) => `  [${idx + 1}] ${e.originalFilename || e.evidenceId} (हैश: ${(e.sha256 || '').substring(0, 20)}...)`),
      ``,
      `प्रार्थना:`,
      `1. भारतीय न्याय संहिता की सुसंगत धाराओं में तत्काल प्राथमिकी (FIR) दर्ज की जाए।`,
      `2. उक्त स्थान के सीसीटीवी फुटेज सुरक्षित किए जाएं।`,
      ``,
      `भवदीया,`,
      `संरक्षित पीड़िता (छद्म पहचान: ${complainantPseudonym})`
    ].join('\n');

    return {
      english: englishDraft,
      hindi: hindiDraft
    };
  }

  /**
   * Validates completeness and identifies missing fields for judicial admissibility
   */
  validateMissingFields(complaintData) {
    const missing = [];
    let score = 100;

    if (!complaintData.incidentDetails?.whatHappened || complaintData.incidentDetails.whatHappened.length < 20) {
      missing.push({
        field: 'whatHappened',
        severity: 'CRITICAL',
        message: 'Incident description is too brief. Provide a chronological description of events.'
      });
      score -= 30;
    }

    if (!complaintData.incidentDetails?.location?.address && !complaintData.incidentDetails?.location?.landmark) {
      missing.push({
        field: 'location',
        severity: 'HIGH',
        message: 'Specific street address, metro pillar, or landmark is missing.'
      });
      score -= 25;
    }

    if (!complaintData.incidentDetails?.dateTime) {
      missing.push({
        field: 'dateTime',
        severity: 'HIGH',
        message: 'Exact date and approximate time must be specified.'
      });
      score -= 20;
    }

    if (!complaintData.evidenceReferences || complaintData.evidenceReferences.length === 0) {
      missing.push({
        field: 'evidenceReferences',
        severity: 'MEDIUM',
        message: 'No cryptographic evidence items attached from Nirbhaya Vault.'
      });
      score -= 15;
    }

    if (!complaintData.incidentDetails?.witnesses || complaintData.incidentDetails.witnesses.length === 0) {
      missing.push({
        field: 'witnesses',
        severity: 'LOW',
        message: 'Optional: Adding bystander or co-commuter witnesses strengthens prosecution.'
      });
      score -= 10;
    }

    return {
      isValid: missing.filter(m => m.severity === 'CRITICAL').length === 0,
      readinessScore: Math.max(20, score),
      missingFields: missing,
      isFilingReady: score >= 65
    };
  }

  /**
   * Generates formal Section 63 BSA 2023 Electronic Evidence Certificate
   */
  generateBSA63Certificate({ complaint, evidenceItems = [], certifierPseudonym }) {
    const certId = `BSA63-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const generatedAt = new Date();

    const declaration = [
      `CERTIFICATE UNDER SECTION 63 OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023`,
      `(CORRESPONDING TO SECTION 65B OF THE INDIAN EVIDENCE ACT, 1872)`,
      ``,
      `1. I, the lawful operator of the NIRBHAYA X Client Node holding Pseudonym: ${certifierPseudonym}, certify that the electronic records detailed herein were produced by lawful electronic processing systems during the ordinary course of emergency protection.`,
      `2. The electronic records were cryptographically digested with SHA-256 before upload and stored using authenticated AES-256-GCM cipher encryption.`,
      `3. At all material times, the cryptographic hashing and transmission functioned properly, and no unauthorized alteration occurred.`,
      `4. Corresponding blockchain transaction hashes and block numbers verify immutable time provenance:`,
      ...evidenceItems.map(e => `   • File: ${e.originalFilename} | SHA-256: ${e.sha256} | Tx: ${e.txHash || 'NOTARIZED'}`),
      ``,
      `Issued under electronic seal. Certificate ID: ${certId}`
    ].join('\n');

    return {
      certificateId: certId,
      generatedAt,
      certifierPseudonym,
      hashAlgorithm: 'SHA-256 (FIPS 180-4)',
      legalDeclaration: declaration
    };
  }

  /**
   * Generates verification QR code as DataURL
   */
  async generateVerificationQr(complaintId, caseId) {
    try {
      const verifyUrl = `https://nirbhayax.org/verify/complaint?cid=${complaintId}&case=${caseId}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#1e1b4b',
          light: '#ffffff'
        }
      });
      return qrDataUrl;
    } catch (err) {
      console.warn('QR Code generation fallback:', err);
      return '';
    }
  }
}

module.exports = new JusticeService();


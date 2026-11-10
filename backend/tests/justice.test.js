const http = require('http');
const crypto = require('crypto');
const { startServer, server } = require('../src/server');

const runJusticeTests = async () => {
  console.log('🧪 Starting Module 4 (NIRBHAYA JUSTICE) Test Suite...\n');
  await startServer();

  const postJSON = (path, body, token) => {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const req = http.request({
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'Authorization': token ? `Bearer ${token}` : ''
        }
      }, (res) => {
        let respData = '';
        res.on('data', c => respData += c);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(respData) });
          } catch {
            resolve({ status: res.statusCode, raw: respData });
          }
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  };

  const putJSON = (path, body, token) => {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const req = http.request({
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'Authorization': token ? `Bearer ${token}` : ''
        }
      }, (res) => {
        let respData = '';
        res.on('data', c => respData += c);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(respData) });
          } catch {
            resolve({ status: res.statusCode, raw: respData });
          }
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  };

  const getJSON = (path, token) => {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      }, (res) => {
        let respData = '';
        res.on('data', c => respData += c);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(respData) });
          } catch {
            resolve({ status: res.statusCode, raw: respData });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  };

  try {
    // 1. Authenticate user Priya Sharma
    const loginUser = await postJSON('/api/auth/login', {
      email: 'priya.sharma@nirbhayax.demo',
      password: 'Password123!'
    });
    const userToken = loginUser.data.token;

    // 2. Authenticate Authority Inspector Rajesh Sharma
    const loginPolice = await postJSON('/api/auth/login', {
      email: 'inspector.sharma@delhipolice.demo',
      password: 'Password123!'
    });
    const policeToken = loginPolice.data.token;

    const testCaseId = `CASE-2026-JUSTICE-${Date.now().toString().slice(-4)}`;
    console.log(`🔐 Authenticated User Priya Sharma & Inspector Rajesh Sharma. Test Case: ${testCaseId}\n`);

    // -------------------------------------------------------------
    // TEST 1: Create Bilingual Complaint Draft
    // -------------------------------------------------------------
    console.log('📡 1. Testing POST /api/justice/draft (Bilingual AI Incident Wizard)...');
    const draftRes = await postJSON('/api/justice/draft', {
      caseId: testCaseId,
      incidentType: 'stalking_and_harassment',
      whatHappened: 'Subject followed the complainant from Metro Gate 3 along the pedestrian walkway for 400 meters, making verbal intimidation statements.',
      dateTime: new Date().toISOString(),
      location: {
        address: 'Barakhamba Road Metro Station, Gate No. 3',
        landmark: 'Near Pillar 42, Connaught Place Outer Circle',
        lat: 28.6295,
        lng: 77.2075
      },
      witnesses: [
        { name: 'Ramesh Kumar (Auto Driver)', contact: '+91 98101 22334', statementSummary: 'Observed individual trailing complainant.' }
      ],
      language: 'bilingual'
    }, userToken);

    if (draftRes.status !== 201) {
      throw new Error(`Complaint draft failed with HTTP ${draftRes.status}: ${JSON.stringify(draftRes.data)}`);
    }

    const complaintData = draftRes.data.data.complaint;
    const complaintId = complaintData.complaintId;
    console.log(`✅ Complaint Draft Initialized: HTTP 201`);
    console.log(`   Complaint Tracking ID: ${complaintId}`);
    console.log(`   Linked Case ID: ${complaintData.caseId}`);
    console.log(`   Initial Status: ${complaintData.status.toUpperCase()}`);
    console.log(`   Language: ${complaintData.language}`);
    console.log(`   Validation Readiness Score: ${draftRes.data.data.validation.readinessScore}/100\n`);

    // -------------------------------------------------------------
    // TEST 2: Verify English & Hindi Legal Suggestions
    // -------------------------------------------------------------
    console.log('📡 2. Verifying Bilingual AI Suggestions (English & Hindi)...');
    const suggestions = draftRes.data.data.aiDraftSuggestion;
    if (!suggestions || !suggestions.english || !suggestions.hindi) {
      throw new Error('Bilingual suggestions incomplete');
    }
    console.log(`✅ English Legal Draft Header:\n   "${suggestions.english.split('\n')[0]}"`);
    console.log(`✅ Hindi Legal Draft Header:\n   "${suggestions.hindi.split('\n')[0]}"\n`);

    // -------------------------------------------------------------
    // TEST 3: Section 63 BSA 2023 Electronic Evidence Certificate
    // -------------------------------------------------------------
    console.log('📡 3. Testing Section 63 BSA 2023 / 65B IEA Admissibility Certificate...');
    const cert = draftRes.data.data.bsaCertificate;
    if (!cert || !cert.certificateId) {
      throw new Error('BSA certificate not generated');
    }
    console.log(`✅ Certificate Generated: ${cert.certificateId}`);
    console.log(`   Hash Algorithm: ${cert.hashAlgorithm}`);
    console.log(`   Certifier Pseudonym: ${cert.certifierPseudonym}`);
    console.log(`   Declaration Length: ${cert.legalDeclaration.length} chars\n`);

    // -------------------------------------------------------------
    // TEST 4: Verification QR Code Generation
    // -------------------------------------------------------------
    console.log('📡 4. Verifying Cryptographic QR Code Generation...');
    if (!complaintData.verificationQrDataUrl || !complaintData.verificationQrDataUrl.startsWith('data:image/png;base64,')) {
      throw new Error('QR Code was not generated as DataURL');
    }
    console.log(`✅ High-Density Verification QR Code Verified (Data URL Length: ${complaintData.verificationQrDataUrl.length} bytes)\n`);

    // -------------------------------------------------------------
    // TEST 5: Submit Complaint to Authorities (Official Receipt)
    // -------------------------------------------------------------
    console.log('📡 5. Testing POST /api/justice/submit/:complaintId...');
    const submitRes = await postJSON(`/api/justice/submit/${complaintId}`, {}, userToken);
    if (submitRes.status !== 200) {
      throw new Error(`Submission failed with HTTP ${submitRes.status}: ${JSON.stringify(submitRes.data)}`);
    }

    console.log(`✅ Complaint Officially Submitted: HTTP 200`);
    console.log(`   Receipt Number: ${submitRes.data.data.acknowledgement?.receiptNumber}`);
    console.log(`   Assigned IO Officer Badge: #${submitRes.data.data.acknowledgement?.officerBadgeNumber}`);
    console.log(`   Intake Status: ${submitRes.data.data.status.toUpperCase()} -> ACKNOWLEDGED\n`);

    // -------------------------------------------------------------
    // TEST 6: Authority Status Update (Police / Legal Aid Review)
    // -------------------------------------------------------------
    console.log('📡 6. Testing PUT /api/justice/status/:complaintId (Authority Role)...');
    const updateRes = await putJSON(`/api/justice/status/${complaintId}`, {
      status: 'under_review',
      note: 'Assigned to Inspector Rajesh Sharma. CCTV footage request issued to DMRC.'
    }, policeToken);

    if (updateRes.status !== 200) {
      throw new Error(`Status update failed with HTTP ${updateRes.status}: ${JSON.stringify(updateRes.data)}`);
    }
    console.log(`✅ Authority Review Status Updated: HTTP 200`);
    console.log(`   New Status: ${updateRes.data.data.status.toUpperCase()}`);
    console.log(`   History Events Logged: ${updateRes.data.data.statusHistory?.length}\n`);

    // -------------------------------------------------------------
    // TEST 7: Fetch Complete Complaint Dossier
    // -------------------------------------------------------------
    console.log('📡 7. Testing GET /api/justice/complaint/:identifier...');
    const getRes = await getJSON(`/api/justice/complaint/${complaintId}`, userToken);
    if (getRes.status !== 200) {
      throw new Error(`Fetch failed with HTTP ${getRes.status}`);
    }
    console.log(`✅ Complete Complaint Dossier Retrieved: HTTP 200`);
    console.log(`   Complainant: ${getRes.data.data.complainantName} (${getRes.data.data.userPseudonym})`);
    console.log(`   Police Station: ${getRes.data.data.policeStation?.stationName}\n`);

    console.log('========================================================');
    console.log('🎉 ALL MODULE 4 (NIRBHAYA JUSTICE) TESTS PASSED (7/7)!');
    console.log('========================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Justice Test Suite Failed:', error.message);
    process.exit(1);
  }
};

runJusticeTests();

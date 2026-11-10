const http = require('http');
const { startServer, server } = require('../src/server');

const runCaseTests = async () => {
  console.log('🧪 Starting Proof-to-Justice Case Journey Test Suite...\n');
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
    // Authenticate
    const loginUser = await postJSON('/api/auth/login', {
      email: 'priya.sharma@nirbhayax.demo',
      password: 'Password123!'
    });
    const token = loginUser.data.token;
    console.log(`🔐 Authenticated User Priya Sharma for Case Journey Testing.\n`);

    // -------------------------------------------------------------
    // TEST 1: Create Case
    // -------------------------------------------------------------
    console.log('📡 1. Testing POST /api/cases/create...');
    const createRes = await postJSON('/api/cases/create', {
      title: 'Connaught Place Night Commute Incident'
    }, token);
    if (createRes.status !== 201) {
      throw new Error(`Create case failed: HTTP ${createRes.status}`);
    }
    const newCase = createRes.data.data;
    console.log(`✅ Case Created: HTTP 201`);
    console.log(`   Case ID: ${newCase.caseId}`);
    console.log(`   Current Stage: ${newCase.currentStage} (Protection Active)\n`);

    // -------------------------------------------------------------
    // TEST 2: Preload 1-Click Judge Demo Case
    // -------------------------------------------------------------
    console.log('📡 2. Testing POST /api/cases/judge-demo-seed...');
    const seedRes = await postJSON('/api/cases/judge-demo-seed', {}, token);
    if (seedRes.status !== 200) {
      throw new Error(`Judge demo seed failed: HTTP ${seedRes.status}`);
    }
    console.log(`✅ 1-Click Judge Demo Preloaded: HTTP 200`);
    console.log(`   Demo Case ID: ${seedRes.data.data.caseId}`);
    seedRes.data.data.stages.forEach(s => console.log(`   • ${s}`));
    console.log('');

    // -------------------------------------------------------------
    // TEST 3: Fetch Full 5-Stage Case Details
    // -------------------------------------------------------------
    console.log('📡 3. Testing GET /api/cases/:caseId (Aggregating all 5 modules)...');
    const detailsRes = await getJSON(`/api/cases/${seedRes.data.data.caseId}`, token);
    if (detailsRes.status !== 200) {
      throw new Error(`Details fetch failed: HTTP ${detailsRes.status}`);
    }
    const dossier = detailsRes.data.data;
    console.log(`✅ Complete 5-Stage Dossier Retrieved: HTTP 200`);
    console.log(`   Overall Progress: ${dossier.progress.progressPercentage}% (${dossier.progress.completedStagesCount}/5 Stages Complete)`);
    console.log(`   Stage 1 (SOS Protection): ${dossier.stage1_SOS?.status} (Session: ${dossier.stage1_SOS?.sessionId})`);
    console.log(`   Stage 2 (Evidence AI): ${dossier.stage2_EvidenceAI?.evidenceCount} items preserved`);
    console.log(`   Stage 3 (Vault Integrity): On-Chain Block #${dossier.stage3_VaultIntegrity?.blockHeight}`);
    console.log(`   Stage 4 (Justice Complaint): Receipt ${dossier.stage4_JusticeComplaint?.acknowledgementReceipt}`);
    console.log(`   Stage 5 (MediCare): MLC Case #${dossier.stage5_MediCare?.mlcCaseNumber}\n`);

    // -------------------------------------------------------------
    // TEST 4: Get All Cases
    // -------------------------------------------------------------
    console.log('📡 4. Testing GET /api/cases...');
    const listRes = await getJSON('/api/cases', token);
    if (listRes.status !== 200) {
      throw new Error(`List cases failed: HTTP ${listRes.status}`);
    }
    console.log(`✅ User Case Catalog Retrieved: HTTP 200 (${listRes.data.count} Cases Active)\n`);

    console.log('========================================================');
    console.log('🎉 ALL PROOF-TO-JUSTICE CASE JOURNEY TESTS PASSED (4/4)!');
    console.log('========================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Case Journey Test Suite Failed:', error.message);
    process.exit(1);
  }
};

runCaseTests();


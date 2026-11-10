const http = require('http');
const { startServer, server } = require('../src/server');

const runMedicareTests = async () => {
  console.log('🧪 Starting Module 5 (NIRBHAYA MEDICARE) Test Suite...\n');
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
    // Authenticate user Priya Sharma
    const loginUser = await postJSON('/api/auth/login', {
      email: 'priya.sharma@nirbhayax.demo',
      password: 'Password123!'
    });
    const token = loginUser.data.token;
    console.log(`🔐 Authenticated User Priya Sharma for MediCare Testing.\n`);

    // -------------------------------------------------------------
    // TEST 1: Nearby Facilities & Hospitals
    // -------------------------------------------------------------
    console.log('📡 1. Testing GET /api/medicare/facilities...');
    const facRes = await getJSON('/api/medicare/facilities?lat=28.6295&lng=77.2075', token);
    if (facRes.status !== 200 || !facRes.data.data.length) {
      throw new Error(`Facility search failed with HTTP ${facRes.status}`);
    }
    const facilities = facRes.data.data;
    console.log(`✅ Nearby Emergency Healthcare Facilities Retrieved: HTTP 200 (${facilities.length} Centers)`);
    console.log(`   Closest Facility: ${facilities[0].name} (${facilities[0].distanceKm} km away)`);
    console.log(`   Specialties: [${facilities[0].specialties.join(', ')}]\n`);

    // -------------------------------------------------------------
    // TEST 2: Encrypted Medical Locker
    // -------------------------------------------------------------
    console.log('📡 2. Testing GET /api/medicare/locker (AES-256-GCM)...');
    const lockerRes = await getJSON('/api/medicare/locker', token);
    if (lockerRes.status !== 200) {
      throw new Error(`Locker retrieval failed: HTTP ${lockerRes.status}`);
    }
    const lockerData = lockerRes.data.data;
    console.log(`✅ Medical Locker Retrieved & Decrypted: HTTP 200`);
    console.log(`   Blood Group: ${lockerData.profile.bloodGroup}`);
    console.log(`   Emergency Allergies: [${lockerData.profile.allergies.join(', ')}]`);
    console.log(`   MLC Case Number: ${lockerData.mlcCaseNumber}`);
    console.log(`   Encryption Layer: ${lockerData.encryption}\n`);

    // -------------------------------------------------------------
    // TEST 3: Update Encrypted Locker Profile
    // -------------------------------------------------------------
    console.log('📡 3. Testing PUT /api/medicare/locker...');
    const updateRes = await putJSON('/api/medicare/locker', {
      profile: {
        bloodGroup: 'B+',
        allergies: ['Penicillin', 'Sulfa Drugs', 'Iodine Contrast'],
        chronicConditions: ['Mild Asthma'],
        emergencyContactName: 'Aarti Sharma (Sister)',
        emergencyContactPhone: '+91 98112 23344'
      },
      mlcCaseNumber: 'MLC-AIIMS-2026-8812'
    }, token);
    if (updateRes.status !== 200) {
      throw new Error(`Locker update failed: HTTP ${updateRes.status}`);
    }
    console.log(`✅ Encrypted Medical Profile Updated: HTTP 200 (AES-256 Authenticated)\n`);

    // -------------------------------------------------------------
    // TEST 4: Log Medico-Legal Injury Documentation
    // -------------------------------------------------------------
    console.log('📡 4. Testing POST /api/medicare/injury (Trauma Documentation)...');
    const injuryRes = await postJSON('/api/medicare/injury', {
      bodyPart: 'Left Shoulder & Clavicle',
      injuryType: 'Blunt Force Contusion / Hematoma',
      severity: 'Moderate',
      notes: 'Tenderness on palpation sustained during struggle. X-ray recommended for fracture exclusion.'
    }, token);
    if (injuryRes.status !== 201) {
      throw new Error(`Injury logging failed: HTTP ${injuryRes.status}`);
    }
    console.log(`✅ Trauma Injury Documented: HTTP 201`);
    console.log(`   Injury ID: ${injuryRes.data.data.id}`);
    console.log(`   Site: ${injuryRes.data.data.bodyPart} (${injuryRes.data.data.injuryType})\n`);

    // -------------------------------------------------------------
    // TEST 5: Generate 24-Hour Doctor Emergency Pass
    // -------------------------------------------------------------
    console.log('📡 5. Testing POST /api/medicare/pass/create...');
    const passRes = await postJSON('/api/medicare/pass/create', {
      doctorName: 'Dr. Vivek Malhotra, CMO',
      hospitalName: 'Safdarjung Hospital Emergency Casualty'
    }, token);
    if (passRes.status !== 201) {
      throw new Error(`Pass creation failed: HTTP ${passRes.status}`);
    }
    const passData = passRes.data.data;
    const passCode = passData.passCode;
    console.log(`✅ 24-Hour Doctor Emergency Access Pass Created: HTTP 201`);
    console.log(`   Access Pass Code: ${passCode}`);
    console.log(`   Doctor: ${passData.doctorName} (${passData.hospitalName})`);
    console.log(`   Expires At: ${passData.expiresAt}\n`);

    // -------------------------------------------------------------
    // TEST 6: Doctor Verifies Emergency Pass (No Patient Login Required)
    // -------------------------------------------------------------
    console.log('📡 6. Testing GET /api/medicare/pass/verify/:passCode (Attending Physician)...');
    const verifyRes = await getJSON(`/api/medicare/pass/verify/${passCode}`);
    if (verifyRes.status !== 200) {
      throw new Error(`Pass verification failed: HTTP ${verifyRes.status}`);
    }
    console.log(`✅ Emergency Doctor Lookup Verified: HTTP 200`);
    console.log(`   Patient Pseudonym: ${verifyRes.data.data.patientPseudonym}`);
    console.log(`   Decrypted Blood Group: ${verifyRes.data.data.profile.bloodGroup}`);
    console.log(`   Allergies Flagged: [${verifyRes.data.data.profile.allergies.join(', ')}]\n`);

    // -------------------------------------------------------------
    // TEST 7: Instant Teleconsultation Session
    // -------------------------------------------------------------
    console.log('📡 7. Testing POST /api/medicare/teleconsult/start...');
    const teleRes = await postJSON('/api/medicare/teleconsult/start', {}, token);
    if (teleRes.status !== 200) {
      throw new Error(`Teleconsultation start failed: HTTP ${teleRes.status}`);
    }
    const teleData = teleRes.data.data;
    console.log(`✅ Teleconsultation Room Spawned: HTTP 200`);
    console.log(`   Session ID: ${teleData.sessionId}`);
    console.log(`   Physician: ${teleData.doctor.name} (${teleData.doctor.hospital})`);
    console.log(`   Status: ${teleData.doctor.status}\n`);

    console.log('========================================================');
    console.log('🎉 ALL MODULE 5 (NIRBHAYA MEDICARE) TESTS PASSED (7/7)!');
    console.log('========================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Medicare Test Suite Failed:', error.message);
    process.exit(1);
  }
};

runMedicareTests();


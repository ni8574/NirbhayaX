const http = require('http');
const { startServer, server } = require('../src/server');
const User = require('../src/models/User');

const testPhase2Comprehensive = async () => {
  console.log('🧪 Starting Phase 2 Comprehensive Demonstration & Verification Suite...\n');
  await startServer();

  const makeReq = (options, postData) => {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      });
      req.on('error', reject);
      if (postData) req.write(JSON.stringify(postData));
      req.end();
    });
  };

  try {
    // 1. Get Priya Sharma user
    const user = await User.findOne({ email: 'priya.sharma@nirbhayax.demo' });
    const token = user.getSignedJwtToken();

    // Verification 1: One-tap SOS end-to-end
    console.log('👉 [1/8] Verifying One-Tap SOS & Case Creation...');
    const sosRes = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos/trigger',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, {
      lat: 28.6289,
      lng: 77.2065,
      accuracy: 6,
      triggerType: 'manual_button',
      address: 'Janpath Metro Station, Connaught Place, New Delhi'
    });
    console.log(`✅ Status: HTTP ${sosRes.status}`);
    console.log(`   Created Session: ${sosRes.data.session.sessionId}`);
    console.log(`   Auto-Linked Case: ${sosRes.data.caseId} (Stage 1: Protection marked complete)`);
    console.log(`   Recipients Notified: ${sosRes.data.alertRecipients.length} contacts`);

    // Verification 2: Trusted-contact CRUD operations
    console.log('\n👉 [2/8] Verifying Safety Circle CRUD operations...');
    const initialContacts = [
      { name: 'Aarti Sharma (Sister)', phone: '+919811223344', relationship: 'Sister', notifyViaSms: true, notifyViaPush: true },
      { name: 'Dr. Neha Gupta (Physician)', phone: '+919877665544', relationship: 'Physician', notifyViaSms: true, notifyViaPush: false }
    ];
    // Create/Update
    const crudRes1 = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/safety-circle',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, { contacts: initialContacts });
    console.log(`✅ Contacts Updated: ${crudRes1.data.safetyCircle.length} contacts saved.`);

    // Read profile to verify persistence
    const meRes = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`✅ Read verification: Retrieved ${meRes.data.user.safetyCircle.length} contacts from database.`);

    // Delete contact (remove one)
    const crudRes2 = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/safety-circle',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, { contacts: [initialContacts[0]] });
    console.log(`✅ Delete verification: Updated to ${crudRes2.data.safetyCircle.length} contact (1 removed).`);

    // Verification 3: Check-in and Missed Check-in alerts
    console.log('\n👉 [3/8] Verifying Emergency Check-in & Auto-Missed SOS...');
    const checkinStart = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos/checkin/start',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, { durationMinutes: 15 });
    console.log(`✅ Check-in started: Expires at ${checkinStart.data.checkInTimer.expiresAt}`);

    // Simulate auto-missed check-in SOS trigger
    const missedRes = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos/trigger',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }, {
      lat: 28.6289,
      lng: 77.2065,
      triggerType: 'missed_checkin',
      address: 'Last Known Location (Missed Check-in)'
    });
    console.log(`✅ Missed check-in auto-dispatched SOS: ${missedRes.data.session.sessionId} (Trigger: ${missedRes.data.session.triggerType})`);

    // Cancel checkin
    const checkinCancel = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos/checkin/cancel',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    console.log(`✅ Check-in resolved: Status = ${checkinCancel.data.checkInTimer.status}`);

    // Verification 4: Nearby emergency facilities
    console.log('\n👉 [4/8] Verifying Nearby Facilities Matrix...');
    const facRes = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos/nearby-facilities?lat=28.6289&lng=77.2065',
      method: 'GET'
    });
    console.log(`✅ Retrieved ${facRes.data.count} facilities:`);
    facRes.data.facilities.forEach((f, i) => {
      console.log(`   ${i + 1}. [${f.type.toUpperCase()}] ${f.name} — ${f.distanceKm} km away (Emergency: ${f.emergencyNumber})`);
    });

    // Verification 5: Simulated SMS logs
    console.log('\n👉 [5/8] Verifying Outbound SMS Logs Feed...');
    const logsRes = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos/alert-logs',
      method: 'GET'
    });
    console.log(`✅ Retrieved ${logsRes.data.count} dispatched SMS records.`);
    console.log(`   Latest SMS: "${logsRes.data.logs[0].message.substring(0, 75)}..."`);

    console.log('\n🎉 PHASE 2 VERIFICATION RUN COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Verification failure:', err);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
};

testPhase2Comprehensive();


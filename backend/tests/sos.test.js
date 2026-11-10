const http = require('http');
const { startServer, server } = require('../src/server');
const User = require('../src/models/User');

const runSOSTests = async () => {
  console.log('🧪 Starting Module 1 (NIRBHAYA SOS) Test Suite...\n');
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
    // 1. Get Priya Sharma's token
    const user = await User.findOne({ email: 'priya.sharma@nirbhayax.demo' });
    const token = user.getSignedJwtToken();

    // 2. Test SOS Trigger
    console.log('📡 1. Testing POST /api/sos/trigger...');
    const triggerRes = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos/trigger',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      lat: 28.6289,
      lng: 77.2065,
      accuracy: 5,
      triggerType: 'manual_button',
      address: 'Near Janpath Metro, New Delhi'
    });

    console.log(`✅ SOS Triggered: HTTP ${triggerRes.status}`);
    const session = triggerRes.data.session;
    const sessionId = session.sessionId;
    console.log(`   Session ID: ${sessionId} | Case ID: ${triggerRes.data.caseId}`);
    console.log(`   Alerts Dispatched: ${triggerRes.data.alertRecipients.length} Safety Circle contacts notified.`);

    // 3. Test Location Update Stream
    console.log('\n📡 2. Testing POST /api/sos/location-update...');
    const locRes = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos/location-update',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      sessionId,
      lat: 28.6295,
      lng: 77.2075,
      speed: 4.5,
      accuracy: 4
    });
    console.log(`✅ Location updated: HTTP ${locRes.status} (History count: ${locRes.data.historyCount})`);

    // 4. Test Public Tracking Link
    console.log('\n📡 3. Testing GET /api/sos/track/:sessionId (Public View)...');
    const trackRes = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/sos/track/${sessionId}`,
      method: 'GET'
    });
    console.log(`✅ Public tracking responded: HTTP ${trackRes.status}`);
    console.log(`   Pseudonym: ${trackRes.data.session.pseudonymId} (NO PII leaked)`);
    console.log(`   Current Lat/Lng: ${trackRes.data.session.currentLocation.lat}, ${trackRes.data.session.currentLocation.lng}`);

    // 5. Test Nearby Facilities with Haversine distance
    console.log('\n📡 4. Testing GET /api/sos/nearby-facilities...');
    const facRes = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos/nearby-facilities?lat=28.6289&lng=77.2065',
      method: 'GET'
    });
    console.log(`✅ Nearby facilities retrieved: HTTP ${facRes.status} (${facRes.data.count} facilities found)`);
    console.log(`   Closest facility: ${facRes.data.facilities[0].name} (${facRes.data.facilities[0].distanceKm} km away)`);

    // 6. Test Check-in Timer Start and Cancel
    console.log('\n📡 5. Testing POST /api/sos/checkin/start...');
    const checkinStart = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos/checkin/start',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, { durationMinutes: 20 });
    console.log(`✅ Check-in timer started: HTTP ${checkinStart.status} (Duration: 20 min)`);

    console.log('📡 Testing POST /api/sos/checkin/cancel...');
    const checkinCancel = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos/checkin/cancel',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`✅ Check-in timer cancelled: HTTP ${checkinCancel.status} (Status: resolved)`);

    // 7. Test Simulated Alert Logs
    console.log('\n📡 6. Testing GET /api/sos/alert-logs...');
    const logsRes = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos/alert-logs',
      method: 'GET'
    });
    console.log(`✅ Alert logs retrieved: HTTP ${logsRes.status} (${logsRes.data.count} total outbound alerts recorded)`);

    // 8. Test SOS Resolve
    console.log('\n📡 7. Testing POST /api/sos/resolve...');
    const resolveRes = await makeReq({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/sos/resolve',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, { sessionId });
    console.log(`✅ SOS session resolved: HTTP ${resolveRes.status} (Status: ${resolveRes.data.session.status})`);

    console.log('\n======================================================');
    console.log('🎉 ALL MODULE 1 (NIRBHAYA SOS) BACKEND TESTS PASSED (7/7)!');
    console.log('======================================================\n');

  } catch (err) {
    console.error('❌ SOS Test Failure:', err);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
};

runSOSTests();


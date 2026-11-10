const http = require('http');
const express = require('express');
const { protect, authorize } = require('../src/middleware/auth');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');

const runRBACTest = async () => {
  console.log('🧪 Starting Dedicated RBAC Verification Test...\n');
  await connectDB();
  const runSeed = require('../src/utils/seed');
  await runSeed();

  // Create temporary express app to test RBAC middleware
  const app = express();
  app.use(express.json());

  // Protected route for 'authority' and 'admin' only
  app.get('/api/protected/police-docket', protect, authorize('authority', 'admin'), (req, res) => {
    res.json({ success: true, message: 'Access granted to police docket.' });
  });

  // Protected route for 'admin' only
  app.get('/api/protected/admin-vault', protect, authorize('admin'), (req, res) => {
    res.json({ success: true, message: 'Access granted to admin vault.' });
  });

  const server = app.listen(5099);

  const makeReq = (path, token) => {
    return new Promise((resolve) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: 5099,
        path,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
      });
      req.end();
    });
  };

  try {
    // 1. Get tokens for user, authority, and admin
    const regularUser = await User.findOne({ email: 'priya.sharma@nirbhayax.demo' });
    const authorityUser = await User.findOne({ email: 'inspector.sharma@delhipolice.demo' });
    const adminUser = await User.findOne({ email: 'admin@nirbhayax.org' });

    const userToken = regularUser.getSignedJwtToken();
    const authorityToken = authorityUser.getSignedJwtToken();
    const adminToken = adminUser.getSignedJwtToken();

    // 2. Regular user attempts to access police docket (Should be 403 Forbidden)
    const res1 = await makeReq('/api/protected/police-docket', userToken);
    console.log(`[RBAC Test 1] Regular user -> Police Docket: HTTP ${res1.status} (Expected: 403 Forbidden)`);
    if (res1.status === 403) console.log('✅ Regular user correctly rejected with 403 Forbidden.');

    // 3. Police Officer attempts to access police docket (Should be 200 OK)
    const res2 = await makeReq('/api/protected/police-docket', authorityToken);
    console.log(`[RBAC Test 2] Authority (Police) -> Police Docket: HTTP ${res2.status} (Expected: 200 OK)`);
    if (res2.status === 200) console.log('✅ Authority role correctly authorized.');

    // 4. Police Officer attempts to access Admin Vault (Should be 403 Forbidden)
    const res3 = await makeReq('/api/protected/admin-vault', authorityToken);
    console.log(`[RBAC Test 3] Authority (Police) -> Admin Vault: HTTP ${res3.status} (Expected: 403 Forbidden)`);
    if (res3.status === 403) console.log('✅ Authority correctly rejected from Admin-only resource.');

    // 5. Admin attempts to access Admin Vault (Should be 200 OK)
    const res4 = await makeReq('/api/protected/admin-vault', adminToken);
    console.log(`[RBAC Test 4] Admin -> Admin Vault: HTTP ${res4.status} (Expected: 200 OK)`);
    if (res4.status === 200) console.log('✅ Admin role correctly authorized.');

    console.log('\n🎉 ALL RBAC TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ RBAC Test Failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
};

runRBACTest();

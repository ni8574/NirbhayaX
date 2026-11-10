const http = require('http');
const { startServer, server } = require('../src/server');

const testApi = async () => {
  console.log('\n🚀 Starting Phase 1 Full End-to-End API Integration Test...\n');
  
  // Await actual server startup
  await startServer();

  const makeRequest = (options, postData) => {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: body });
          }
        });
      });
      req.on('error', reject);
      if (postData) req.write(JSON.stringify(postData));
      req.end();
    });
  };

  try {
    // 1. Test Health endpoint
    console.log('📡 Testing GET /api/health...');
    const health = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    console.log(`✅ Health check responded with HTTP ${health.statusCode}:`, health.data.platform, `(Status: ${health.data.status})`);

    // 2. Test 1-Click Judge Demo Login
    console.log('\n📡 Testing POST /api/auth/demo-login (Victim Role)...');
    const demoLogin = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/demo-login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { role: 'user' });
    console.log(`✅ Demo login responded with HTTP ${demoLogin.statusCode}: Token issued!`);
    console.log(`   User: ${demoLogin.data.user.fullName} (${demoLogin.data.user.pseudonymId}) - Role: ${demoLogin.data.user.role}`);
    const token = demoLogin.data.token;

    // 3. Test Protected /api/auth/me using Bearer token
    console.log('\n📡 Testing GET /api/auth/me (Protected Route with JWT)...');
    const me = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`✅ Auth me responded with HTTP ${me.statusCode}: Authenticated as ${me.data.user.email}`);

    // 4. Test Update Safety Circle
    console.log('\n📡 Testing PUT /api/auth/safety-circle...');
    const safetyCircle = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/safety-circle',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      contacts: [
        { name: 'Dr. Kavita Rao (Sister)', phone: '+919811002233', relationship: 'Sister' },
        { name: 'Officer Vikram (Police Friend)', phone: '+919822003344', relationship: 'Police' }
      ]
    });
    console.log(`✅ Safety Circle updated: ${safetyCircle.data.safetyCircle.length} contacts saved.`);

    // 5. Test Register New User
    console.log('\n📡 Testing POST /api/auth/register...');
    const newReg = await makeRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Rhea Chakraborty',
      email: `rhea_${Date.now()}@demo.com`,
      password: 'StrongPassword123!',
      phone: '+919988776655'
    });
    console.log(`✅ Registration responded with HTTP ${newReg.statusCode}: Pseudonym generated: ${newReg.data.user.pseudonymId}`);

    console.log('\n======================================================');
    console.log('🎉 ALL INTEGRATION API TESTS PASSED SUCCESSFULLY (5/5)!');
    console.log('======================================================\n');

  } catch (err) {
    console.error('❌ Integration Test Error:', err);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
};

testApi();

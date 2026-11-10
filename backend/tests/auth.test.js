/**
 * Automated test suite for Phase 1 Authentication & Database
 */
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

const runTests = async () => {
  console.log('🧪 Starting Phase 1 Authentication & DB Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  try {
    // 1. Test DB Connection
    await connectDB();
    console.log('✅ Test 1: Database connected successfully.');
    passed++;

    // 2. Clean previous test user if any
    const testEmail = `test_${Date.now()}@nirbhayax.demo`;
    await User.deleteOne({ email: testEmail });

    // 3. Test User Registration & Password Hashing
    const user = await User.create({
      fullName: 'Test User Ananya',
      email: testEmail,
      password: 'SecurePassword123!',
      role: 'user'
    });

    if (user.pseudonymId && user.pseudonymId.startsWith('NX-')) {
      console.log(`✅ Test 2: User registered with pseudonymous ID: ${user.pseudonymId}`);
      passed++;
    } else {
      console.error('❌ Test 2 Failed: Pseudonym ID not generated');
      failed++;
    }

    // 4. Test Password Hashing
    const rawUser = await User.findById(user._id).select('+password');
    if (rawUser.password !== 'SecurePassword123!' && rawUser.password.startsWith('$2')) {
      console.log('✅ Test 3: Password successfully hashed with bcrypt.');
      passed++;
    } else {
      console.error('❌ Test 3 Failed: Password was stored in plaintext!');
      failed++;
    }

    // 5. Test Password Verification
    const isCorrectPassword = await rawUser.matchPassword('SecurePassword123!');
    const isWrongPassword = await rawUser.matchPassword('WrongPassword!');
    if (isCorrectPassword && !isWrongPassword) {
      console.log('✅ Test 4: Password verification correctly validates credentials.');
      passed++;
    } else {
      console.error('❌ Test 4 Failed: Password match failed.');
      failed++;
    }

    // 6. Test JWT Generation & Verification
    const token = rawUser.getSignedJwtToken();
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.id.toString() === user._id.toString() && decoded.role === 'user') {
      console.log('✅ Test 5: JWT signed and decoded with valid claims & role.');
      passed++;
    } else {
      console.error('❌ Test 5 Failed: JWT verification mismatch.');
      failed++;
    }

    // Clean up test user
    await User.deleteOne({ _id: user._id });
    console.log('\n🧹 Cleaned up test user.');

  } catch (err) {
    console.error('❌ Test Suite Error:', err.message);
    failed++;
  } finally {
    await disconnectDB();
  }

  console.log(`\n================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
};

runTests();


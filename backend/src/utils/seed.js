const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

const seedUsers = [
  {
    fullName: 'Priya Sharma',
    email: 'priya.sharma@nirbhayax.demo',
    password: 'Password123!',
    phone: '+919876543210',
    role: 'user',
    languagePreference: 'en',
    safetyCircle: [
      {
        name: 'Aarti Sharma (Sister)',
        phone: '+919811223344',
        email: 'aarti.sharma@demo.com',
        relationship: 'Sister',
        notifyViaSms: true,
        notifyViaPush: true
      },
      {
        name: 'Sunil Verma (Colleague)',
        phone: '+919822334455',
        email: 'sunil.verma@demo.com',
        relationship: 'Colleague',
        notifyViaSms: true,
        notifyViaPush: true
      },
      {
        name: 'Devi Lal (Neighbor)',
        phone: '+919833445566',
        email: 'devi.lal@demo.com',
        relationship: 'Neighbor',
        notifyViaSms: true,
        notifyViaPush: true
      }
    ]
  },
  {
    fullName: 'Inspector Rajesh Sharma',
    email: 'inspector.sharma@delhipolice.demo',
    password: 'Password123!',
    phone: '+919844556677',
    role: 'authority',
    languagePreference: 'en'
  },
  {
    fullName: 'Advocate Meera Sen (Legal Aid)',
    email: 'meera.sen@legalaid.demo',
    password: 'Password123!',
    phone: '+919855667788',
    role: 'authority',
    languagePreference: 'en'
  },
  {
    fullName: 'Nirbhaya X Admin',
    email: 'admin@nirbhayax.org',
    password: 'AdminPassword123!',
    phone: '+919899001122',
    role: 'admin',
    languagePreference: 'en'
  }
];

const runSeed = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    for (const userData of seedUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        await User.create(userData);
        console.log(`[Seed] Created account: ${userData.fullName} (${userData.role}) - ${userData.email}`);
      } else {
        console.log(`[Seed] Account already exists: ${userData.email}`);
      }
    }

    console.log('[Seed] Seeding completed successfully!');
  } catch (err) {
    console.error('[Seed Error]:', err);
  }
};

// If run directly via command line
if (require.main === module) {
  runSeed().then(async () => {
    await disconnectDB();
    process.exit(0);
  });
}

module.exports = runSeed;


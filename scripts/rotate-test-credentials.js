const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env if present
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const BUYER_EMAIL = process.env.TEST_BUYER_EMAIL || 'e2e_buyer@resellhub.test';
const SELLER_EMAIL = process.env.TEST_SELLER_EMAIL || 'e2e_seller@resellhub.test';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'e2e_admin@resellhub.test';
const NEW_PASSWORD = process.env.TEST_ACCOUNT_PASSWORD;

if (!NEW_PASSWORD) {
  console.error('ERROR: TEST_ACCOUNT_PASSWORD environment variable is required.');
  process.exit(1);
}

const BASE_URL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

async function rotateCredentials() {
  console.log('Connecting to database...');
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.AUTH_DB_NAME || 'resell_hub');

  const testEmails = [BUYER_EMAIL, SELLER_EMAIL, ADMIN_EMAIL];
  console.log('Target test accounts to rotate:', testEmails);

  // 1. Find existing user IDs
  const existingUsers = await db.collection('user').find({ email: { $in: testEmails } }).toArray();
  const userIds = existingUsers.map(u => u._id.toString());
  console.log(`Found ${existingUsers.length} existing test users in database.`);

  // 2. Remove old session and account records
  if (userIds.length > 0) {
    const deletedSessions = await db.collection('session').deleteMany({ userId: { $in: userIds } });
    const deletedAccounts = await db.collection('account').deleteMany({ userId: { $in: userIds } });
    const deletedUsers = await db.collection('user').deleteMany({ _id: { $in: existingUsers.map(u => u._id) } });
    console.log(`Purged old auth records: ${deletedUsers.deletedCount} users, ${deletedAccounts.deletedCount} accounts, ${deletedSessions.deletedCount} sessions.`);
  }

  // 3. Register each account with the new rotated password
  const accountsToRegister = [
    { email: BUYER_EMAIL, name: 'E2E Test Buyer', role: 'buyer' },
    { email: SELLER_EMAIL, name: 'E2E Test Seller', role: 'seller' },
    { email: ADMIN_EMAIL, name: 'E2E Test Admin', role: 'admin' },
  ];

  for (const acc of accountsToRegister) {
    console.log(`Registering ${acc.email} with rotated password...`);
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': BASE_URL },
      body: JSON.stringify({
        email: acc.email,
        password: NEW_PASSWORD,
        name: acc.name,
        role: acc.role,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to register ${acc.email}: HTTP ${res.status} - ${errText}`);
    }
    console.log(`  -> Successfully registered ${acc.email}`);
  }

  // 4. Update roles in DB
  await db.collection('user').updateOne({ email: ADMIN_EMAIL }, { $set: { role: 'admin' } });
  await db.collection('user').updateOne({ email: SELLER_EMAIL }, { $set: { role: 'seller' } });
  await db.collection('user').updateOne({ email: BUYER_EMAIL }, { $set: { role: 'buyer' } });
  console.log('Roles verified and updated in user collection.');

  // 5. Verification tests
  console.log('Verifying credential rotation...');

  // A. Verify login with NEW password
  for (const acc of accountsToRegister) {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': BASE_URL },
      body: JSON.stringify({
        email: acc.email,
        password: NEW_PASSWORD,
      }),
    });
    if (!res.ok) {
      throw new Error(`Verification FAILED: Could not log in as ${acc.email} with NEW password.`);
    }
    console.log(`  [VERIFIED] ${acc.email} successfully logged in with rotated credentials.`);
  }

  // B. Verify login with OLD exposed password is REJECTED
  for (const acc of accountsToRegister) {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': BASE_URL },
      body: JSON.stringify({
        email: acc.email,
        password: 'Password123!',
      }),
    });
    if (res.ok) {
      throw new Error(`SECURITY ALERT: Old password 'Password123!' still accepted for ${acc.email}!`);
    }
    console.log(`  [VERIFIED] ${acc.email} correctly rejected old exposed password (HTTP ${res.status}).`);
  }

  await client.close();
  console.log('\n*** CREDENTIAL ROTATION COMPLETED AND VERIFIED SUCCESSFULLY ***');
}

rotateCredentials().catch((err) => {
  console.error('Credential rotation failed:', err);
  process.exit(1);
});

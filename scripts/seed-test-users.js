const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Auto-load .env for standalone node runs
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
const TEST_PASSWORD = process.env.TEST_ACCOUNT_PASSWORD;

if (!TEST_PASSWORD) {
  console.error('ERROR: TEST_ACCOUNT_PASSWORD environment variable is required.');
  process.exit(1);
}

const BASE_URL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

async function seed() {
  // Sign up seller
  let res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': BASE_URL },
    body: JSON.stringify({
      email: SELLER_EMAIL,
      password: TEST_PASSWORD,
      name: 'E2E Test Seller',
      role: 'seller'
    })
  });
  console.log('Seller signup:', res.status);

  // Sign up admin
  res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': BASE_URL },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: TEST_PASSWORD,
      name: 'E2E Test Admin',
      role: 'admin'
    })
  });
  console.log('Admin signup:', res.status);

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.AUTH_DB_NAME || 'resell_hub');
  await db.collection('user').updateOne({ email: ADMIN_EMAIL }, { $set: { role: 'admin' } });
  await db.collection('user').updateOne({ email: SELLER_EMAIL }, { $set: { role: 'seller' } });
  
  const testUsers = await db.collection('user').find({
    email: { $in: [BUYER_EMAIL, SELLER_EMAIL, ADMIN_EMAIL] }
  }).project({ email: 1, role: 1, name: 1, status: 1 }).toArray();
  console.log('Test users in DB:', testUsers);
  await client.close();
}

seed().catch(console.error);

const { MongoClient } = require('mongodb');

async function seed() {
  // Sign up seller
  let res = await fetch('http://localhost:3000/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({
      email: 'e2e_seller@resellhub.test',
      password: 'Password123!',
      name: 'E2E Test Seller',
      role: 'seller'
    })
  });
  console.log('Seller signup:', res.status);

  // Sign up admin
  res = await fetch('http://localhost:3000/api/auth/sign-up/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({
      email: 'e2e_admin@resellhub.test',
      password: 'Password123!',
      name: 'E2E Test Admin',
      role: 'admin'
    })
  });
  console.log('Admin signup:', res.status);

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.AUTH_DB_NAME || 'resell_hub');
  await db.collection('user').updateOne({ email: 'e2e_admin@resellhub.test' }, { $set: { role: 'admin' } });
  await db.collection('user').updateOne({ email: 'e2e_seller@resellhub.test' }, { $set: { role: 'seller' } });
  
  const testUsers = await db.collection('user').find({
    email: { $in: ['e2e_buyer@resellhub.test', 'e2e_seller@resellhub.test', 'e2e_admin@resellhub.test'] }
  }).project({ email: 1, role: 1, name: 1, status: 1 }).toArray();
  console.log('Test users in DB:', testUsers);
  await client.close();
}

seed().catch(console.error);

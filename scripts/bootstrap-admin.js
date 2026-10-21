import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.AUTH_DB_NAME || "resell_hub";
const targetEmail = process.argv[2]?.trim().toLowerCase();

if (!targetEmail) {
  console.error("Usage: node scripts/bootstrap-admin.js <user-email>");
  process.exit(1);
}

if (!uri) {
  console.error("Error: MONGODB_URI is not set in environment or .env file.");
  process.exit(1);
}

async function bootstrapAdmin() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("user");

    const user = await usersCollection.findOne({ email: targetEmail });

    if (!user) {
      console.error(
        `Error: No user found with email "${targetEmail}".\nPlease register an account via /auth/register first, then re-run this script.`
      );
      process.exit(1);
    }

    const result = await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          role: "admin",
          status: "active",
          updatedAt: new Date(),
        },
      }
    );

    console.log(
      `Success: User "${targetEmail}" (ID: ${user._id}) has been promoted to "admin".`
    );
    console.log("Note: If the user is currently logged in, they must re-login to obtain an updated JWT with role: 'admin'.");
  } catch (error) {
    console.error("Failed to bootstrap admin user:", error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

bootstrapAdmin();

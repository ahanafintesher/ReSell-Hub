import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please add your MONGODB_URI to .env");
}

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

const mongoClient = await clientPromise;
const db = mongoClient.db(process.env.AUTH_DB_NAME || "resell_hub");

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL?.trim() || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
  database: mongodbAdapter(db, {
    client: mongoClient,
  }),
  session: {
    cookieCache: {
      enabled: true,
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
  },
  user: {
    additionalFields: {
      location: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        default: "buyer",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Prevent arbitrary client self-assignment of admin role
          const role = user.role === "seller" ? "seller" : "buyer";
          return {
            data: {
              ...user,
              role,
            },
          };
        },
      },
      update: {
        before: async (user) => {
          // Prevent client self-promotion to admin via updateUser
          if (user.role && user.role === "admin") {
            delete user.role;
          }
          return {
            data: user,
          };
        },
      },
    },
  },
  plugins: [
    jwt({
      jwt: {
        issuer: (process.env.BETTER_AUTH_URL?.trim() || "http://localhost:3000").replace(/\/$/, ""),
        audience: (process.env.BETTER_AUTH_URL?.trim() || "http://localhost:3000").replace(/\/$/, ""),
      },
    }),
  ],
});
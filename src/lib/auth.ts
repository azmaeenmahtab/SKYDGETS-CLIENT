import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db('skydgets');

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
      },
    },
  },
  plugins: [
    jwt({
      jwt: {
        expirationTime: "1h",
        // Explicitly embed `role` into the JWT payload so the Express backend
        // can read it via `payload.role` in verifyJWT middleware.
        definePayload: ({ user }) => ({
          role: (user as any).role ?? "customer",
        }),
      },
    }),
  ],
});

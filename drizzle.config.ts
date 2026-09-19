import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * Works locally (reads .env) AND in production deploys:
 *   DATABASE_URL="postgresql://...neon.tech/db" npx drizzle-kit push
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});

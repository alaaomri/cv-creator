import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 moved the datasource URL out of schema.prisma into this file.
// The CLI (migrate / db push) uses this connection — point it at the direct
// PostgreSQL connection (port 5432). Falls back to DATABASE_URL if DIRECT_URL
// is not set. The runtime client uses the pooler URL via the driver adapter
// (see server/db.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL") ?? env("DATABASE_URL"),
  },
});

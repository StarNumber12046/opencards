import { type Config } from "drizzle-kit";

import { env } from "~/env";
export default {
  schema: "./src/server/db/schema.ts",
  dialect: "turso",
  out: "/migrations",
  dbCredentials: {
    url: env.TURSO_CONNECTION_URL as string,
    authToken: env.TURSO_AUTH_TOKEN as string,
  },
  tablesFilter: ["opencards_*"],
} satisfies Config;

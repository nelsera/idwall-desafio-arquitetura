import { Pool } from "pg";

export const postgresPool = new Pool({
  host: process.env.POSTGRES_HOST ?? "postgres",
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  user: process.env.POSTGRES_USER ?? "postgres",
  password: process.env.POSTGRES_PASSWORD ?? "postgres",
  database: process.env.POSTGRES_DB ?? "recommendations",
});
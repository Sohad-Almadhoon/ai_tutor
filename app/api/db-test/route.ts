import { neon } from "@neondatabase/serverless";

export async function GET() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  const sql = neon(connectionString);
  const result = await sql`SELECT NOW() AS time`;

  return Response.json(result);
}
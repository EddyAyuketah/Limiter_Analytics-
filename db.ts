import * as sql from "mssql"

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST || "",
  port: Number.parseInt(process.env.DB_PORT || "3181", 10),
  options: {
    encrypt: process.env.DB_SSL === "true",
    trustServerCertificate: true, // Change to false for production
  },
}

async function query<T>(sqlQuery: string, params: any[] = []): Promise<T[]> {
  try {
    await sql.connect(config)
    const result = await sql.query(sqlQuery)
    return result.recordset
  } catch (err) {
    console.error("Database query error:", err)
    throw err
  } finally {
    await sql.close()
  }
}

module.exports = { query }


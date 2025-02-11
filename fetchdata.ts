import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../lib/db";
import type { ToolData } from "../../types/tool";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const results = await query<ToolData>(`
      SELECT 
        CEID,
        (SELECT 
            SUM(CASE WHEN LAST_UPDATE_DATE >= DATEADD(DAY, -3, GETDATE()) THEN 1 ELSE 0 END) AS [D3],
            SUM(CASE WHEN LAST_UPDATE_DATE >= DATEADD(DAY, -7, GETDATE()) THEN 1 ELSE 0 END) AS [D7],
            SUM(CASE WHEN LAST_UPDATE_DATE >= DATEADD(DAY, -14, GETDATE()) THEN 1 ELSE 0 END) AS [D14],
            SUM(CASE WHEN LAST_UPDATE_DATE >= DATEADD(DAY, -21, GETDATE()) THEN 1 ELSE 0 END) AS [D21],
            SUM(CASE WHEN LAST_UPDATE_DATE >= DATEADD(DAY, -28, GETDATE()) THEN 1 ELSE 0 END) AS [D28],
            SUM(CASE WHEN LAST_UPDATE_DATE >= DATEADD(DAY, -35, GETDATE()) THEN 1 ELSE 0 END) AS [D35],
            SUM(CASE WHEN LAST_UPDATE_DATE >= DATEADD(DAY, -42, GETDATE()) THEN 1 ELSE 0 END) AS [D42],
            SUM(CASE WHEN LAST_UPDATE_DATE >= DATEADD(DAY, -49, GETDATE()) THEN 1 ELSE 0 END) AS [D49],
            SUM(CASE WHEN LAST_UPDATE_DATE >= DATEADD(DAY, -56, GETDATE()) THEN 1 ELSE 0 END) AS [D56],
            SUM(CASE WHEN LAST_UPDATE_DATE >= DATEADD(DAY, -63, GETDATE()) THEN 1 ELSE 0 END) AS [D63],
            SUM(CASE WHEN LAST_UPDATE_DATE >= DATEADD(DAY, -70, GETDATE()) THEN 1 ELSE 0 END) AS [D70],
            SUM(CASE WHEN LAST_UPDATE_DATE >= DATEADD(DAY, -77, GETDATE()) THEN 1 ELSE 0 END) AS [D77],
            SUM(CASE WHEN LAST_UPDATE_DATE >= DATEADD(DAY, -84, GETDATE()) THEN 1 ELSE 0 END) AS [D84],
            SUM(CASE WHEN LAST_UPDATE_DATE >= DATEADD(DAY, -91, GETDATE()) THEN 1 ELSE 0 END) AS [D91]
          FOR JSON PATH, WITHOUT_ARRAY_WRAPPER) AS limitations
      FROM dbo.F_ME_SKYNET
      WHERE REPORT_NAME = 'COS_DB_PRIORITY'
        AND LAST_UPDATE_USER = 'ABA_Update'
        AND OF3 = 'ABA Limiter'
        AND PROCESS = 1274
        AND LAST_UPDATE_DATE >= DATEADD(DAY, -91, GETDATE())
      GROUP BY CEID
      ORDER BY CEID DESC;
    `);

    const formattedResults = results.map((result) => ({
      ...result,
      limitations: JSON.parse(result.limitations),
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({
      error: "Failed to fetch data from the database",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

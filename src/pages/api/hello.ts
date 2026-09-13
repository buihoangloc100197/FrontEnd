import type { NextApiRequest, NextApiResponse } from "next";
import { appConfig } from "@/lib/env";
import db, { getDatabaseStatus, insertLog } from "@/lib/db";

type ResponseData = {
  message: string;
  status: string;
  database: string;
  databasePath: string;
  tableCount: number;
  timestamp: string;
  env: {
    appName: string;
    baseUrl: string;
    apiKeySet: boolean;
  };
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const databaseStatus = getDatabaseStatus();
  const totalRow = db
    .prepare("SELECT COUNT(*) AS total FROM settings")
    .get() as { total: number } | undefined;
  const tableCount = Number(totalRow?.total ?? 0);

  insertLog(`API request at ${new Date().toISOString()}`);

  res.status(200).json({
    message: `Xin chào từ ${appConfig.appName}`,
    status: "ok",
    database: "sqlite",
    databasePath: databaseStatus.path,
    tableCount,
    timestamp: new Date().toISOString(),
    env: {
      appName: appConfig.appName,
      baseUrl: appConfig.apiBaseUrl,
      apiKeySet: Boolean(appConfig.apiKey && appConfig.apiKey !== "demo-api-key"),
    },
  });
}

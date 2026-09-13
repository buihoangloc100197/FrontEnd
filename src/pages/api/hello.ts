import type { NextApiRequest, NextApiResponse } from "next";
import { appConfig } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Phương thức không hợp lệ",
      status: "error",
      database: "supabase",
      databasePath: "supabase",
      tableCount: 0,
      timestamp: new Date().toISOString(),
      env: {
        appName: appConfig.appName,
        baseUrl: appConfig.apiBaseUrl,
        apiKeySet: Boolean(appConfig.apiKey && appConfig.apiKey !== "demo-api-key"),
      },
    });
  }

  const tableCount = supabaseAdmin
    ? await supabaseAdmin
        .from("users")
        .select("id", { count: "exact", head: true })
        .then(({ count, error }) => (error ? 0 : Number(count ?? 0)))
    : 0;

  return res.status(200).json({
    message: `Xin chào từ ${appConfig.appName}`,
    status: "ok",
    database: supabaseAdmin ? "supabase" : "not_configured",
    databasePath: "supabase",
    tableCount,
    timestamp: new Date().toISOString(),
    env: {
      appName: appConfig.appName,
      baseUrl: appConfig.apiBaseUrl,
      apiKeySet: Boolean(appConfig.apiKey && appConfig.apiKey !== "demo-api-key"),
    },
  });
}

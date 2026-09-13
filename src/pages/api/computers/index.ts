import type { NextApiRequest, NextApiResponse } from "next";
import { demoComputers } from "@/lib/demoData";
import { normalizeComputerList } from "@/lib/computers";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({
      message: "Supabase chưa được cấu hình",
      computers: normalizeComputerList(demoComputers),
      total: normalizeComputerList(demoComputers).length,
      fallback: true,
    });
  }

  const { data: computers, error } = await supabaseAdmin
    .from("computers")
    .select("id, name, room, specs, status, created_at")
    .order("id", { ascending: true });

  if (error) {
    const normalizedFallback = normalizeComputerList(demoComputers);
    return res.status(200).json({
      computers: normalizedFallback,
      total: normalizedFallback.length,
      fallback: true,
      message: "Supabase chưa có dữ liệu, đang hiển thị dữ liệu demo để hệ thống vẫn chạy",
    });
  }

  const normalizedComputers = normalizeComputerList(computers ?? []);

  return res.status(200).json({
    computers: normalizedComputers,
    total: normalizedComputers.length,
    fallback: false,
  });
}

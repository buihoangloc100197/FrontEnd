import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ message: "Supabase chưa được cấu hình" });
  }

  const { data: computers, error } = await supabaseAdmin
    .from("computers")
    .select("id, name, room, specs, status, created_at")
    .order("id", { ascending: true });

  if (error) {
    return res.status(500).json({ message: error.message || "Không thể lấy danh sách máy tính" });
  }

  return res.status(200).json({
    computers: (computers ?? []).map((computer) => ({
      id: computer.id,
      name: computer.name,
      room: computer.room,
      specs: computer.specs,
      status: computer.status,
      created_at: computer.created_at,
    })),
  });
}

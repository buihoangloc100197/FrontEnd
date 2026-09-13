import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/auth";
import { normalizeComputerRecord } from "@/lib/computers";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  const name = String(req.body?.name ?? "").trim();
  const room = String(req.body?.room ?? "").trim();
  const specs = String(req.body?.specs ?? "").trim() || null;
  const status = String(req.body?.status ?? "available").trim() || "available";

  if (!name || !room) {
    return res.status(400).json({
      message: "Tên máy và phòng là bắt buộc",
    });
  }

  const normalizedStatus = ["available", "in_use", "maintenance", "pending"].includes(status)
    ? status
    : "available";

  if (!supabaseAdmin) {
    return res.status(500).json({ message: "Supabase chưa được cấu hình" });
  }

  const { data: existingComputer, error: existingError } = await supabaseAdmin
    .from("computers")
    .select("id")
    .eq("name", name)
    .eq("room", room)
    .maybeSingle();

  if (existingError) {
    return res.status(500).json({ message: existingError.message || "Không thể kiểm tra máy tính" });
  }

  if (existingComputer) {
    return res.status(409).json({
      message: "Máy này đã tồn tại trong hệ thống. Vui lòng giữ lại một bản duy nhất.",
    });
  }

  const { data: created, error } = await supabaseAdmin
    .from("computers")
    .insert({
      name,
      room,
      specs,
      status: normalizedStatus,
    })
    .select("id, name, room, specs, status, created_at")
    .single();

  if (error || !created) {
    return res.status(500).json({ message: error?.message || "Thêm máy tính thất bại" });
  }

  const normalizedComputer = normalizeComputerRecord(created);

  return res.status(201).json({
    message: "Thêm máy tính thành công",
    computer: normalizedComputer,
  });
}

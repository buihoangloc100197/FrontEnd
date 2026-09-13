import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/auth";
import { normalizeComputerRecord } from "@/lib/computers";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const idParam = req.query.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID máy tính không hợp lệ" });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ message: "Supabase chưa được cấu hình" });
  }

  if (req.method === "GET") {
    const { data: computer, error } = await supabaseAdmin
      .from("computers")
      .select("id, name, room, specs, status, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error || !computer) {
      return res.status(404).json({ message: "Không tìm thấy máy tính" });
    }

    const normalizedComputer = normalizeComputerRecord(computer);
    return res.status(200).json({ computer: normalizedComputer });
  }

  if (req.method !== "PUT" && req.method !== "PATCH") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  const name = String(req.body?.name ?? "").trim();
  const room = String(req.body?.room ?? "").trim();
  const specs = String(req.body?.specs ?? "").trim() || null;
  const status = String(req.body?.status ?? "available").trim() || "available";

  const { data: existing } = await supabaseAdmin
    .from("computers")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy máy tính để cập nhật" });
  }

  if (!name || !room) {
    return res.status(400).json({
      message: "Tên máy và phòng là bắt buộc",
    });
  }

  const normalizedStatus = ["available", "in_use", "maintenance"].includes(status)
    ? status
    : "available";

  const { data: updated, error } = await supabaseAdmin
    .from("computers")
    .update({
      name,
      room,
      specs,
      status: normalizedStatus,
    })
    .eq("id", id)
    .select("id, name, room, specs, status, created_at")
    .single();

  if (error || !updated) {
    return res.status(500).json({ message: error?.message || "Cập nhật máy tính thất bại" });
  }

  const normalizedComputer = normalizeComputerRecord(updated);

  return res.status(200).json({
    message: "Cập nhật máy tính thành công",
    computer: normalizedComputer,
  });
}

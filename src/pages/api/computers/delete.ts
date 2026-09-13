import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ message: "Supabase chưa được cấu hình" });
  }

  const idParam = req.body?.id ?? req.query.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID máy tính không hợp lệ" });
  }

  const { data: existing, error: checkError } = await supabaseAdmin
    .from("computers")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (checkError) {
    return res.status(500).json({ message: checkError.message || "Không thể kiểm tra máy tính" });
  }

  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy máy tính để xóa" });
  }

  const { error } = await supabaseAdmin.from("computers").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ message: error.message || "Xóa máy tính thất bại" });
  }

  return res.status(200).json({
    message: "Xóa máy tính thành công",
    deletedId: id,
  });
}

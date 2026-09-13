import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ message: "Supabase chưa được cấu hình" });
  }

  const idParam = req.body?.id ?? req.query.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID yêu cầu không hợp lệ" });
  }

  const { data: existing, error: checkError } = await supabaseAdmin
    .from("borrow_requests")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (checkError) {
    return res.status(500).json({ message: checkError.message || "Không thể kiểm tra yêu cầu" });
  }

  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy yêu cầu để xóa" });
  }

  const { error } = await supabaseAdmin.from("borrow_requests").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ message: error.message || "Xóa yêu cầu thất bại" });
  }

  return res.status(200).json({
    message: "Xóa yêu cầu thành công",
    deletedId: id,
  });
}

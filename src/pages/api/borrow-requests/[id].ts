import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ message: "Supabase chưa được cấu hình" });
  }

  const idParam = req.query.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID yêu cầu không hợp lệ" });
  }

  const { data: request, error } = await supabaseAdmin
    .from("borrow_requests")
    .select("id, computer_id, borrower_id, reason, status, requested_at, approved_by, approved_at, returned_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !request) {
    return res.status(404).json({ message: "Không tìm thấy yêu cầu mượn máy" });
  }

  return res.status(200).json({ request });
}

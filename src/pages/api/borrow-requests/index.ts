import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ message: "Supabase chưa được cấu hình" });
  }

  const { data: requests, error } = await supabaseAdmin
    .from("borrow_requests")
    .select("id, computer_id, borrower_id, reason, status, requested_at, approved_by, approved_at, returned_at, users:borrower_id ( full_name, username )")
    .order("requested_at", { ascending: false });

  if (error) {
    return res.status(500).json({ message: error.message || "Không thể lấy danh sách yêu cầu" });
  }

  return res.status(200).json({
    requests: (requests ?? []).map((item: any) => ({
      id: item.id,
      computer_id: item.computer_id,
      borrower_id: item.borrower_id,
      reason: item.reason,
      status: item.status,
      requested_at: item.requested_at,
      approved_by: item.approved_by,
      approved_at: item.approved_at,
      returned_at: item.returned_at,
      borrower_name: item.users?.full_name ?? null,
      borrower_username: item.users?.username ?? null,
    })),
  });
}

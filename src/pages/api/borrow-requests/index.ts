import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  const requests = db
    .prepare(
      `SELECT 
        br.id,
        br.computer_id,
        br.borrower_id,
        br.reason,
        br.status,
        br.requested_at,
        br.approved_by,
        br.approved_at,
        br.returned_at,
        u.full_name AS borrower_name,
        u.username AS borrower_username
      FROM borrow_requests br
      LEFT JOIN users u ON u.id = br.borrower_id
      ORDER BY br.requested_at DESC`,
    )
    .all() as Array<{
      id: number;
      computer_id: number;
      borrower_id: number;
      reason: string | null;
      status: string;
      requested_at: string;
      approved_by: number | null;
      approved_at: string | null;
      returned_at: string | null;
      borrower_name: string | null;
      borrower_username: string | null;
    }>;

  return res.status(200).json({
    requests: requests.map((item) => ({
      id: item.id,
      computer_id: item.computer_id,
      borrower_id: item.borrower_id,
      reason: item.reason,
      status: item.status,
      requested_at: item.requested_at,
      approved_by: item.approved_by,
      approved_at: item.approved_at,
      returned_at: item.returned_at,
      borrower_name: item.borrower_name,
      borrower_username: item.borrower_username,
    })),
  });
}

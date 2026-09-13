import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  const idParam = req.query.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID yêu cầu không hợp lệ" });
  }

  const request = db
    .prepare(
      "SELECT id, computer_id, borrower_id, reason, status, requested_at, approved_by, approved_at, returned_at FROM borrow_requests WHERE id = ?",
    )
    .get(id) as
    | {
        id: number;
        computer_id: number;
        borrower_id: number;
        reason: string | null;
        status: string;
        requested_at: string;
        approved_by: number | null;
        approved_at: string | null;
        returned_at: string | null;
      }
    | undefined;

  if (!request) {
    return res.status(404).json({ message: "Không tìm thấy yêu cầu mượn máy" });
  }

  return res.status(200).json({ request });
}

import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { getBearerToken, verifyToken } from "@/lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  const authToken = getBearerToken(req);
  let borrowerId = Number(req.body?.borrower_id ?? 0);

  if (!Number.isInteger(borrowerId) || borrowerId <= 0) {
    if (!authToken) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    try {
      const payload = verifyToken(authToken);
      borrowerId = Number(payload.id);
    } catch (error) {
      return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
  }

  if (authToken) {
    try {
      const payload = verifyToken(authToken);
      if (Number(payload.id) !== borrowerId) {
        return res.status(403).json({ message: "Bạn chỉ có thể tạo yêu cầu cho chính mình" });
      }
    } catch (error) {
      return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
  }

  const computerId = Number(req.body?.computer_id ?? 0);
  const reason = String(req.body?.reason ?? "").trim() || null;
  const status = String(req.body?.status ?? "pending").trim() || "pending";

  if (!Number.isInteger(computerId) || computerId <= 0) {
    return res.status(400).json({ message: "computer_id không hợp lệ" });
  }

  if (!Number.isInteger(borrowerId) || borrowerId <= 0) {
    return res.status(400).json({ message: "borrower_id không hợp lệ" });
  }

  const computer = db
    .prepare("SELECT id, status FROM computers WHERE id = ?")
    .get(computerId) as { id: number; status: string } | undefined;

  if (!computer) {
    return res.status(404).json({ message: "Không tìm thấy máy tính" });
  }

  if (computer.status === "in_use" || computer.status === "maintenance") {
    return res.status(409).json({
      message: "Máy tính đang được sử dụng hoặc đang bảo trì, không thể tạo yêu cầu mới",
    });
  }

  const borrower = db
    .prepare("SELECT id FROM users WHERE id = ?")
    .get(borrowerId) as { id: number } | undefined;

  if (!borrower) {
    return res.status(404).json({ message: "Không tìm thấy người mượn" });
  }

  const normalizedStatus = ["pending", "approved", "rejected", "returned"].includes(status)
    ? status
    : "pending";

  const result = db
    .prepare(
      `INSERT INTO borrow_requests (
        computer_id,
        borrower_id,
        reason,
        status,
        requested_at,
        approved_by,
        approved_at,
        returned_at
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, NULL, NULL, NULL)`,
    )
    .run(computerId, borrowerId, reason, normalizedStatus);

  const created = db
    .prepare(
      "SELECT id, computer_id, borrower_id, reason, status, requested_at, approved_by, approved_at, returned_at FROM borrow_requests WHERE id = ?",
    )
    .get(Number(result.lastInsertRowid)) as {
      id: number;
      computer_id: number;
      borrower_id: number;
      reason: string | null;
      status: string;
      requested_at: string;
      approved_by: number | null;
      approved_at: string | null;
      returned_at: string | null;
    };

  return res.status(201).json({
    message: "Tạo yêu cầu mượn máy thành công",
    request: created,
  });
}

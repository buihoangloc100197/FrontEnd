import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const mapBorrowRequestStatusToComputerStatus = (
  status: string,
): "available" | "in_use" | "maintenance" | null => {
  switch (status) {
    case "approved":
      return "in_use";
    case "returned":
    case "rejected":
    case "pending":
      return "available";
    case "maintenance":
      return "maintenance";
    default:
      return null;
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH" && req.method !== "PUT") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  const idParam = req.query.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);
  const status = String(req.body?.status ?? "").trim();
  const approvedBy = Number(req.body?.approved_by ?? 0) || null;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID yêu cầu không hợp lệ" });
  }

  const allowed = ["pending", "approved", "rejected", "returned", "maintenance"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  const existing = db
    .prepare(
      "SELECT id, computer_id, status FROM borrow_requests WHERE id = ?",
    )
    .get(id) as { id: number; computer_id: number; status: string } | undefined;

  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
  }

  const computerStatus = mapBorrowRequestStatusToComputerStatus(status);
  const now = new Date().toISOString();

  const updateSql = `
    UPDATE borrow_requests
    SET status = ?,
        approved_by = ?,
        approved_at = ?,
        returned_at = ?
    WHERE id = ?
  `;

  db.prepare(updateSql).run(
    status,
    approvedBy,
    status === "approved" || status === "rejected" ? now : null,
    status === "returned" ? now : null,
    id,
  );

  if (computerStatus) {
    db.prepare("UPDATE computers SET status = ? WHERE id = ?").run(
      computerStatus,
      existing.computer_id,
    );
  }

  const updated = db
    .prepare(
      "SELECT id, computer_id, borrower_id, reason, status, requested_at, approved_by, approved_at, returned_at FROM borrow_requests WHERE id = ?",
    )
    .get(id) as {
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

  const updatedComputer = db
    .prepare("SELECT id, status FROM computers WHERE id = ?")
    .get(existing.computer_id) as { id: number; status: string } | undefined;

  return res.status(200).json({
    message: "Cập nhật trạng thái yêu cầu thành công",
    request: updated,
    computer: updatedComputer,
  });
}

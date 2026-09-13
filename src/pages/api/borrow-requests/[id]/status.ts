import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH" && req.method !== "PUT") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ message: "Supabase chưa được cấu hình" });
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

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("borrow_requests")
    .select("id, computer_id, status")
    .eq("id", id)
    .maybeSingle();

  if (existingError || !existing) {
    return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
  }

  const computerStatus = mapBorrowRequestStatusToComputerStatus(status);
  const now = new Date().toISOString();

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("borrow_requests")
    .update({
      status,
      approved_by: approvedBy,
      approved_at: status === "approved" || status === "rejected" ? now : null,
      returned_at: status === "returned" ? now : null,
    })
    .eq("id", id)
    .select("id, computer_id, borrower_id, reason, status, requested_at, approved_by, approved_at, returned_at")
    .single();

  if (updateError || !updated) {
    return res.status(500).json({ message: updateError?.message || "Cập nhật trạng thái yêu cầu thất bại" });
  }

  if (computerStatus) {
    const { error: computerUpdateError } = await supabaseAdmin
      .from("computers")
      .update({ status: computerStatus })
      .eq("id", existing.computer_id);

    if (computerUpdateError) {
      return res.status(500).json({ message: computerUpdateError.message || "Cập nhật trạng thái máy thất bại" });
    }
  }

  const { data: updatedComputer } = await supabaseAdmin
    .from("computers")
    .select("id, status")
    .eq("id", existing.computer_id)
    .single();

  return res.status(200).json({
    message: "Cập nhật trạng thái yêu cầu thành công",
    request: updated,
    computer: updatedComputer,
  });
}

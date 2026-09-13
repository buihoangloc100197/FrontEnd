import type { NextApiRequest, NextApiResponse } from "next";
import { getBearerToken, verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ message: "Supabase chưa được cấu hình" });
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

  const { data: computer, error: machineError } = await supabaseAdmin
    .from("computers")
    .select("id, status")
    .eq("id", computerId)
    .maybeSingle();

  if (machineError || !computer) {
    return res.status(404).json({ message: "Không tìm thấy máy tính" });
  }

  if (computer.status === "in_use" || computer.status === "maintenance") {
    return res.status(409).json({
      message: "Máy tính đang được sử dụng hoặc đang bảo trì, không thể tạo yêu cầu mới",
    });
  }

  const { data: borrower, error: borrowerError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("id", borrowerId)
    .maybeSingle();

  if (borrowerError || !borrower) {
    return res.status(404).json({ message: "Không tìm thấy người mượn" });
  }

  const normalizedStatus = ["pending", "approved", "rejected", "returned"].includes(status)
    ? status
    : "pending";

  const { data: created, error } = await supabaseAdmin
    .from("borrow_requests")
    .insert({
      computer_id: computerId,
      borrower_id: borrowerId,
      reason,
      status: normalizedStatus,
    })
    .select("id, computer_id, borrower_id, reason, status, requested_at, approved_by, approved_at, returned_at")
    .single();

  if (error || !created) {
    return res.status(500).json({ message: error?.message || "Tạo yêu cầu thất bại" });
  }

  return res.status(201).json({
    message: "Tạo yêu cầu mượn máy thành công",
    request: created,
  });
}

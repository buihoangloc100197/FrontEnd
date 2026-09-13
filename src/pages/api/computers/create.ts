import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  const name = String(req.body?.name ?? "").trim();
  const room = String(req.body?.room ?? "").trim();
  const specs = String(req.body?.specs ?? "").trim() || null;
  const status = String(req.body?.status ?? "available").trim() || "available";

  if (!name || !room) {
    return res.status(400).json({
      message: "Tên máy và phòng là bắt buộc",
    });
  }

  const normalizedStatus = ["available", "in_use", "maintenance", "pending"].includes(status)
    ? status
    : "available";

  const existingComputer = db
    .prepare("SELECT id FROM computers WHERE name = ? AND room = ?")
    .get(name, room) as { id: number } | undefined;

  if (existingComputer) {
    return res.status(409).json({
      message: "Máy này đã tồn tại trong hệ thống. Vui lòng giữ lại một bản duy nhất.",
    });
  }

  const result = db
    .prepare(
      "INSERT INTO computers (name, room, specs, status, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
    )
    .run(name, room, specs, normalizedStatus);

  const created = db
    .prepare(
      "SELECT id, name, room, specs, status, created_at FROM computers WHERE id = ?",
    )
    .get(Number(result.lastInsertRowid)) as {
      id: number;
      name: string;
      room: string;
      specs: string | null;
      status: string;
      created_at: string;
    };

  return res.status(201).json({
    message: "Thêm máy tính thành công",
    computer: created,
  });
}

import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const idParam = req.query.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID máy tính không hợp lệ" });
  }

  if (req.method === "GET") {
    const computer = db
      .prepare(
        "SELECT id, name, room, specs, status, created_at FROM computers WHERE id = ?",
      )
      .get(id) as
      | {
          id: number;
          name: string;
          room: string;
          specs: string | null;
          status: string;
          created_at: string;
        }
      | undefined;

    if (!computer) {
      return res.status(404).json({ message: "Không tìm thấy máy tính" });
    }

    return res.status(200).json({
      computer,
    });
  }

  if (req.method !== "PUT" && req.method !== "PATCH") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  const name = String(req.body?.name ?? "").trim();
  const room = String(req.body?.room ?? "").trim();
  const specs = String(req.body?.specs ?? "").trim() || null;
  const status = String(req.body?.status ?? "available").trim() || "available";

  const existing = db
    .prepare("SELECT id FROM computers WHERE id = ?")
    .get(id) as { id: number } | undefined;

  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy máy tính để cập nhật" });
  }

  if (!name || !room) {
    return res.status(400).json({
      message: "Tên máy và phòng là bắt buộc",
    });
  }

  const normalizedStatus = ["available", "in_use", "maintenance"].includes(status)
    ? status
    : "available";

  db.prepare(
    "UPDATE computers SET name = ?, room = ?, specs = ?, status = ? WHERE id = ?",
  ).run(name, room, specs, normalizedStatus, id);

  const updated = db
    .prepare(
      "SELECT id, name, room, specs, status, created_at FROM computers WHERE id = ?",
    )
    .get(id) as {
      id: number;
      name: string;
      room: string;
      specs: string | null;
      status: string;
      created_at: string;
    };

  return res.status(200).json({
    message: "Cập nhật máy tính thành công",
    computer: updated,
  });
}

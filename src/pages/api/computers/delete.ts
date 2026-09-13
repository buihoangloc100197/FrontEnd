import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  if (!requireAdmin(req, res)) {
    return;
  }

  const idParam = req.body?.id ?? req.query.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID máy tính không hợp lệ" });
  }

  const existing = db
    .prepare("SELECT id FROM computers WHERE id = ?")
    .get(id) as { id: number } | undefined;

  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy máy tính để xóa" });
  }

  db.prepare("DELETE FROM computers WHERE id = ?").run(id);

  return res.status(200).json({
    message: "Xóa máy tính thành công",
    deletedId: id,
  });
}

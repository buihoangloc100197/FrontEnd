import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  const computers = db
    .prepare(
      "SELECT id, name, room, specs, status, created_at FROM computers ORDER BY id ASC",
    )
    .all() as Array<{
      id: number;
      name: string;
      room: string;
      specs: string | null;
      status: string;
      created_at: string;
    }>;

  return res.status(200).json({
    computers: computers.map((computer) => ({
      id: computer.id,
      name: computer.name,
      room: computer.room,
      specs: computer.specs,
      status: computer.status,
      created_at: computer.created_at,
    })),
  });
}

import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  const totalUsersResult = db
    .prepare(
      "SELECT COUNT(*) AS total FROM users WHERE COALESCE(role, 'user') != 'admin'",
    )
    .get() as { total: number } | undefined;

  const totalUsers = Number(totalUsersResult?.total ?? 0);

  const computers = db
    .prepare(
      "SELECT id, name, room, specs, status FROM computers ORDER BY id ASC",
    )
    .all() as Array<{ id: number; name: string; room: string; specs: string | null; status: string }>;

  const totalComputers = computers.length;
  const availableComputers = computers.filter((computer) => computer.status === "available").length;
  const inUseComputers = computers.filter((computer) => computer.status === "in_use").length;
  const maintenanceComputers = computers.filter((computer) => computer.status === "maintenance").length;

  const usageSummary = db
    .prepare(
      `SELECT COALESCE(SUM(
        CASE
          WHEN approved_at IS NOT NULL AND returned_at IS NOT NULL THEN (strftime('%s', returned_at) - strftime('%s', approved_at)) / 3600.0
          ELSE 0
        END
      ), 0) AS total_hours
      FROM borrow_requests
      WHERE status = 'returned'`,
    )
    .get() as { total_hours: number } | undefined;

  const totalUsageHours = Number(usageSummary?.total_hours ?? 0);

  const usageByMachine = db
    .prepare(
      `SELECT c.name, COALESCE(SUM(
        CASE
          WHEN br.approved_at IS NOT NULL AND br.returned_at IS NOT NULL
            THEN (strftime('%s', br.returned_at) - strftime('%s', br.approved_at)) / 3600.0
          ELSE 0
        END
      ), 0) AS hours
      FROM computers c
      LEFT JOIN borrow_requests br ON br.computer_id = c.id AND br.status = 'returned'
      GROUP BY c.id, c.name
      ORDER BY hours DESC`,
    )
    .all() as Array<{ name: string; hours: number }>;

  return res.status(200).json({
    totalUsers,
    totalComputers,
    availableComputers,
    inUseComputers,
    maintenanceComputers,
    totalUsageHours,
    usageByMachine: usageByMachine.map((item) => ({
      name: item.name,
      hours: Number(item.hours ?? 0),
      status: "returned",
    })),
  });
}

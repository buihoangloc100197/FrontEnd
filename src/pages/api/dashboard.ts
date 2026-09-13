import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ message: "Supabase chưa được cấu hình" });
  }

  const [
    { data: userRows, error: usersError },
    { data: computerRows, error: computersError },
    { data: requestRows, error: requestsError },
  ] = await Promise.all([
    supabaseAdmin.from("users").select("id").neq("role", "admin"),
    supabaseAdmin.from("computers").select("id, name, status"),
    supabaseAdmin.from("borrow_requests").select("id, computer_id, status, approved_at, returned_at"),
  ]);

  if (usersError || computersError || requestsError) {
    return res.status(500).json({
      message: usersError?.message || computersError?.message || requestsError?.message || "Không thể thống kê dữ liệu",
    });
  }

  const computers = computerRows ?? [];
  const requests = requestRows ?? [];
  const totalUsers = userRows?.length ?? 0;
  const totalComputers = computers.length;
  const availableComputers = computers.filter((computer) => computer.status === "available").length;
  const inUseComputers = computers.filter((computer) => computer.status === "in_use").length;
  const maintenanceComputers = computers.filter((computer) => computer.status === "maintenance").length;

  const totalUsageHours = requests.reduce((sum, request) => {
    if (request.status !== "returned" || !request.approved_at || !request.returned_at) {
      return sum;
    }

    const approvedAt = new Date(request.approved_at).getTime();
    const returnedAt = new Date(request.returned_at).getTime();
    const hours = (returnedAt - approvedAt) / (1000 * 60 * 60);
    return sum + (Number.isFinite(hours) ? hours : 0);
  }, 0);

  const usageMap = new Map<string, number>();
  for (const request of requests) {
    if (request.status !== "returned" || !request.approved_at || !request.returned_at) {
      continue;
    }

    const computerName = computers.find((computer) => computer.id === request.computer_id)?.name ?? "Unknown";
    const approvedAt = new Date(request.approved_at).getTime();
    const returnedAt = new Date(request.returned_at).getTime();
    const hours = (returnedAt - approvedAt) / (1000 * 60 * 60);
    const value = Number.isFinite(hours) ? hours : 0;
    usageMap.set(computerName, (usageMap.get(computerName) ?? 0) + value);
  }

  const usageByMachine = Array.from(usageMap.entries())
    .map(([name, hours]) => ({ name, hours, status: "returned" }))
    .sort((a, b) => b.hours - a.hours);

  return res.status(200).json({
    totalUsers,
    totalComputers,
    availableComputers,
    inUseComputers,
    maintenanceComputers,
    totalUsageHours,
    usageByMachine,
  });
}

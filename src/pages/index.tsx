import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";

type DashboardStats = {
  totalUsers: number;
  totalComputers: number;
  availableComputers: number;
  inUseComputers: number;
  maintenanceComputers: number;
  totalUsageHours: number;
  usageByMachine: Array<{ name: string; hours: number; status: string }>;
};

const statusColors: Record<string, string> = {
  available: "#22c55e",
  in_use: "#f59e0b",
  maintenance: "#ef4444",
};

export default function Home() {
  const [dashboard, setDashboard] = useState<DashboardStats>({
    totalUsers: 0,
    totalComputers: 0,
    availableComputers: 0,
    inUseComputers: 0,
    maintenanceComputers: 0,
    totalUsageHours: 0,
    usageByMachine: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch("/api/dashboard");
        const payload = await response.json();

        if (response.ok && payload) {
          setDashboard({
            totalUsers: Number(payload.totalUsers ?? 0),
            totalComputers: Number(payload.totalComputers ?? 0),
            availableComputers: Number(payload.availableComputers ?? 0),
            inUseComputers: Number(payload.inUseComputers ?? 0),
            maintenanceComputers: Number(payload.maintenanceComputers ?? 0),
            totalUsageHours: Number(payload.totalUsageHours ?? 0),
            usageByMachine: Array.isArray(payload.usageByMachine) ? payload.usageByMachine : [],
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const summaryStats = useMemo(
    () => [
      {
        title: "Người dùng",
        value: String(dashboard.totalUsers),
        subtitle: "Tổng số tài khoản người dùng",
        icon: "👥",
        iconBg: "bg-[#dfeaff] text-[#3d5efb]",
      },
      {
        title: "Máy tính",
        value: String(dashboard.totalComputers),
        subtitle: "Tổng số máy hiện có",
        icon: "💻",
        iconBg: "bg-[#e9d9ff] text-[#7c4dff]",
      },
      {
        title: "Máy đang dùng",
        value: String(dashboard.inUseComputers),
        subtitle: "Máy đang được sử dụng",
        icon: "🖥️",
        iconBg: "bg-[#fff0c7] text-[#d59d00]",
      },
      {
        title: "Tổng thời gian",
        value: `${dashboard.totalUsageHours.toFixed(1)}h`,
        subtitle: "Thời gian đã sử dụng",
        icon: "⏱️",
        iconBg: "bg-[#dff7ea] text-[#2d9f6f]",
      },
    ],
    [dashboard],
  );

  const machineStatusRows = [
    { key: "available", label: "Có sẵn", value: dashboard.availableComputers },
    { key: "in_use", label: "Đang sử dụng", value: dashboard.inUseComputers },
    { key: "maintenance", label: "Bảo trì", value: dashboard.maintenanceComputers },
  ];

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-5 pb-8">
        <div className="border-b border-[#dfe5ee] pb-4">
          <h1 className="text-[32px] font-bold tracking-[-0.06em] text-[#1e2430]">Dashboard</h1>
          <p className="mt-1 text-[14px] text-[#4b5565]">Tổng quan hệ thống phòng máy và người dùng</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {summaryStats.map((item) => (
            <div
              key={item.title}
              className="rounded-[22px] border border-[#dfe5ee] bg-[#f5f6f7] p-4 shadow-[0_8px_20px_rgba(15,23,42,0.02)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-semibold text-[#1e2430]">{item.title}</div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-[14px] text-[20px] ${item.iconBg}`}>
                  {item.icon}
                </div>
              </div>

              <div className="mt-6 text-[38px] font-bold leading-none tracking-[-0.06em] text-[#1e2430]">
                {loading ? "0" : item.value}
              </div>
              <div className="mt-3 text-[13px] text-[#697586]">{item.subtitle}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[22px] border border-[#dfe5ee] bg-[#f5f6f7] p-4 shadow-[0_8px_20px_rgba(15,23,42,0.02)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[26px] font-bold tracking-[-0.05em] text-[#1f232d]">Máy theo trạng thái</h2>
              <span className="rounded-full border border-[#dfe5ee] bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5c6778]">
                {dashboard.totalComputers} TOTAL
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {machineStatusRows.map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-3 rounded-[14px] border border-[#dfe5ee] bg-[#f8f9fb] px-3 py-3">
                  <div className="flex items-center gap-3 text-[18px] text-[#1f232d]">
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: statusColors[row.key] }}
                    />
                    {row.label}
                  </div>
                  <div className="text-[15px] text-[#5c6778]">{row.value} máy</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-[#dfe5ee] bg-[#f5f6f7] p-4 shadow-[0_8px_20px_rgba(15,23,42,0.02)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[26px] font-bold tracking-[-0.05em] text-[#1f232d]">Thời gian sử dụng theo máy</h2>
              <span className="rounded-full bg-[#dff7ea] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a8f58]">
                LIVE
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {dashboard.usageByMachine.length === 0 ? (
                <div className="rounded-[14px] border border-[#dfe5ee] bg-[#f8f9fb] px-3 py-3 text-[15px] text-[#5c6778]">
                  0 máy
                </div>
              ) : (
                dashboard.usageByMachine.map((row) => (
                  <div key={row.name} className="flex items-center justify-between gap-3 rounded-[14px] border border-[#dfe5ee] bg-[#f8f9fb] px-3 py-3">
                    <div className="text-[15px] text-[#1f232d]">{row.name}</div>
                    <div className="text-[15px] text-[#5c6778]">{row.hours.toFixed(1)}h</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}


type SidebarItem = {
  label: string;
  icon: string;
  active?: boolean;
};

type SidebarProps = {
  collapsed: boolean;
};

const menu: SidebarItem[] = [
  { label: "Tổng quan", icon: "⌂", active: true },
  { label: "Bán hàng", icon: "◫" },
  { label: "Khách hàng", icon: "◎" },
  { label: "Báo cáo", icon: "▣" },
  { label: "Cài đặt", icon: "⚙" },
  { label: "Hỗ trợ", icon: "?" },
  { label: "Đăng xuất", icon: "⇠" },
];

export function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside
      className={[
        "fixed left-0 top-20 bottom-0 z-30 border-r border-[#dfe8f5] bg-[#111827]/95 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-20" : "w-72",
      ].join(" ")}
    >
      <div className="flex h-full flex-col">
        <div className="border-b border-[#243149] p-3">
          <div className="flex items-center justify-center rounded-2xl border border-[#dfeaff] bg-[#2e6bff]/15 px-3 py-3 text-[#dfeaff] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
            {collapsed ? "A" : "ADMIN"}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-2">
            {menu.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition",
                    item.active
                      ? "bg-[#2e6bff]/15 text-[#dfeaff] ring-1 ring-[#2e6bff]/40"
                      : "text-[#e7edf7] hover:bg-[#1d2a3d] hover:text-[#f5f1e8]",
                    collapsed ? "justify-center px-2" : "",
                  ].join(" ")}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

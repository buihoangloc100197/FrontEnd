import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getStoredSessionUser, normalizeUserRole } from "@/lib/session";

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
};

type SidebarProps = {
  collapsed: boolean;
};

const menu: SidebarItem[] = [
  { label: "Trạng chủ", icon: "▣", href: "/" },
  { label: "Quản lý máy tính", icon: "◫", href: "/home" },
  { label: "Swagger API", icon: "◰", href: "/hello" },
  { label: "Hồ sơ", icon: "◌", href: "/auth/thong-tin-ca-nhan" },
];

export function Sidebar({ collapsed }: SidebarProps) {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "user" | null>(null);

  useEffect(() => {
    const user = getStoredSessionUser();
    const nextRole = user ? normalizeUserRole(user.role, user.username) : null;
    setRole(nextRole);
  }, [router.pathname]);

  return (
    <aside
      className={[
        "fixed left-0 top-20 bottom-0 z-30 border-r border-[#dfe5ee] bg-[#ebeff4] transition-all duration-300",
        collapsed ? "w-20" : "w-72",
      ].join(" ")}
    >
      <div className="flex h-full flex-col px-3 py-3">
        <nav className="flex-1 overflow-y-auto pt-1">
          <ul className="space-y-2">
            {menu.map((item) => {
              const isActive = router.pathname === item.href;
              const isProfileItem = item.label === "Hồ sơ";

              return (
                <li key={item.label}>
                  <Link href={item.href} passHref>
                    <button
                      type="button"
                      className={[
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] font-medium transition-all",
                        isActive
                          ? "bg-[#e7e9ff] text-[#1f2a3d] shadow-[inset_0_0_0_1px_rgba(83,99,255,0.12)]"
                          : "text-[#2b3340] hover:bg-[#f6f7fb]",
                        collapsed ? "justify-center px-2" : "",
                      ].join(" ")}
                    >
                      <span className="text-lg leading-none">{item.icon}</span>
                      {!collapsed && <span>{item.label}</span>}
                    </button>
                  </Link>

                  {!collapsed && isProfileItem && role ? (
                    <div className="mt-2 rounded-[18px] border border-[#e9d9a4] bg-[#f7eec8] px-3 py-2 text-center text-[14px] font-medium text-[#4a3d13] shadow-[inset_0_0_0_1px_rgba(197,152,45,0.15)]">
                      Vai trò: {role === "admin" ? "Quản trị viên" : "Người dùng"}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

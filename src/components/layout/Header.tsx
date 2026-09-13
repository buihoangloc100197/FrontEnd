import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/axios";

type HeaderProps = {
  title: string;
  collapsed: boolean;
  onToggleSidebar: () => void;
};

type UserSummary = {
  id?: number;
  username?: string;
  full_name?: string | null;
  avatar_url?: string | null;
};

export function Header({ title, collapsed, onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user ?? null);
      } catch (error) {
        console.error("Không thể tải thông tin người dùng", error);
        setUser(null);
      }
    };

    fetchUser();
  }, [router.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.full_name?.trim() || user?.username?.trim() || "User";
  const initials = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsMenuOpen(false);
    router.push("/auth/login");
  };

  const goToProfile = () => {
    setIsMenuOpen(false);
    router.push("/auth/thong-tin-ca-nhan");
  };

  const goToPassword = () => {
    setIsMenuOpen(false);
    router.push("/auth/doi-mat-khau");
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-40 h-20 border-b border-[#dfe8f5] bg-[#111827]/95 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-5 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#32415f] bg-[#1d2a3d] text-lg text-[#f5f1e8] transition hover:border-[#2e6bff] hover:text-[#dfeaff]"
            aria-label={collapsed ? "Mở menu" : "Ẩn menu"}
          >
            {collapsed ? "☰" : "✕"}
          </button>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#dfeaff]">
              Dashboard
            </p>
            <h1 className="text-lg font-bold text-[#f5f1e8]">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="flex items-center gap-3 rounded-full border border-[#32415f] bg-[#1d2a3d] px-2 py-2 pr-3 text-left text-[#f5f1e8] transition hover:border-[#2e6bff]"
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#dfeaff] via-[#8fb9ff] to-[#2e6bff] font-bold text-[#111827] shadow-[0_8px_18px_rgba(46,107,255,0.35)]">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="hidden text-left md:block">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#dfeaff]/70">
                  Xin chào
                </p>
                <p className="text-sm font-semibold text-[#f5f1e8]">{displayName}</p>
              </div>

              <span className="text-sm text-[#dfeaff]">▾</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-64 overflow-hidden rounded-2xl border border-[#dfe8f5] bg-[#ffffff] shadow-[0_18px_40px_rgba(17,24,39,0.18)]">
                <div className="border-b border-[#edf3ff] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#4a5568]">Tài khoản</p>
                  <p className="mt-1 font-semibold text-[#111827]">{displayName}</p>
                </div>

                <button
                  type="button"
                  onClick={goToProfile}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#111827] transition hover:bg-[#edf3ff]"
                >
                  <span>Hồ sơ cá nhân</span>
                  <span>→</span>
                </button>

                <button
                  type="button"
                  onClick={goToPassword}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#111827] transition hover:bg-[#edf3ff]"
                >
                  <span>Đổi mật khẩu</span>
                  <span>↻</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-between border-t border-[#edf3ff] px-4 py-3 text-left text-sm font-medium text-[#b4233b] transition hover:bg-[#fff1f3]"
                >
                  <span>Đăng xuất</span>
                  <span>⇠</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

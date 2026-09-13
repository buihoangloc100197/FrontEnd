import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/axios";
import { clearStoredSession, getStoredSessionToken, getStoredSessionUser, normalizeUserRole, saveStoredSessionUser } from "@/lib/session";

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
  role?: "admin" | "user" | string;
};

export function Header({ title, collapsed, onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const syncUserFromSession = () => {
      const persistedUser = getStoredSessionUser();
      if (persistedUser) {
        setUser(persistedUser);
      }
    };

    syncUserFromSession();

    const token = getStoredSessionToken();
    if (!token) {
      setUser(null);
      clearStoredSession();
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const nextUser = response.data.user ?? null;
        setUser(nextUser);
        saveStoredSessionUser(nextUser);
      } catch (error) {
        console.error("Không thể tải thông tin người dùng", error);
        const persistedUser = getStoredSessionUser();
        setUser(persistedUser ?? null);
      }
    };

    fetchUser();

    const handleUserUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<UserSummary | null>;
      const nextUser = customEvent.detail ?? getStoredSessionUser();
      if (nextUser) {
        setUser(nextUser);
        saveStoredSessionUser(nextUser);
      }
    };

    window.addEventListener("session:user-updated", handleUserUpdated);
    return () => {
      window.removeEventListener("session:user-updated", handleUserUpdated);
    };
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
  const effectiveRole = normalizeUserRole(user?.role, user?.username);
  const roleLabel = effectiveRole === "admin" ? "Quản trị viên" : "Người dùng";

  const handleLogout = () => {
    clearStoredSession();
    setUser(null);
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
    <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-[#dfe3ea] bg-[#f6f7fb] backdrop-blur-xl md:h-20">
      <div className="flex h-full items-center justify-between px-3 sm:px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c6d0dc] bg-white text-lg text-[#2d3748] shadow-sm transition hover:border-[#7c9cff]"
            aria-label={collapsed ? "Mở menu" : "Ẩn menu"}
          >
            {collapsed ? "☰" : "☰"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3d5efb] to-[#6d5efc] text-sm font-bold text-white shadow-[0_8px_18px_rgba(90,98,255,0.35)]">
              Q
            </div>
            <h1 className="text-sm font-semibold text-[#202940] md:text-[15px]">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="flex items-center gap-3 rounded-full border border-[#dfe3ea] bg-white px-2 py-2 pr-3 text-left text-[#202940] shadow-sm transition hover:border-[#7c9cff]"
            >
              <span className="flex h-7 items-center gap-2 text-[11px] font-medium text-[#2f3746]">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#22c55e] shadow-[0_0_0_2px_rgba(34,197,94,0.15)]" />
                System online
              </span>

              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#dfeaff] via-[#b7c9ff] to-[#6978ff] font-bold text-[#111827]">
                {user?.avatar_url ? (
                  <img
                    key={user.avatar_url}
                    src={user.avatar_url}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <span className="hidden text-sm font-medium sm:block">{displayName}</span>
              <span className="text-base text-[#75809a]">▾</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-64 overflow-hidden rounded-2xl border border-[#dfe3ea] bg-white shadow-[0_18px_40px_rgba(17,24,39,0.12)]">
                <div className="border-b border-[#edf3ff] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#4a5568]">Tài khoản</p>
                  <p className="mt-1 font-semibold text-[#111827]">{displayName}</p>
                  <p className="mt-1 text-xs text-[#4a5568]">Vai trò: {roleLabel}</p>
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

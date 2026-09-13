export type SessionUser = {
  id?: number;
  username?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: "admin" | "user" | string;
};

export function normalizeUserRole(role?: string | null, username?: string): "admin" | "user" {
  const normalizedRole = String(role ?? "").trim().toLowerCase();
  const normalizedUsername = String(username ?? "").trim().toLowerCase();

  if (normalizedRole === "admin" || normalizedUsername === "admin") {
    return "admin";
  }

  return "user";
}

export function getStoredSessionUser(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("auth_user");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as SessionUser;
    if (!parsed) {
      return null;
    }

    return {
      ...parsed,
      role: normalizeUserRole(parsed.role, parsed.username),
    };
  } catch (error) {
    console.error("Không thể đọc thông tin phiên đăng nhập", error);
    return null;
  }
}

export function saveStoredSessionUser(user: SessionUser | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    window.localStorage.removeItem("auth_user");
    return;
  }

  const normalizedUser: SessionUser = {
    ...user,
    role: normalizeUserRole(user.role, user.username),
  };

  window.localStorage.setItem("auth_user", JSON.stringify(normalizedUser));
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("auth_token");
  window.localStorage.removeItem("auth_user");
}

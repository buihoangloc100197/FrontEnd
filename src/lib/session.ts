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

export function getStoredSessionToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = window.sessionStorage.getItem("auth_token");
  if (token) {
    return token;
  }

  if (window.localStorage.getItem("auth_token")) {
    window.localStorage.removeItem("auth_token");
  }

  return null;
}

export function saveStoredSessionToken(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!token) {
    window.sessionStorage.removeItem("auth_token");
    window.localStorage.removeItem("auth_token");
    return;
  }

  window.sessionStorage.setItem("auth_token", token);
  window.localStorage.removeItem("auth_token");
}

export function getStoredSessionUser(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem("auth_user");
    if (!raw) {
      if (window.localStorage.getItem("auth_user")) {
        window.localStorage.removeItem("auth_user");
      }
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
    window.sessionStorage.removeItem("auth_user");
    window.localStorage.removeItem("auth_user");
    return;
  }

  const normalizedUser: SessionUser = {
    ...user,
    role: normalizeUserRole(user.role, user.username),
  };

  window.sessionStorage.setItem("auth_user", JSON.stringify(normalizedUser));
  window.localStorage.removeItem("auth_user");
}

export function buildAvatarUrlWithVersion(url?: string | null): string | null {
  if (!url) {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    parsed.searchParams.set("v", String(Date.now()));
    return parsed.toString();
  } catch {
    return `${trimmed}${trimmed.includes("?") ? "&" : "?"}v=${Date.now()}`;
  }
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem("auth_token");
  window.sessionStorage.removeItem("auth_user");
  window.localStorage.removeItem("auth_token");
  window.localStorage.removeItem("auth_user");
}

export type SessionUser = {
  id?: number;
  username?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: "admin" | "user" | string;
};

export function getStoredSessionUser(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("auth_user");
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as SessionUser;
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

  window.localStorage.setItem("auth_user", JSON.stringify(user));
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("auth_token");
  window.localStorage.removeItem("auth_user");
}

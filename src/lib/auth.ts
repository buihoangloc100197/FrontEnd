import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export type AuthRole = "admin" | "user";

export type AuthTokenPayload = {
  id: number;
  username: string;
  profileComplete: boolean;
  role?: AuthRole;
  iat?: number;
  exp?: number;
};

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

export function createToken(user: {
  id: number;
  username: string;
  profileComplete: boolean;
  role: AuthRole;
}) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      profileComplete: user.profileComplete,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}

export function getBearerToken(req: NextApiRequest) {
  const authHeader = req.headers.authorization ?? "";

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.replace("Bearer ", "").trim();
}

export function getEffectiveRole(payload: AuthTokenPayload): AuthRole {
  return payload.role ?? (payload.username === "admin" ? "admin" : "user");
}

export function requireAdmin(req: NextApiRequest, res: NextApiResponse) {
  const token = getBearerToken(req);

  if (!token) {
    res.status(401).json({ message: "Bạn chưa đăng nhập" });
    return null;
  }

  try {
    const payload = verifyToken(token);
    const effectiveRole = getEffectiveRole(payload);

    if (effectiveRole !== "admin") {
      res.status(403).json({ message: "Chỉ admin mới có quyền thực hiện thao tác này" });
      return null;
    }

    return { ...payload, role: effectiveRole };
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    return null;
  }
}

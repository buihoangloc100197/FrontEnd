import type { NextApiRequest } from "next";
import jwt from "jsonwebtoken";

export type AuthTokenPayload = {
  id: number;
  username: string;
  profileComplete: boolean;
  iat?: number;
  exp?: number;
};

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

export function createToken(user: {
  id: number;
  username: string;
  profileComplete: boolean;
}) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      profileComplete: user.profileComplete,
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

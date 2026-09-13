import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { getBearerToken, verifyToken } from "@/lib/auth";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  try {
    const payload = verifyToken(token);
    const user = db
      .prepare(
        "SELECT id, username, full_name, mssv, class_name, gender, phone, email, avatar_url, profile_complete FROM users WHERE id = ?",
      )
      .get(payload.id) as
      | {
          id: number;
          username: string;
          full_name: string | null;
          mssv: string | null;
          class_name: string | null;
          gender: string | null;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          profile_complete: number;
        }
      | undefined;

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        mssv: user.mssv,
        class_name: user.class_name,
        gender: user.gender,
        phone: user.phone,
        email: user.email,
        avatar_url: user.avatar_url,
        profileComplete: Boolean(user.profile_complete),
      },
    });
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

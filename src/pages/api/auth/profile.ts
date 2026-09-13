import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { getBearerToken, verifyToken } from "@/lib/auth";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  try {
    const payload = verifyToken(token);

    if (req.method === "GET") {
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
    }

    if (req.method !== "PUT") {
      return res.status(405).json({ message: "Phương thức không hợp lệ" });
    }

    const data = req.body ?? {};
    const fullName = String(data.full_name ?? "").trim();
    const mssv = String(data.mssv ?? "").trim();
    const className = String(data.class_name ?? "").trim();
    const gender = String(data.gender ?? "").trim();
    const phone = String(data.phone ?? "").trim();
    const email = String(data.email ?? "").trim();
    const avatarUrl = String(data.avatar_url ?? "").trim();

    if (!fullName || !mssv || !className || !gender || !phone || !email) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ họ tên, MSSV, lớp, giới tính, số điện thoại và email",
      });
    }

    const profileComplete = Boolean(fullName && mssv && className && gender && phone && email);

    db.prepare(
      "UPDATE users SET full_name = ?, mssv = ?, class_name = ?, gender = ?, phone = ?, email = ?, avatar_url = ?, profile_complete = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(fullName, mssv, className, gender, phone, email, avatarUrl || null, profileComplete ? 1 : 0, payload.id);

    return res.status(200).json({
      message: "Cập nhật thông tin cá nhân thành công",
      profileComplete,
    });
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

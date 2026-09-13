import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { createToken } from "@/lib/auth";

type UserRow = {
  id: number;
  username: string;
  password_hash: string;
  full_name: string | null;
  mssv: string | null;
  class_name: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  profile_complete: number;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  const username = String(req.body?.username ?? "").trim();
  const password = String(req.body?.password ?? "");

  if (!username || !password) {
    return res.status(400).json({
      message: "Tên đăng nhập và mật khẩu là bắt buộc",
    });
  }

  const user = db
    .prepare(
      "SELECT * FROM users WHERE username = ?",
    )
    .get(username) as UserRow | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
  }

  const profileComplete = Boolean(
    user.full_name &&
      user.mssv &&
      user.class_name &&
      user.gender &&
      user.phone &&
      user.email,
  );

  const token = createToken({
    id: user.id,
    username: user.username,
    profileComplete,
  });

  return res.status(200).json({
    message: "Đăng nhập thành công",
    token,
    requireProfile: !profileComplete,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      mssv: user.mssv,
      class_name: user.class_name,
      gender: user.gender,
      phone: user.phone,
      email: user.email,
      profileComplete,
    },
  });
}

import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  const username = String(req.body?.username ?? "").trim();
  const password = String(req.body?.password ?? "");
  const confirmPassword = String(req.body?.confirmPassword ?? "");

  if (!username || !password || !confirmPassword) {
    return res.status(400).json({
      message: "Tên đăng nhập, mật khẩu và xác nhận mật khẩu là bắt buộc",
    });
  }

  if (username.length < 3) {
    return res.status(400).json({
      message: "Tên đăng nhập phải có ít nhất 3 ký tự",
    });
  }

  if (password.length < 2) {
    return res.status(400).json({
      message: "Mật khẩu phải có ít nhất 2 ký tự",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Mật khẩu nhập lại không khớp",
    });
  }

  const existingUser = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(username) as { id: number } | undefined;

  if (existingUser) {
    return res.status(409).json({
      message: "Tên đăng nhập đã tồn tại",
    });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare(
      "INSERT INTO users (username, password_hash, profile_complete, created_at, updated_at) VALUES (?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
    )
    .run(username, hash);

  return res.status(201).json({
    message: "Đăng ký thành công",
    user: {
      id: Number(result.lastInsertRowid),
      username,
    },
  });
}

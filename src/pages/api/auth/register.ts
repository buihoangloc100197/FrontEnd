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
  const confirmPassword = String(req.body?.confirmPassword ?? password);
  const fullName = String(req.body?.full_name ?? "").trim() || null;
  const email = String(req.body?.email ?? "").trim() || null;

  if (!username || !password) {
    return res.status(400).json({
      message: "Tên đăng nhập và mật khẩu là bắt buộc",
    });
  }

  if (!confirmPassword) {
    return res.status(400).json({
      message: "Vui lòng xác nhận mật khẩu",
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

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      message: "Email không hợp lệ",
    });
  }

  const existingUser = db
    .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
    .get(username, email ?? "") as { id: number } | undefined;

  if (existingUser) {
    return res.status(409).json({
      message: "Tên đăng nhập hoặc email đã tồn tại",
    });
  }

  const hash = bcrypt.hashSync(password, 10);
  const isProfileComplete = Boolean(fullName && email);

  const result = db
    .prepare(
      "INSERT INTO users (username, password_hash, full_name, email, role, profile_complete, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
    )
    .run(username, hash, fullName, email, "user", isProfileComplete ? 1 : 0);

  return res.status(201).json({
    message: "Đăng ký thành công",
    user: {
      id: Number(result.lastInsertRowid),
      username,
      full_name: fullName,
      email,
    },
  });
}

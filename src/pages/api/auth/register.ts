import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(
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

  if (!supabaseAdmin) {
    return res.status(500).json({ message: "Supabase chưa được cấu hình" });
  }

  const { data: existingUsers, error: existingError } = await supabaseAdmin
    .from("users")
    .select("id")
    .or(`username.eq.${username},email.eq.${email ?? ""}`);

  if (existingError) {
    return res.status(500).json({ message: existingError.message || "Không thể kiểm tra người dùng" });
  }

  if ((existingUsers ?? []).length > 0) {
    return res.status(409).json({
      message: "Tên đăng nhập hoặc email đã tồn tại",
    });
  }

  const hash = bcrypt.hashSync(password, 10);
  const isProfileComplete = Boolean(fullName && email);

  const { data: createdUser, error: insertError } = await supabaseAdmin
    .from("users")
    .insert({
      username,
      password_hash: hash,
      full_name: fullName,
      email,
      role: "user",
      profile_complete: isProfileComplete ? 1 : 0,
    })
    .select("id, username, full_name, email")
    .single();

  if (insertError || !createdUser) {
    return res.status(500).json({ message: insertError?.message || "Đăng ký thất bại" });
  }

  return res.status(201).json({
    message: "Đăng ký thành công",
    user: {
      id: createdUser.id,
      username: createdUser.username,
      full_name: createdUser.full_name,
      email: createdUser.email,
    },
  });
}

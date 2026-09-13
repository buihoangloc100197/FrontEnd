import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

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
  role: string | null;
  profile_complete: number;
};

export default async function handler(
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

  if (!supabaseAdmin) {
    return res.status(500).json({ message: "Supabase chưa được cấu hình" });
  }

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error || !user) {
    return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
  }

  const userRow = user as UserRow;

  if (!bcrypt.compareSync(password, userRow.password_hash)) {
    return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
  }

  const profileComplete = Boolean(
    userRow.full_name &&
      userRow.mssv &&
      userRow.class_name &&
      userRow.gender &&
      userRow.phone &&
      userRow.email,
  );

  const role = userRow.role === "admin" ? "admin" : "user";

  const token = createToken({
    id: userRow.id,
    username: userRow.username,
    profileComplete,
    role,
  });

  return res.status(200).json({
    message: "Đăng nhập thành công",
    token,
    requireProfile: !profileComplete,
    user: {
      id: userRow.id,
      username: userRow.username,
      full_name: userRow.full_name,
      mssv: userRow.mssv,
      class_name: userRow.class_name,
      gender: userRow.gender,
      phone: userRow.phone,
      email: userRow.email,
      role,
      profileComplete,
    },
  });
}

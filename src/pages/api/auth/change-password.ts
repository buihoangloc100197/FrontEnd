import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { getBearerToken, verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Phương thức không hợp lệ" });
  }

  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  try {
    const payload = verifyToken(token);
    const currentPassword = String(req.body?.currentPassword ?? "");
    const newPassword = String(req.body?.newPassword ?? "");
    const confirmPassword = String(req.body?.confirmPassword ?? "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Vui lòng nhập mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới",
      });
    }

    if (newPassword.length < 2) {
      return res.status(400).json({
        message: "Mật khẩu mới phải có ít nhất 2 ký tự",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Mật khẩu mới và xác nhận không khớp",
      });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({ message: "Supabase chưa được cấu hình" });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("password_hash")
      .eq("id", payload.id)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    const hash = bcrypt.hashSync(newPassword, 10);

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        password_hash: hash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.id);

    if (updateError) {
      return res.status(500).json({ message: updateError.message || "Đổi mật khẩu thất bại" });
    }

    return res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

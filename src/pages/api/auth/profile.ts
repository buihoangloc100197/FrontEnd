import type { NextApiRequest, NextApiResponse } from "next";
import { getBearerToken, verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  try {
    const payload = verifyToken(token);

    if (!supabaseAdmin) {
      return res.status(500).json({ message: "Supabase chưa được cấu hình" });
    }

    if (req.method === "GET") {
      const { data: user, error } = await supabaseAdmin
        .from("users")
        .select("id, username, full_name, mssv, class_name, gender, phone, email, avatar_url, role, profile_complete")
        .eq("id", payload.id)
        .maybeSingle();

      if (error || !user) {
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
          role: user.role === "admin" ? "admin" : "user",
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

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        full_name: fullName,
        mssv,
        class_name: className,
        gender,
        phone,
        email,
        avatar_url: avatarUrl || null,
        profile_complete: profileComplete ? 1 : 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.id);

    if (updateError) {
      return res.status(500).json({ message: updateError.message || "Cập nhật thất bại" });
    }

    return res.status(200).json({
      message: "Cập nhật thông tin cá nhân thành công",
      profileComplete,
    });
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

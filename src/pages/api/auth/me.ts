import type { NextApiRequest, NextApiResponse } from "next";
import { getBearerToken, verifyToken } from "@/lib/auth";
import { demoUsers } from "@/lib/demoData";
import { supabaseAdmin } from "@/lib/supabase";

export default async function handler(
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

    if (!supabaseAdmin) {
      return res.status(500).json({ message: "Supabase chưa được cấu hình" });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, username, full_name, mssv, class_name, gender, phone, email, avatar_url, role, profile_complete")
      .eq("id", payload.id)
      .maybeSingle();

    if (error || !user) {
      const fallbackUser = demoUsers.find((item) => item.id === payload.id || item.username === payload.username) ?? demoUsers[0];

      if (payload.username === "admin" || payload.role === "admin" || fallbackUser.username === "admin") {
        return res.status(200).json({
          user: {
            id: fallbackUser.id,
            username: fallbackUser.username,
            full_name: fallbackUser.full_name,
            mssv: fallbackUser.mssv,
            class_name: fallbackUser.class_name,
            gender: fallbackUser.gender,
            phone: fallbackUser.phone,
            email: fallbackUser.email,
            avatar_url: fallbackUser.avatar_url,
            role: fallbackUser.role === "admin" ? "admin" : "user",
            profileComplete: Boolean(fallbackUser.profile_complete),
          },
        });
      }

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
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

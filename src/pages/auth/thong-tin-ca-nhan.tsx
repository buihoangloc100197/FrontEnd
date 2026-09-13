import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/axios";
import { getSupabaseUrl, supabase } from "@/lib/supabase";
import { getStoredSessionToken } from "@/lib/session";

type ProfileForm = {
  full_name: string;
  mssv: string;
  class_name: string;
  gender: string;
  phone: string;
  email: string;
  avatar_url: string;
};

export default function PersonalInfoPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [avatarMode, setAvatarMode] = useState<"upload" | "link">("link");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    mssv: "",
    class_name: "",
    gender: "",
    phone: "",
    email: "",
    avatar_url: "",
  });

  useEffect(() => {
    const token = getStoredSessionToken();

    if (!token) {
      router.push("/auth/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = response.data.user;
        setForm({
          full_name: user.full_name ?? "",
          mssv: user.mssv ?? "",
          class_name: user.class_name ?? "",
          gender: user.gender ?? "",
          phone: user.phone ?? "",
          email: user.email ?? "",
          avatar_url: user.avatar_url ?? "",
        });
      } catch (error) {
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    if (name === "avatar_url") {
      setAvatarMode("link");
    }
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Vui lòng chọn file ảnh hợp lệ");
      event.target.value = "";
      return;
    }

    if (!supabase) {
      setMessage("Supabase chưa được cấu hình, vui lòng kiểm tra biến môi trường");
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);
      setMessage("");

      const fileName = `avatars/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { data, error } = await supabase.storage.from("avatars").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || "image/jpeg",
      });

      if (error) {
        throw error;
      }

      const publicUrl = `${getSupabaseUrl()}/storage/v1/object/public/avatars/${data?.path ?? fileName}`;
      setAvatarMode("upload");
      setForm((current) => ({ ...current, avatar_url: publicUrl }));
      setMessage("Ảnh đại diện đã được tải lên Supabase thành công");
    } catch (error: any) {
      console.error("Upload avatar failed:", error);
      setMessage(error?.message || "Tải ảnh lên Supabase thất bại");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const token = getStoredSessionToken();

    try {
      const response = await api.put(
        "/api/auth/profile",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessage(response.data.message);
      setTimeout(() => router.push("/"), 800);
    } catch (err: any) {
      setMessage(err?.response?.data?.message ?? "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8] text-[#111827]">
        <div className="text-lg text-[#214ed6]">Đang tải thông tin cá nhân...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f1e8] px-6 py-10 text-[#111827]">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-6 rounded-full border border-[#dfe8f5] bg-[#edf3ff] px-4 py-2 text-sm font-medium text-[#214ed6] transition hover:border-[#2e6bff] hover:text-[#111827]"
        >
          ← Quay về trang chủ
        </button>

        <section className="rounded-3xl border border-[#dfe8f5] bg-[#ffffff] p-8 shadow-[0_18px_40px_rgba(46,107,255,0.08)]">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#214ed6]">Profile</p>
            <h1 className="mt-3 text-3xl font-black text-[#111827]">Cập nhật thông tin cá nhân</h1>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">Họ tên</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                placeholder="Nhập họ tên"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">MSSV</label>
              <input
                name="mssv"
                value={form.mssv}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                placeholder="VD: 425000181"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Lớp</label>
              <input
                name="class_name"
                value={form.class_name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                placeholder="VD: 25CT401"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Giới tính</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                required
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Số điện thoại</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                placeholder="Nhập email"
                required
              />
            </div>

            <div className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-slate-300">Ảnh đại diện</label>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <button
                    type="button"
                    onClick={() => setAvatarMode("upload")}
                    className={[
                      "rounded-full border px-3 py-1.5 transition",
                      avatarMode === "upload"
                        ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                        : "border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-500/50",
                    ].join(" ")}
                  >
                    Tải ảnh lên
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarMode("link")}
                    className={[
                      "rounded-full border px-3 py-1.5 transition",
                      avatarMode === "link"
                        ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                        : "border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-500/50",
                    ].join(" ")}
                  >
                    Dùng link
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="url"
                  name="avatar_url"
                  value={form.avatar_url}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-white outline-none focus:border-cyan-500"
                  placeholder="https://example.com/avatar.png"
                />

                <button
                  type="button"
                  onClick={() => {
                    setAvatarMode("upload");
                    fileInputRef.current?.click();
                  }}
                  disabled={uploadingImage}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-lg text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Tải ảnh lên Supabase"
                  title="Tải ảnh từ máy lên Supabase"
                >
                  {uploadingImage ? "…" : "📷"}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadAvatar}
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                {avatarMode === "upload"
                  ? "Hình ảnh đang được lưu bằng upload lên Supabase Storage."
                  : "Bạn đang lưu link ảnh trực tiếp vào dữ liệu người dùng."}
              </p>
            </div>

            {message ? (
              <div className="md:col-span-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">
                {message}
              </div>
            ) : null}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu thông tin"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/axios";
import { getSupabaseUrl, supabase } from "@/lib/supabase";
import { getStoredSessionToken, getStoredSessionUser, saveStoredSessionUser } from "@/lib/session";

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

      const storedUser = getStoredSessionUser();
      saveStoredSessionUser({
        ...storedUser,
        ...form,
        avatar_url: form.avatar_url || storedUser?.avatar_url || null,
      });

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
              <div className="mb-2 flex items-center gap-2">
                <label className="block text-sm font-medium text-slate-300">Ảnh đại diện</label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="inline-flex items-center justify-center rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Chọn ảnh từ máy"
                  title="Chọn ảnh từ máy"
                >
                  {uploadingImage ? "Đang tải..." : "Chọn ảnh"}
                </button>
              </div>

              <input
                type="url"
                name="avatar_url"
                value={form.avatar_url}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                placeholder="Nhập link ảnh nếu muốn dùng link trực tiếp"
              />

              {form.avatar_url ? (
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 p-3">
                  <img
                    key={form.avatar_url}
                    src={form.avatar_url}
                    alt="Avatar preview"
                    className="h-24 w-24 rounded-full object-cover ring-2 ring-cyan-500/40"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ) : null}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadAvatar}
              />

              <p className="mt-2 text-xs text-slate-400">
                Nếu dùng link, hệ thống sẽ lưu link đó vào database. Nếu chọn ảnh, hệ thống sẽ upload lên Supabase Storage rồi lưu link public vào database.
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

import { useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/axios";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("auth_token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const response = await api.post(
        "/api/auth/change-password",
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
      setMessage(err?.response?.data?.message ?? "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8] px-4 py-10 text-[#111827]">
      <div className="w-full max-w-lg rounded-3xl border border-[#dfe8f5] bg-[#ffffff] p-8 shadow-[0_20px_40px_rgba(46,107,255,0.08)]">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-6 rounded-full border border-[#dfe8f5] bg-[#edf3ff] px-4 py-2 text-sm font-medium text-[#214ed6] transition hover:bg-[#dfeaff]"
        >
          ← Quay về trang chủ
        </button>

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#214ed6]">Security</p>
          <h1 className="mt-3 text-3xl font-black text-[#111827]">Đổi mật khẩu</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#4a5568]">Mật khẩu hiện tại</label>
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#dfe8f5] bg-[#f8faff] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2e6bff]"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#4a5568]">Mật khẩu mới</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#dfe8f5] bg-[#f8faff] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2e6bff]"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#4a5568]">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#dfe8f5] bg-[#f8faff] px-4 py-3 text-[#111827] outline-none transition focus:border-[#2e6bff]"
              required
            />
          </div>

          {message ? (
            <div className="rounded-xl border border-[#dfe8f5] bg-[#edf3ff] px-3 py-2 text-sm text-[#214ed6]">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2e6bff] px-4 py-3 font-bold text-[#f5f1e8] transition hover:bg-[#214ed6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
          </button>
        </form>
      </div>
    </main>
  );
}

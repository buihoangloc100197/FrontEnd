import { useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/axios";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
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

    if (form.password !== form.confirmPassword) {
      setMessage("Mật khẩu nhập lại không khớp");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/api/auth/register", {
        username: form.username,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setMessage(response.data.message);
      setTimeout(() => router.push("/auth/login"), 800);
    } catch (err: any) {
      setMessage(err?.response?.data?.message ?? "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f1e8] px-4 py-5 text-[#111827]">
      <div className="relative flex w-full max-w-[1200px] overflow-hidden rounded-[32px] border border-[#dfe8f5] bg-[#edf3ff] shadow-[0_28px_70px_rgba(46,107,255,0.14)]">
        <section className="relative hidden w-[52%] overflow-hidden px-8 py-8 text-white md:block lg:px-10 lg:py-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#2e6bff] via-[#214ed6] to-[#111827]" />
          <div className="absolute -left-12 top-0 h-52 w-52 rounded-full border-[16px] border-white/25" />
          <div className="absolute left-10 top-8 h-72 w-72 rounded-full border-[12px] border-white/10" />

          <div className="absolute left-0 top-0 h-full w-full opacity-80">
            <div className="absolute -left-8 top-0 h-[130%] w-[78%] rounded-[42%] border-[3px] border-white/30" />
            <div className="absolute -left-6 bottom-[-34px] h-[52%] w-[72%] rounded-[40%] border-[3px] border-white/30" />
            <div className="absolute left-[18%] top-[9%] h-[78%] w-[62%] rounded-[48%] border-[3px] border-white/30" />
          </div>

          <div className="absolute right-8 top-8 flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-3xl font-light text-white">
            +
          </div>
          <div className="absolute right-12 top-28 h-5 w-5 rounded-full border border-white/40 bg-white/10" />
          <div className="absolute right-24 top-20 h-10 w-10 rounded-full border border-white/40" />
          <div className="absolute bottom-14 right-12 h-16 w-16 rounded-full border border-white/40" />
          <div className="absolute bottom-16 left-20 h-12 w-12 rounded-full border border-white/40" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-14 w-14 rounded-full border-[3px] border-white/60 bg-white/5" />
              <div className="text-4xl font-light text-white/80">+</div>
            </div>

            <div className="pb-8">
              <h1 className="max-w-[420px] text-[54px] font-black leading-[0.96] tracking-[-0.06em] text-white">
                Create Account
              </h1>
              <p className="mt-5 max-w-[420px] text-[25px] font-medium leading-[1.3] text-white/90">
                Sign up to manage your profile and access your account.
              </p>
            </div>
          </div>
        </section>

        <section className="relative w-full bg-[#f4f9ff] p-7 md:w-[48%] md:p-9 lg:p-10">
          <div className="mx-auto max-w-[430px] pt-6 md:pt-10">
            <h2 className="text-[58px] font-light leading-none tracking-[-0.08em] text-[#5d6776]">Sign Up</h2>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-[#4a5568]">👤</span>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="w-full rounded-full border border-[#dfe8f5] bg-white px-14 py-4 text-lg text-[#111827] outline-none transition placeholder:text-[#7a8599] focus:border-[#2e6bff] focus:shadow-[0_0_0_3px_rgba(46,107,255,0.12)]"
                  required
                />
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-[#4a5568]">🔒</span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full rounded-full border border-[#dfe8f5] bg-white px-14 py-4 text-lg text-[#111827] outline-none transition placeholder:text-[#7a8599] focus:border-[#2e6bff] focus:shadow-[0_0_0_3px_rgba(46,107,255,0.12)]"
                  required
                />
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-[#4a5568]">🔐</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full rounded-full border border-[#dfe8f5] bg-white px-14 py-4 text-lg text-[#111827] outline-none transition placeholder:text-[#7a8599] focus:border-[#2e6bff] focus:shadow-[0_0_0_3px_rgba(46,107,255,0.12)]"
                  required
                />
              </div>

              {message ? (
                <p className="rounded-2xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-700">
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-gradient-to-r from-[#2e6bff] to-[#214ed6] px-6 py-4 text-[30px] font-bold leading-none text-[#f5f1e8] shadow-[0_12px_24px_rgba(46,107,255,0.30)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Đang đăng ký..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-8 text-center text-[18px] text-[#4a5568]">
              Already have an account? <button type="button" onClick={() => router.push("/auth/login")} className="font-semibold text-[#2e6bff] hover:text-[#214ed6]">Sign In</button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

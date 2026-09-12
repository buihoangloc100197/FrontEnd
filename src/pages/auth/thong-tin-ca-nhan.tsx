import { useRouter } from "next/router";

export default function PersonalInfoPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-6 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
        >
          ← Quay về trang chủ
        </button>

        <section className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 shadow-2xl shadow-cyan-950/30">
          <div className="border-b border-white/10 px-6 py-6 md:px-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Thông tin cá nhân
            </p>
            <h1 className="text-3xl font-black text-white md:text-5xl">Bùi Hoàng Lộc</h1>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Họ và tên</p>
              <p className="mt-2 text-xl font-bold text-white">Bùi Hoàng Lộc</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Lớp</p>
              <p className="mt-2 text-xl font-bold text-white">25CT401</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Chuyên ngành</p>
              <p className="mt-2 text-xl font-bold text-white">Công Nghệ Thông Tin</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Email cá nhân</p>
              <p className="mt-2 break-all text-xl font-bold text-white">buihoangloc100197@gmail.com</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Số điện thoại</p>
              <p className="mt-2 text-xl font-bold text-white">0382619269</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Tình trạng</p>
              <p className="mt-2 text-xl font-bold text-emerald-300">Sẵn sàng làm việc</p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <h2 className="mb-5 text-2xl font-bold text-white">Kinh nghiệm và kỹ năng chính</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-cyan-300">Kinh nghiệm làm việc</h3>
              <ul className="space-y-3 text-slate-300">
                <li>• 8 năm vận hành máy CNC 2D</li>
                <li>• 1 năm kinh nghiệm máy tiện cơ</li>
                <li>• 1 năm kinh nghiệm máy phay cơ</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-cyan-300">Kỹ năng chuyên môn</h3>
              <ul className="space-y-3 text-slate-300">
                <li>• Biết cơ bản các lệnh G-code CNC bán tự động</li>
                <li>• Biết sử dụng máy mài phẳng</li>
                <li>• Biết sử dụng máy cưa đứng và máy cưa nằm</li>
                <li>• Hỗ trợ gia công tool, jig và các máy móc phục vụ sản xuất</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

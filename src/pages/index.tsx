import { Geist, Geist_Mono } from "next/font/google";
import { useRouter } from "next/router";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const skillGroups = [
  "G-code CNC bán tự động",
  "Máy CNC 2D",
  "Máy tiện cơ",
  "Máy phay cơ",
  "Máy mài phẳng",
  "Máy cưa đứng",
  "Máy cưa nằm",
  "Gia công jig/tool",
  "Đọc kỹ thuật, chuẩn bị nguyên liệu",
  "Hỗ trợ sản xuất và bảo trì cơ bản",
];

const experiences = [
  {
    period: "8 năm",
    title: "Vận hành máy CNC 2D",
    description:
      "Thực hiện gia công phụ kiện, chi tiết cơ khí theo bản vẽ kỹ thuật và quy trình sản xuất. Tập trung vào độ chính xác, tốc độ và kiểm soát chất lượng.",
  },
  {
    period: "1 năm",
    title: "Máy tiện cơ",
    description:
      "Tham gia gia công chi tiết tròn, kiểm tra kích thước, điều chỉnh dụng cụ và tối ưu quy trình thao tác trên máy tiện.",
  },
  {
    period: "1 năm",
    title: "Máy phay cơ",
    description:
      "Xử lý khối phôi, tạo hình và phụ kiện theo yêu cầu kỹ thuật, phối hợp với bộ phận sản xuất để đảm bảo tiến độ.",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <main
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-950 text-slate-100`}
    >
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <header className="sticky top-0 z-50 mb-10 rounded-full border border-white/10 bg-slate-900/70 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 font-semibold text-slate-950">
                BL
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">Portfolio</p>
                <h1 className="text-sm font-bold tracking-wide text-white">
                  Bùi Hoàng Lộc
                </h1>
              </div>
            </div>

            <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
              <a href="#about" className="transition hover:text-white">Giới thiệu</a>
              <a href="#experience" className="transition hover:text-white">Kinh nghiệm</a>
              <a href="#skills" className="transition hover:text-white">Kỹ năng</a>
              <a href="#contact" className="transition hover:text-white">Liên hệ</a>
            </nav>

            <button
              type="button"
              onClick={() => router.push("/auth/thong-tin-ca-nhan")}
              className="rounded-full border border-cyan-400/60 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
            >
              Thông Tin Cá Nhân
            </button>
          </div>
        </header>

        <section className="grid items-center gap-10 pb-16 pt-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              CNC Machinist / Production Specialist
            </p>
            <h2 className="max-w-xl text-4xl font-black leading-tight text-white md:text-6xl">
              Bùi Hoàng Lộc
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-300 md:text-xl">
              Chuyên ngành Công Nghệ Thông Tin, với nền tảng kỹ thuật thực tế trong
              gia công cơ khí, vận hành máy CNC và hỗ trợ sản xuất công nghiệp.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#experience"
                className="rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Xem kinh nghiệm
              </a>
              <a
                href="#skills"
                className="rounded-full border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
              >
                Kỹ năng của tôi
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-2xl font-bold text-cyan-300">8+</p>
                <p className="mt-1 text-sm text-slate-300">Năm vận hành CNC 2D</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-2xl font-bold text-cyan-300">3</p>
                <p className="mt-1 text-sm text-slate-300">Loại máy gia công chính</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-2xl font-bold text-cyan-300">100%</p>
                <p className="mt-1 text-sm text-slate-300">Tập trung sản xuất & độ chính xác</p>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 p-6 shadow-2xl shadow-cyan-950/30">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-xl font-black text-slate-950">
                BL
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Sẵn sàng làm việc
              </span>
            </div>

            <div className="space-y-4 text-sm text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-slate-400">Lớp</p>
                <p className="mt-1 text-base font-semibold text-white">25CT401</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-slate-400">Chuyên ngành</p>
                <p className="mt-1 text-base font-semibold text-white">
                  Công Nghệ Thông Tin
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-slate-400">Mục tiêu</p>
                <p className="mt-1 text-base font-semibold text-white">
                  Ứng dụng kỹ thuật và tư duy công nghiệp vào môi trường sản xuất hiện đại.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section id="about" className="grid gap-8 py-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Giới thiệu
            </p>
            <h3 className="text-3xl font-bold text-white">Tôi là người làm việc thực tế, tỉ mỉ và có trách nhiệm.</h3>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-7 text-lg leading-8 text-slate-300">
            Tôi có 8 năm kinh nghiệm vận hành máy CNC 2D, cùng với 1 năm kinh nghiệm
            ở máy tiện cơ và 1 năm ở máy phay cơ. Tôi quen với các thao tác gia công,
            kiểm tra kích thước, điều chỉnh thiết bị và đảm bảo quy trình sản xuất ổn định.
            Ngoài ra, tôi biết sử dụng các loại máy hỗ trợ như máy mài phẳng, máy cưa
            đứng, máy cưa nằm và có khả năng hỗ trợ gia công jig, tool, thiết bị phụ trợ
            trong sản xuất.
          </div>
        </section>

        <section id="experience" className="py-6">
          <p className="mb-8 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Kinh nghiệm làm việc
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {experiences.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-cyan-400/40"
              >
                <div className="mb-4 inline-flex rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                  {item.period}
                </div>
                <h4 className="text-2xl font-bold text-white">{item.title}</h4>
                <p className="mt-4 text-base leading-7 text-slate-300">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className="py-20">
          <p className="mb-8 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Kỹ năng & kỹ thuật
          </p>
          <div className="flex flex-wrap gap-3">
            {skillGroups.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        <section id="contact" className="pb-20 pt-8">
          <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 via-slate-900 to-blue-500/10 p-8 md:p-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Liên hệ
            </p>
            <h3 className="text-3xl font-bold text-white md:text-4xl">
              Sẵn sàng đóng góp cho môi trường sản xuất, gia công và quy trình kỹ thuật.
            </h3>
            <div className="mt-6 flex flex-wrap gap-4">
              <a
                href="mailto:locbui@example.com"
                className="rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Gửi Email
              </a>
              <a
                href="#top"
                className="rounded-full border border-slate-700 bg-slate-900 px-5 py-3 font-semibold text-white transition hover:border-slate-500"
              >
                Về đầu trang
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


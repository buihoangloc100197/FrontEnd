import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { MainLayout } from "@/components/layout/MainLayout";
import { appConfig } from "@/lib/env";

type ApiResponse = {
  message: string;
  status: string;
  database: string;
  databasePath: string;
  tableCount: number;
  timestamp: string;
  env: {
    appName: string;
    baseUrl: string;
    apiKeySet: boolean;
  };
};

export default function Home() {
  const router = useRouter();
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/auth/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ApiResponse>("/api/hello");
        setApiData(response.data);
      } catch (error) {
        console.error("Failed to load API data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <MainLayout title="Dashboard">
      <div className="mx-auto max-w-6xl space-y-8 pb-12">
        <section className="rounded-3xl border border-[#dfe8f5] bg-[#ffffff]/90 p-8 shadow-[0_18px_40px_rgba(46,107,255,0.10)] backdrop-blur-sm">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-6">
              <span className="inline-flex items-center rounded-full border border-[#2e6bff]/30 bg-[#edf3ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#214ed6]">
                Next.js + SQLite + API
              </span>

              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-[#111827] sm:text-5xl">
                  {appConfig.appName}
                </h1>
                <p className="text-lg text-[#4a5568]">
                  Dự án mẫu với giao diện đẹp bằng Tailwind, API Next.js và database SQLite lưu trong thư mục data.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={appConfig.siteUrl}
                  className="rounded-xl bg-[#2e6bff] px-5 py-3 font-semibold text-[#f5f1e8] transition hover:bg-[#214ed6]"
                >
                  Truy cập site
                </a>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="rounded-xl border border-[#dfe8f5] bg-[#edf3ff] px-5 py-3 font-semibold text-[#111827] transition hover:border-[#2e6bff] hover:text-[#214ed6]"
                >
                  Tải lại
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-[#e85d75]/30 bg-[#fff1f3] px-5 py-3 font-semibold text-[#b4233b] transition hover:bg-[#ffe4e8]"
                >
                  Đăng xuất
                </button>
              </div>
            </div>

            <div className="grid w-full max-w-md gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {[
                { label: "API", value: "Axios" },
                { label: "Frontend", value: "Next.js" },
                { label: "DB", value: "SQLite" },
                { label: "UI", value: "Tailwind" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#dfe8f5] bg-[#f8faff] p-4 text-left shadow-[0_10px_20px_rgba(46,107,255,0.04)]"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[#4a5568]">{item.label}</p>
                  <p className="mt-2 text-xl font-bold text-[#111827]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-[#dfe8f5] bg-[#ffffff] p-6 shadow-[0_10px_24px_rgba(17,24,39,0.03)]">
            <p className="text-sm uppercase tracking-[0.2em] text-[#4a5568]">Domain</p>
            <p className="mt-3 text-2xl font-bold text-[#111827]">{appConfig.siteUrl}</p>
          </div>
          <div className="rounded-2xl border border-[#dfe8f5] bg-[#ffffff] p-6 shadow-[0_10px_24px_rgba(17,24,39,0.03)]">
            <p className="text-sm uppercase tracking-[0.2em] text-[#4a5568]">API URL</p>
            <p className="mt-3 text-2xl font-bold text-[#111827]">{appConfig.apiBaseUrl}</p>
          </div>
          <div className="rounded-2xl border border-[#dfe8f5] bg-[#ffffff] p-6 shadow-[0_10px_24px_rgba(17,24,39,0.03)]">
            <p className="text-sm uppercase tracking-[0.2em] text-[#4a5568]">Key</p>
            <p className="mt-3 text-2xl font-bold text-[#111827]">
              {appConfig.apiKey ? "Đã cấu hình" : "Chưa có"}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-[#dfe8f5] bg-[#ffffff]/90 p-8 shadow-[0_16px_30px_rgba(46,107,255,0.05)]">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-[#111827]">Kết quả API</h2>
            <span className="rounded-full border border-[#2dbe6a]/30 bg-[#eafaf0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#1b8a4b]">
              {loading ? "Đang tải" : "Sẵn sàng"}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 text-[#4a5568]">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2e6bff] border-t-transparent" />
              Đang kết nối đến API...
            </div>
          ) : apiData ? (
            <div className="space-y-3 text-[#374151]">
              <p>
                <span className="font-semibold text-[#111827]">Message:</span> {apiData.message}
              </p>
              <p>
                <span className="font-semibold text-[#111827]">Status:</span> {apiData.status}
              </p>
              <p>
                <span className="font-semibold text-[#111827]">Database:</span> {apiData.database}
              </p>
              <p>
                <span className="font-semibold text-[#111827]">SQLite path:</span> {apiData.databasePath}
              </p>
              <p>
                <span className="font-semibold text-[#111827]">Rows in settings:</span> {apiData.tableCount}
              </p>
              <p>
                <span className="font-semibold text-[#111827]">API key:</span>{" "}
                {apiData.env.apiKeySet ? "Đã cấu hình" : "Không được cấu hình"}
              </p>
              <p>
                <span className="font-semibold text-[#111827]">Timestamp:</span> {apiData.timestamp}
              </p>
            </div>
          ) : (
            <p className="text-[#b4233b]">Không thể gọi API. Vui lòng kiểm tra lại server.</p>
          )}
        </section>

        <section className="space-y-4 rounded-3xl border border-[#dfe8f5] bg-[#ffffff]/90 p-8 shadow-[0_16px_30px_rgba(46,107,255,0.04)]">
          <h2 className="text-2xl font-bold text-[#111827]">Nội dung dài</h2>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="rounded-2xl border border-[#dfe8f5] bg-[#f8faff] p-4 text-[#4a5568] shadow-[0_8px_18px_rgba(46,107,255,0.03)]">
              Mục nội dung #{item}: Đây là phần body có thể cuộn riêng trong layout, không ảnh hưởng đến body toàn trang.
            </div>
          ))}
        </section>
      </div>
    </MainLayout>
  );
}


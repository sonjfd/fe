import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCurrentApp } from "@/components/context/AppContext";

export default function NotFoundPage() {
  const { user, isAuthenticated } = useCurrentApp();

  // ---- xác định link nút quay lại ----
  const backHref = useMemo(() => {
    if (isAuthenticated && user?.role) {
      const role = user.role || user.role; // tuỳ bạn lưu role dạng object hay string
      if (role === "ADMIN") return "/admin";
    }
    return "/";
  }, [user, isAuthenticated]);

  const backLabel = backHref === "/" ? "Quay lại trang chủ" : "Quay lại trang quản trị";

  return (
    <main
      role="main"
      aria-labelledby="error-title"
      className="min-h-screen flex items-center justify-center bg-slate-50 p-6"
    >
      <section className="w-full max-w-5xl bg-white rounded-2xl p-8 shadow-xl">
        <header className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Mã lỗi <b className="text-sky-500 tracking-wide">404</b>
          </p>
        </header>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h1 id="error-title" className="text-4xl font-semibold">
              Không tìm thấy trang
            </h1>
            <p className="mt-2 text-slate-700">
              Trang bạn tìm không tồn tại hoặc đã bị xoá.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                className="px-4 py-3 rounded-xl bg-sky-500 text-white hover:bg-sky-600"
                to={backHref}
              >
                {backLabel}
              </Link>
            </div>

            <footer className="text-xs text-slate-500 mt-4">Mã tham chiếu: n/a</footer>
          </div>

          <div className="order-first md:order-last">
            {/* Illustration SVG giữ như cũ */}
            <svg
              viewBox="0 0 400 300"
              className="w-full h-auto"
              role="img"
              aria-label="Minh hoạ"
            >
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0" stopColor="#e2e8f0" />
                  <stop offset="1" stopColor="#f8fafc" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="400" height="300" fill="url(#g)" />
              <g transform="translate(50,60)">
                <rect
                  x="0"
                  y="0"
                  width="300"
                  height="180"
                  rx="16"
                  fill="#ffffff"
                  stroke="#e5e7eb"
                />
                <rect x="20" y="24" width="260" height="16" rx="8" fill="#e5e7eb" />
                <rect x="20" y="52" width="180" height="16" rx="8" fill="#e5e7eb" />

                <circle cx="130" cy="130" r="36" fill="#0ea5e9" opacity="0.18" />
                <text x="20" y="160" fontSize="48" fontWeight="700" fill="#0ea5e9" opacity="0.35">
                  404
                </text>
              </g>
            </svg>
          </div>
        </div>
      </section>
    </main>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export type ErrorCode = 403 | 404 | 429 | 500 | 502 | 503 | 504;

type ErrorPageProps = {
  code: ErrorCode;
  title?: string;
  message?: string;
  traceId?: string;
  eta?: string;
  retrySeconds?: number;
  onSearchSubmit?: (query: string) => void; // nếu không dùng, có thể xoá cả form search bên dưới
  showBack?: boolean;
  onBack?: () => void;
  backHrefFallback?: string;
  illustrationSrc?: string;

  /** NEW: chỉ định trang chủ và nhãn nút */
  homeHref?: string; // mặc định "/"
  homeLabel?: string; // mặc định "Trang chủ"
};

function getDefaults(code: ErrorCode) {
  switch (code) {
    case 404:
      return {
        title: "Không tìm thấy trang",
        message:
          "Trang bạn tìm có thể đã bị xoá hoặc di chuyển. Hãy thử tìm kiếm hoặc quay lại.",
      };
    case 403:
      return {
        title: "Bạn không có quyền truy cập",
        message:
          "Vui lòng đăng nhập bằng tài khoản có quyền phù hợp hoặc liên hệ hỗ trợ để được cấp quyền.",
      };
    case 429:
      return {
        title: "Bạn thao tác quá nhanh",
        message:
          "Để bảo vệ hệ thống, chúng tôi tạm thời giới hạn yêu cầu. Vui lòng thử lại sau ít phút.",
      };
    case 502:
    case 503:
    case 504:
      return {
        title: "Hệ thống đang bảo trì",
        message:
          "Chúng tôi đang nâng cấp để phục vụ bạn tốt hơn. Cảm ơn bạn đã chờ!",
      };
    case 500:
    default:
      return {
        title: "Có lỗi xảy ra",
        message: "Xin lỗi vì sự bất tiện. Hãy thử làm mới hoặc quay lại.",
      };
  }
}

function Illustration({ code }: { code: ErrorCode }) {
  const accent =
    code === 404
      ? "#0ea5e9"
      : code === 403
      ? "#f59e0b"
      : code === 429
      ? "#8b5cf6"
      : code >= 500
      ? "#ef4444"
      : "#0ea5e9";
  return (
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
        <circle cx="60" cy="130" r="26" fill={accent} opacity="0.12" />
        <circle cx="130" cy="130" r="36" fill={accent} opacity="0.18" />
        <circle cx="210" cy="130" r="22" fill={accent} opacity="0.12" />
        <text
          x="20"
          y="160"
          fontSize="48"
          fontWeight="700"
          fill={accent}
          opacity="0.35"
        >
          {code}
        </text>
      </g>
    </svg>
  );
}

export default function ErrorPage({
  code,
  title,
  message,
  traceId,
  eta,
  retrySeconds,
  onSearchSubmit,
  illustrationSrc,
  homeHref = "/",
  homeLabel = "Trang chủ",
}: ErrorPageProps) {
  const { title: dTitle, message: dMessage } = useMemo(
    () => getDefaults(code),
    [code]
  );
  const [query, setQuery] = useState("");
  const [remaining, setRemaining] = useState<number | null>(
    code === 429 ? retrySeconds ?? 30 : null
  );

  useEffect(() => {
    if (remaining === null || remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => (r ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  return (
    <main
      role="main"
      aria-labelledby="error-title"
      className="min-h-screen flex items-center justify-center bg-slate-50 p-6"
    >
      <section className="w-full max-w-5xl bg-white rounded-2xl p-8 shadow-xl">
        <header className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Mã lỗi <b className="text-sky-500 tracking-wide">{code}</b>
          </p>
        </header>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h1 id="error-title" className="text-4xl font-semibold">
              {title ?? dTitle}
            </h1>
            <p className="mt-2 text-slate-700">{message ?? dMessage}</p>

            {code === 429 && remaining !== null && remaining > 0 && (
              <p className="mt-2 text-sm text-slate-500" aria-live="polite">
                Bạn có thể thử lại sau <b>{remaining}s</b>.
              </p>
            )}

            {(code === 502 || code === 503 || code === 504) && eta && (
              <p className="mt-2 text-sm text-slate-500">
                Dự kiến hoàn tất: <b>{eta}</b>
              </p>
            )}

            {/* (Tuỳ chọn) ô tìm kiếm – xoá nếu không dùng */}
            {onSearchSubmit && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSearchSubmit(query);
                }}
                className="mt-5 flex gap-3"
                role="search"
                aria-label="Tìm kiếm sản phẩm"
              >
                <input
                  type="search"
                  placeholder="Tìm sản phẩm…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-sky-400"
                />
                <button
                  type="submit"
                  className="px-4 py-3 rounded-xl bg-sky-500 text-white hover:bg-sky-600"
                >
                  Tìm kiếm
                </button>
              </form>
            )}

            {/* Actions: chỉ 2 lựa chọn Back / Home */}
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                className="px-4 py-3 rounded-xl bg-sky-500 text-white hover:bg-sky-600"
                to={homeHref}
              >
                {homeLabel}
              </Link>
            </div>

            <footer className="text-xs text-slate-500 mt-4">
              Mã tham chiếu: {traceId ?? "n/a"}
            </footer>
          </div>

          <div className="order-first md:order-last">
            {illustrationSrc ? (
              <img
                src={illustrationSrc}
                alt="Minh hoạ"
                className="w-full h-auto rounded-2xl shadow-md"
              />
            ) : (
              <Illustration code={code} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

/* Variants */
export function NotFoundPage(props: Omit<ErrorPageProps, "code">) {
  return <ErrorPage code={404} {...props} />;
}
export function ForbiddenPage(props: Omit<ErrorPageProps, "code">) {
  return <ErrorPage code={403} {...props} />;
}
export function RateLimitPage(props: Omit<ErrorPageProps, "code">) {
  return <ErrorPage code={429} {...props} />;
}
export function MaintenancePage(
  props: Omit<ErrorPageProps, "code"> & { eta?: string }
) {
  return <ErrorPage code={503} {...props} />;
}
export function ServerErrorPage(props: Omit<ErrorPageProps, "code">) {
  return <ErrorPage code={500} {...props} />;
}

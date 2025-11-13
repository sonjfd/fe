// src/ProtectedRoute.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useCurrentApp } from "@/components/context/AppContext"; // { isAuthenticated, user, loading? }

type Role = string; // "admin" | "Customer"

interface IProps {
  children: React.ReactNode;
  requireAuth?: boolean; // mặc định true
  allowedRoles?: Role[]; // ví dụ: ["admin"] hoặc ["Customer"]
}

function BackOrHome({
  homeHref = "/",
  homeLabel = "Trang chủ",
  showLogin,
  loginHref,
  extraAdminLink,
}: {
  homeHref?: string;
  homeLabel?: string;
  showLogin?: boolean;
  loginHref?: string;
  extraAdminLink?: { href: string; label: string };
}) {
  const handleBack = () => {
    if (typeof window !== "undefined") {
      if (window.history.length > 1) return window.history.back();
      window.location.href = homeHref;
    }
  };
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      <button
        onClick={handleBack}
        className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50"
      >
        Quay lại
      </button>
      <Link
        to={homeHref}
        className="px-4 py-3 rounded-xl bg-sky-500 text-white hover:bg-sky-600"
      >
        {homeLabel}
      </Link>
      {extraAdminLink && (
        <Link
          to={extraAdminLink.href}
          className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50"
        >
          {extraAdminLink.label}
        </Link>
      )}
      {showLogin && loginHref && (
        <Link
          to={loginHref}
          className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50"
        >
          Đăng nhập
        </Link>
      )}
    </div>
  );
}

function ErrorCard({
  code,
  title,
  message,
  children,
}: {
  code: number | string;
  title: string;
  message?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-2xl bg-white rounded-2xl p-8 shadow-xl">
        <p className="text-sm text-slate-500">
          Mã lỗi <b className="text-sky-500 tracking-wide">{code}</b>
        </p>
        <h1 className="text-3xl font-semibold mt-2">{title}</h1>
        {message && <p className="mt-2 text-slate-700">{message}</p>}
        {children}
      </section>
    </main>
  );
}

const ProtectedRoute = ({ children, requireAuth = true }: IProps) => {
  const { isAuthenticated, user, isAppLoading } = useCurrentApp();

  const path = location.pathname;
  const isAdminPath = path.startsWith("/admin");

  // Tạm coi "đang tải user" nếu: có token nhưng chưa có user
  const isLoading = isAppLoading ?? (isAuthenticated && !user);
  if (isLoading) {
    return (
      <main className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Đang tải…</div>
      </main>
    );
  }

  // 1) 401 – chưa đăng nhập
  if (requireAuth && !isAuthenticated) {
    const redirect = encodeURIComponent(path + location.search);
    return (
      <ErrorCard
        code={401}
        title="Bạn cần đăng nhập để tiếp tục"
        message="Vui lòng đăng nhập để truy cập trang này."
      >
        <BackOrHome showLogin loginHref={`/login?redirect=${redirect}`} />
      </ErrorCard>
    );
  }

  // Chuẩn hoá role string
  const rawRole = (user?.role as Role | undefined) ?? "";
  const role = rawRole.trim().toLowerCase(); // "admin" | "customer" | ""
  const isAdminRole = role === "admin";

  // 3) Quy tắc đặc biệt:
  // - Vào /admin nhưng không phải admin => 403
  if (isAuthenticated && isAdminPath && !isAdminRole) {
    return (
      <ErrorCard
        code={403}
        title="Bạn không có quyền truy cập khu vực quản trị"
        message="Vui lòng dùng tài khoản có quyền ADMIN."
      >
        <BackOrHome />
      </ErrorCard>
    );
  }

  // - Không ở /admin mà lại là admin => 403 + nút 'Về trang quản trị'
  if (isAuthenticated && !isAdminPath && isAdminRole) {
    return (
      <ErrorCard
        code={403}
        title="Trang này không dành cho tài khoản quản trị"
        message="Vui lòng truy cập khu vực quản trị để tiếp tục."
      >
        <BackOrHome
          extraAdminLink={{ href: "/admin", label: "Về trang quản trị" }}
        />
      </ErrorCard>
    );
  }

  // OK
  return <>{children}</>;
};

export default ProtectedRoute;

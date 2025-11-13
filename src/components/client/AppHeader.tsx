import React, { useState, useRef } from "react";
import logoUrl from "@/assets/img/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useCurrentApp } from "../context/AppContext";
import { logoutApi } from "@/api/auth.api";
import { toSlug } from "@/utils/slug";
import avatarDefault from "@/assets/img/avatar-default.png";

// ---------- util ----------
type ClassValue = string | false | null | undefined;
// eslint-disable-next-line react-refresh/only-export-components
export const cn = (...c: ClassValue[]) => c.filter(Boolean).join(" ");

export const Container: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className, children }) => (
  <div
    className={cn("mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6", className)}
  >
    {children}
  </div>
);

// ---------- Top strip ----------
export const TopStrip: React.FC = () => (
  <div className="w-full bg-slate-800 text-white text-xs">
    <Container className="py-2 flex items-center justify-between">
      <div className="flex items-center gap-4/"></div>
      <div className="hidden sm:flex items-center gap-4 opacity-90">
        <span>
          Hotline: <b>0987.863.174</b>
        </span>
        <span>hoặc xuyenbaochi1@gmail.com</span>
      </div>
    </Container>
  </div>
);

// ---------- Category nav ----------
export const CategoryNavBar: React.FC = () => (
  <div className="border-t border-slate-200">
    <Container>
      <nav className="flex items-center gap-6 py-3 text-sm overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
        <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
        {(
          [
            "TRANG CHỦ",
            "GIỚI THIỆU",
            "VẬN CHUYỂN",
            "THANH TOÁN",
            "TIN TỨC",
            "LIÊN HỆ",
          ] as const
        ).map((c) => (
          <Link
            key={c}
            to={toSlug(c)}
            className="whitespace-nowrap text-slate-700 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            {c}
          </Link>
        ))}
      </nav>
    </Container>
  </div>
);

// ---------- Account menu ----------
type UserView = { name: string; avatarUrl: string };

const AccountMenu: React.FC<{
  userView: UserView | null;
  onLogin: () => void;
  onLogout: () => Promise<void> | void;
}> = ({ userView, onLogin, onLogout }) => {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);
  const show = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    timer.current = window.setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {/* Trigger */}
      {userView ? (
        <button
          className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <img
            src={userView?.avatarUrl ? userView.avatarUrl : avatarDefault}
            alt={userView.name}
            className="h-8 w-8 rounded-full object-cover border border-slate-200"
          />
          <span className="hidden sm:block text-sm text-slate-700">
            {userView.name.split(" ")[0]}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" />
          </svg>
        </button>
      ) : (
        <button
          className="text-sm text-slate-700 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          Tài khoản
        </button>
      )}

      {/* Popover */}
      <div
        className={cn(
          "absolute right-0 top-full mt-2 w-[280px] rounded-2xl border border-slate-200 bg-white shadow-xl transition-all",
          open
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-1"
        )}
        role="menu"
      >
        <div className="absolute -top-2 right-6 h-4 w-4 rotate-45 bg-white border-t border-l border-slate-200" />
        {!userView ? (
          <div className="p-4 text-center">
            <p className="text-sm text-slate-700 leading-5">
              Đăng nhập để nhận ưu đãi khi mua hàng!
            </p>
            <button
              onClick={onLogin}
              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-5 py-2 text-white text-base font-medium hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Đăng nhập
            </button>
            <p className="mt-3 text-sm text-slate-600">
              Bạn chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-semibold text-cyan-600 hover:underline"
              >
                Đăng ký
              </Link>
            </p>
          </div>
        ) : (
          <ul className="py-2 text-sm">
            <li>
              <Link
                to="/tai-khoan/ho-so"
                className="block px-4 py-2 hover:bg-slate-50 text-slate-700"
                role="menuitem"
              >
                Tài khoản của tôi
              </Link>
            </li>
            <li>
              <Link
                to="/don-mua"
                className="block px-4 py-2 hover:bg-slate-50 text-slate-700"
                role="menuitem"
              >
                Đơn mua
              </Link>
            </li>
            <li>
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-rose-600"
                role="menuitem"
              >
                Đăng xuất
              </button>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

// ---------- Header ----------
export const AppHeader: React.FC = () => {
  const { user, isAuthenticated, setUser, setIsAuthenticated } =
    useCurrentApp();
  const navigate = useNavigate(); // Next.js: const router = useRouter()

  console.log(user);

  // Map dữ liệu IUser của bạn -> UserView hiển thị
  const userView: UserView | null =
    isAuthenticated && user
      ? {
          name: user.fullName,
          avatarUrl: user.avatar ?? avatarDefault,
        }
      : null;

  const handleLogin = () => {
    // Tùy dự án: mở modal hoặc điều hướng
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      await logoutApi?.();
      localStorage.removeItem("access_token");
    } catch {
      // ignore or toast error
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      navigate("/"); // optional
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <TopStrip />
      <Container className="flex items-center justify-between py-3 gap-3">
        <div className="flex items-center gap-3">
          <button
            className="inline-flex p-2 rounded-md border border-slate-200 md:hidden hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            aria-label="Mở menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden
            >
              <path d="M4 6H20M4 12H20M4 18H20" />
            </svg>
          </button>
          <a
            href="/"
            className="flex items-center gap-3 font-extrabold text-xl tracking-tight"
          >
            <img
              src={logoUrl}
              alt="DSH Logo"
              className="h-10 w-auto object-contain"
            />
            <span className="text-slate-900 font-black leading-none tracking-wide">
              DSH <span className="font-semibold text-slate-600">STORE</span>
            </span>
          </a>
        </div>

        <div className="hidden md:flex flex-1 max-w-2xl">
          <label className="w-full flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-300">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              placeholder="Tìm kiếm"
              className="w-full outline-none text-sm placeholder:text-slate-400"
              aria-label="Tìm kiếm sản phẩm"
            />
          </label>
        </div>

        <div className="flex items-center gap-5">
          {/* Thay link “Tài khoản” bằng menu mới */}
          <AccountMenu
            userView={userView}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />

          <a
            href="#"
            aria-label="Giỏ hàng"
            className="relative text-slate-700 hover:text-indigo-700"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden
            >
              <path d="M6 6h15l-2 8H8L6 6z" />
              <path d="M6 6L5 3H3" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="17" cy="20" r="1.5" />
            </svg>
            <span className="absolute -right-2 -top-2 rounded-full bg-rose-600 text-white text-[10px] px-1.5">
              0
            </span>
          </a>
        </div>
      </Container>

      <CategoryNavBar />
    </header>
  );
};

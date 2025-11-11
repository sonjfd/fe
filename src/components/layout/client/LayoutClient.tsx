import { AppFooter } from "@/components/client/AppFooter";
import { AppHeader } from "@/components/client/AppHeader";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

export const ScrollToTopOnRouteChange: React.FC = () => {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.replace("#", ""));
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
      return;
    }
    // 'instant' isn't standard; use auto for immediate
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search, hash]);
  return null;
};

export const SkipToContent: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-black focus:px-3 focus:py-2 focus:text-white"
  >
    Bỏ qua tới nội dung
  </a>
);

export const FloatingScrollTopButton: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow((window.scrollY || document.documentElement.scrollTop) > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Cuộn lên đầu trang"
      className="fixed bottom-6 right-6 z-50 rounded-full bg-slate-800 text-white shadow-lg px-3 py-3 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
    >
      {/* mũi tên lên */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </button>
  );
};

export const LayoutClient: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SkipToContent />
      <AppHeader />
      <ScrollToTopOnRouteChange />
      <main id="main-content" className="min-h-[60vh]">
        <Outlet />
      </main>
      <FloatingScrollTopButton />
      <AppFooter />
    </div>
  );
};

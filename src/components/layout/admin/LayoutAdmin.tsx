import { logoutApi } from "@/api/auth.api";
import { useCurrentApp } from "@/components/context/AppContext";
import React from "react";
import {
  Link,
  Outlet,
  useLocation,
  matchPath,
  useNavigate,
} from "react-router-dom";

/* ====== Minimal icons (SVG inline) ====== */
const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d={d} />
  </svg>
);
const I = {
  dashboard: "M3 3h8v8H3V3zm10 0h8v5h-8V3zM3 13h5v8H3v-8zm7 0h11v8H10v-8z",
  users:
    "M16 11a3 3 0 100-6 3 3 0 000 6zM8 11a3 3 0 100-6 3 3 0 000 6zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm8 0c-2.33 0-4.67.67-6 1.76 2.37.6 4 1.6 4 3.24V19h8v-2c0-2.66-5.33-4-6-4z",
  box: "M21 16V8a1 1 0 00-.553-.894l-8-4a1 1 0 00-.894 0l-8 4A1 1 0 003 8v8a1 1 0 00.553.894l8 4a1 1 0 00.894 0l8-4A1 1 0 0021 16zM12 5.236L18.764 8.6 12 11.964 5.236 8.6 12 5.236zM5 10.382l6 3v5.8l-6-3v-5.8zm8 8.8v-5.8l6-3V16.2l-6 3z",
  tag: "M21.41 11.58l-9-9A2 2 0 0011 2H4a2 2 0 00-2 2v7a2 2 0 00.59 1.41l9 9a2 2 0 002.82 0l7-7a2 2 0 000-2.83zM6.5 8A1.5 1.5 0 118 6.5 1.5 1.5 0 016.5 8z",
  order:
    "M7 18a2 2 0 11-2 2 2 2 0 012-2zm10 0a2 2 0 11-2 2 2 2 0 012-2zM6.42 15L5 12H3V6h2l3.6 7.59-.44.81C7.16 15.37 8 17 9.5 17H19v-2H9.42a.25.25 0 01-.26-.24l.01-.05.99-1.45z",
  warehouse: "M4 10l8-5 8 5v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-9z",
  images:
    "M19 3H5a2 2 0 00-2 2v14l4-4h12a2 2 0 002-2V5a2 2 0 00-2-2zm-9 8l2.03 2.71 2.97-3.71L19 14H7l3-3zM8 8a2 2 0 114.001.001A2 2 0 018 8z",
  fold: "M3 6h18v2H3V6zm0 5h12v2H3v-2zm0 5h18v2H3v-2z",
  unfold: "M3 6h18v2H3V6zm6 5h12v2H9v-2zm-6 5h18v2H3v-2z",
  logout:
    // Cửa ra (đăng xuất)
    "M16 13v-2H8V8l-5 4 5 4v-3h8zm3-10h-7v2h7v14h-7v2h7a2 2 0 002-2V5a2 2 0 00-2-2z",
  contact:
    "M2 4a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H8l-4 4v-4H4a2 2 0 01-2-2V4zm4 3h12v2H6V7zm0 4h10v2H6v-2z",
};

/* ====== Menu config (CHỈ những mục cần thiết) ====== */
export type MenuNode = {
  key: string;
  label: string;
  to?: string; // link có thể click
  pattern?: string; // chỉ để match active (có thể có :id)
  icon?: React.ReactNode;
  children?: MenuNode[];
};

const MENU: MenuNode[] = [
  {
    key: "dashboard",
    icon: <Icon d={I.dashboard} />,
    label: "Bảng điều khiển",
    to: "/admin",
  },

  {
    key: "users",
    icon: <Icon d={I.users} />,
    label: "Người dùng",
    to: "/admin/users",
  },

  {
    key: "products",
    icon: <Icon d={I.box} />,
    label: "Sản phẩm",
    to: "/admin/products",
  },

  {
    key: "categories",
    icon: <Icon d={I.tag} />,
    label: "Danh mục",
    to: "/admin/categories",
  },

  {
    key: "orders",
    icon: <Icon d={I.order} />,
    label: "Đơn hàng",
    children: [
      { key: "order-list", label: "Danh sách", to: "/admin/orders" },
      {
        key: "order-detail",
        label: "Chi tiết (đang xem)",
        pattern: "/admin/orders/:id",
      },
    ],
  },

  {
    key: "inventory",
    icon: <Icon d={I.warehouse} />,
    label: "Kho hàng",
    children: [
      { key: "warehouses", label: "Kho", to: "/admin/warehouses" },
      { key: "stock", label: "Tồn kho theo biến thể", to: "/admin/inventory" },
      {
        key: "purchase-orders",
        label: "Đơn mua hàng",
        to: "/admin/purchase-orders",
      },
      {
        key: "po-detail",
        label: "Chi tiết đơn mua (đang xem)",
        pattern: "/admin/purchase-orders/:id",
      },
    ],
  },

  {
    key: "sliders",
    icon: <Icon d={I.images} />,
    label: "Trình chiếu",
    children: [
      { key: "slider-list", label: "Danh sách", to: "/admin/sliders" },
      {
        key: "slider-detail",
        label: "Chi tiết (đang xem)",
        pattern: "/admin/sliders/:id",
      },
    ],
  },
  {
    key: "contacts",
    icon: <Icon d={I.contact} />,
    label: "Liên hệ",
    to: "/admin/contact-message",
  },
];

/* ====== Helpers ====== */
function cx(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

function useActive(pathname: string) {
  const flat: {
    key: string;
    to?: string;
    pattern?: string;
    parent?: string;
  }[] = [];
  const walk = (nodes: MenuNode[], parent?: string) => {
    for (const n of nodes) {
      flat.push({ key: n.key, to: n.to, pattern: n.pattern, parent });
      if (n.children) walk(n.children, n.key);
    }
  };
  walk(MENU);

  const candidates = flat
    .map((f) => {
      const target = f.pattern ?? f.to;
      if (!target) return null;
      const m = matchPath({ path: target, end: false }, pathname);
      return m ? { ...f, score: m.pattern.path.length } : null;
    })
    .filter(Boolean) as Array<{ key: string; parent?: string; score: number }>;

  const best = candidates.sort((a, b) => b.score - a.score)[0];
  return { activeKey: best?.key, openKey: best?.parent };
}

/* ====== Layout ====== */
export default function LayoutAdmin() {
  const { setUser, setIsAuthenticated } = useCurrentApp();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);
  const [openKeys, setOpenKeys] = React.useState<string[]>([]);
  const location = useLocation();
  const { activeKey, openKey } = useActive(location.pathname);

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

  React.useEffect(() => {
    if (openKey && !openKeys.includes(openKey)) {
      setOpenKeys((s) => [...s, openKey]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openKey]);

  const sidebarWidth = collapsed ? 72 : 232;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 z-40 h-screen border-r border-neutral-200 bg-white transition-[width] duration-300 flex flex-col"
        style={{ width: sidebarWidth }}
      >
        {/* Header brand */}
        <div className="flex h-14 items-center gap-2 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
            A
          </div>
          {!collapsed && <div className="font-semibold">Quản trị</div>}
        </div>

        {/* Nav */}
        <nav className="mt-2 px-2 flex-1 overflow-y-auto">
          {MENU.map((item) => (
            <MenuItem
              key={item.key}
              node={item}
              collapsed={collapsed}
              activeKey={activeKey}
              openKeys={openKeys}
              setOpenKeys={setOpenKeys}
            />
          ))}
        </nav>

        {/* Logout at bottom */}
        <div className="px-2 pb-3 pt-2 border-t border-neutral-200">
          <button
            onClick={handleLogout}
            className={cx(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
            )}
            aria-label="Đăng xuất"
            title={collapsed ? "Đăng xuất" : undefined}
          >
            <span className="shrink-0 text-neutral-500 group-hover:text-neutral-700">
              <Icon d={I.logout} />
            </span>
            {!collapsed && <span className="truncate">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div
        className="ml-0 transition-[margin-left] duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4">
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 hover:bg-neutral-50"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
            title={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
          >
            <Icon d={collapsed ? I.unfold : I.fold} />
          </button>
        </header>

        {/* Content */}
        <main className="p-4">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="select-none border-t border-neutral-200 py-3 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} — Fsoft Academy
        </footer>
      </div>
    </div>
  );
}

/* ====== Menu item (headless) ====== */
function MenuItem({
  node,
  collapsed,
  activeKey,
  openKeys,
  setOpenKeys,
}: {
  node: MenuNode;
  collapsed: boolean;
  activeKey?: string;
  openKeys: string[];
  setOpenKeys: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const isOpen = openKeys.includes(node.key);
  const isActive = activeKey === node.key;

  if (!node.children?.length) {
    const Inner = (
      <div
        className={cx(
          "group mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
          isActive
            ? "bg-neutral-900 text-white"
            : "text-neutral-700 hover:bg-neutral-100"
        )}
      >
        <span
          className={cx(
            "shrink-0",
            isActive
              ? "text-white"
              : "text-neutral-500 group-hover:text-neutral-700"
          )}
        >
          {node.icon}
        </span>
        {!collapsed && <span className="truncate">{node.label}</span>}
      </div>
    );
    return node.to ? <Link to={node.to}>{Inner}</Link> : <div>{Inner}</div>;
  }

  return (
    <div className="mt-1">
      <button
        onClick={() =>
          setOpenKeys((s) =>
            s.includes(node.key)
              ? s.filter((k) => k !== node.key)
              : [...s, node.key]
          )
        }
        className={cx(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100",
          isOpen && !collapsed && "bg-neutral-100"
        )}
        aria-expanded={isOpen}
      >
        <span className="shrink-0 text-neutral-500">{node.icon}</span>
        {!collapsed && <span className="flex-1 truncate">{node.label}</span>}
        {!collapsed && (
          <svg
            className={cx(
              "h-4 w-4 transition",
              isOpen ? "rotate-90" : "rotate-0"
            )}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      <div
        className={cx(
          "overflow-hidden pl-3 transition-[max-height] duration-300",
          isOpen ? "max-h-[1000px]" : "max-h-0"
        )}
        role="region"
        aria-hidden={!isOpen}
      >
        {node.children?.map((c) => (
          <MenuItem
            key={c.key}
            node={c}
            collapsed={collapsed}
            activeKey={activeKey}
            openKeys={openKeys}
            setOpenKeys={setOpenKeys}
          />
        ))}
      </div>
    </div>
  );
}

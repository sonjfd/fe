import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { connectAdminWs, disconnectAdminWs } from "@/api/admin.stocket";
import {
  getAllNotificationOfAdmin,
  updateNotificationOfAdmin,
} from "@/api/notification.api";

const AdminNotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const hasFetchedRef = useRef(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const mapTypeLabel = (type: AdminNotification["type"]) => {
    switch (type) {
      case "ORDER":
        return "Đơn hàng";
      case "CONTACT":
        return "Liên hệ";
      default:
        return "Khác";
    }
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("vi-VN");
    } catch {
      return iso;
    }
  };

  const loadData = async (p: number) => {
    if (p === 1) setInitialLoading(true);
    try {
      const res = await getAllNotificationOfAdmin(`page=${p}&size=10`);
      if (!res?.data) return;

      const items = res.data.items ?? [];

      setTotal(res.data.total);

      if (p === 1) {
        setNotifications(items);
      } else {
        setNotifications((prev) => {
          const merged = [...prev, ...items];
          const map = new Map<number, AdminNotification>();
          merged.forEach((n) => map.set(n.id, n));
          return Array.from(map.values());
        });
      }
    } finally {
      if (p === 1) setInitialLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    setPage(1);
    loadData(1);
  }, []);

  // WS realtime
  useEffect(() => {
    connectAdminWs((noti) => {
      setNotifications((prev) => {
        const newNoti: AdminNotification = {
          ...noti,
          createdAt: noti.createdAt || new Date().toISOString(),
        };

        const merged = [newNoti, ...prev];
        const map = new Map<number, AdminNotification>();
        merged.forEach((n) => map.set(n.id, n));
        return Array.from(map.values());
      });
      setTotal((t) => t + 1);
    });

    return () => {
      disconnectAdminWs();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 5 && !loadingMore) {
      if (notifications.length >= total) return;
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      await loadData(nextPage);
      setLoadingMore(false);
    }
  };

  const handleClickNotification = async (noti: AdminNotification) => {
    if (!noti.isRead) {
      await updateNotificationOfAdmin(noti.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
      );
    }

    if (noti.type === "ORDER") {
      navigate(`/admin/orders?id=${noti.referenceId}`);
    } else if (noti.type === "CONTACT") {
      navigate(`/admin/contact-message`);
    }

    setOpen(false);
  };

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50 hover:text-neutral-900"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path
            d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 0 0-4-5.659V4a2 2 0 1 0-4 0v1.341A6 6 0 0 0 6 11v5l-2 2v1h16v-1l-2-2Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-[6px] text-[11px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-[430px] rounded-xl border border-neutral-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-neutral-900">
                Thông báo
              </div>
              <div className="mt-0.5 text-xs text-neutral-500">
                Tổng: {total} thông báo, {unreadCount} chưa đọc
              </div>
            </div>

            {unreadCount > 0 && (
              <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>

          <div
            className="max-h-96 overflow-y-auto py-1 text-sm"
            onScroll={handleScroll}
          >
            {initialLoading && (
              <div className="px-4 py-3 text-xs text-neutral-400">
                Đang tải thông báo...
              </div>
            )}

            {!initialLoading && notifications.length === 0 && (
              <div className="px-4 py-3 text-xs text-neutral-500">
                Chưa có thông báo nào.
              </div>
            )}

            {!initialLoading &&
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className="flex cursor-pointer gap-3 px-4 py-3 hover:bg-neutral-50"
                >
                  {/* Dot read/unread */}
                  <div className="flex items-start pt-1">
                    <div
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        n.isRead ? "bg-neutral-300" : "bg-blue-500"
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Row 1: title + time */}
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`truncate text-[13px] font-semibold ${
                          n.isRead ? "text-neutral-700" : "text-neutral-900"
                        }`}
                      >
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-neutral-400">
                        {formatTime(n.createdAt)}
                      </span>
                    </div>

                    {/* Row 2: message */}
                    <p className="mt-1 text-[12px] text-neutral-700">
                      {n.message}
                    </p>

                    {/* Row 3: meta info */}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          n.type === "ORDER"
                            ? "bg-blue-50 text-blue-700"
                            : n.type === "CONTACT"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {mapTypeLabel(n.type)}
                      </span>

                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600">
                        Mã tham chiếu: #{n.referenceId}
                      </span>

                      <span className="rounded-full bg-neutral-50 px-2 py-0.5 text-neutral-500">
                        Người nhận: {n.receiver}
                      </span>

                      {!n.isRead && (
                        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-600">
                          Chưa đọc
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            {loadingMore && (
              <div className="text-center text-xs text-neutral-400 py-2">
                Đang tải thêm...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationBell;

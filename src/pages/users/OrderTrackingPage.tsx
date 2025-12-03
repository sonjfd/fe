import {
  getOrderTracking,
  type GhnTrackingLog,
  type GhnTrackingLogsData,
} from "@/api/order.api";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

// ================== Helpers ==================

const formatDate = (iso?: string | null) => {
  if (!iso) return "--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleDateString("vi-VN");
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateWithWeekday = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = d.getDay();
  const weekday = day === 0 ? "Chủ nhật" : `Thứ ${day + 1}`;
  const dateStr = d.toLocaleDateString("vi-VN");
  return `${weekday}, ${dateStr}`;
};

const getStatusClass = (log: GhnTrackingLog) => {
  if (log.type === "CALL" || log.type === "SMS") return "text-orange-600";
  if (log.status?.startsWith("delivery_fail")) return "text-orange-600";
  if (log.status === "waiting_to_return") return "text-blue-600";
  return "text-sky-700";
};

const renderDetail = (log: GhnTrackingLog) => {
  // TRACKING: giống các dòng "Nhập bưu cục giao", "Đang giao hàng…"
  if (log.type === "TRACKING") {
    return (
      <div className="space-y-1">
        {log.location?.address && (
          <div className="text-slate-700">{log.location.address}</div>
        )}
        {log.reason && (
          <div className="text-orange-600">{log.reason}</div>
        )}
        {(log.executor?.name || log.employee_name) && (
          <div className="text-xs text-slate-500">
            {(log.executor?.name || log.employee_name) ?? ""}
            {log.executor?.phone || log.employee_phone
              ? ` – ${(log.executor?.phone || log.employee_phone)!}`
              : ""}
          </div>
        )}
      </div>
    );
  }

  // CALL: các dòng "Cuộc gọi", "Đổ chuông 0s / 31s, Nghe máy 22s…"
  if (log.type === "CALL") {
    const who =
      log.user_type === "NG"
        ? "người gửi"
        : log.user_type === "NN"
        ? "người nhận"
        : "";
    const phone = log.phone_receive;
    const ring =
      log.ring_duration != null ? `Đổ chuông ${log.ring_duration}s` : "";
    const talk =
      log.duration && log.duration > 0 ? `Nghe máy ${log.duration}s` : "";

    return (
      <div className="space-y-1">
        <div className="text-slate-700">
          {(log.employee_name || "Nhân viên")} gọi điện cho {who}{" "}
          {phone}
        </div>
        {(ring || talk) && (
          <div className="text-orange-600">
            {[ring, talk].filter(Boolean).join(" – ")}
          </div>
        )}
      </div>
    );
  }

  // SMS: "Gửi tin nhắn SMS…"
  if (log.type === "SMS") {
    return (
      <div className="space-y-1">
        {log.sms_content && (
          <div className="text-slate-700">{log.sms_content}</div>
        )}
        {log.phone_receive && (
          <div className="text-xs text-slate-500">
            Gửi tới: {(log.phone_receive)}
          </div>
        )}
      </div>
    );
  }

  return null;
};

// ================== Types ==================

type GroupedLog = {
  dateKey: string;
  dateLabel: string;
  entries: GhnTrackingLog[];
};

// ================== Component ==================

const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GhnTrackingLogsData | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const d = await getOrderTracking(Number(orderId));
        setData(d);
      } catch (e: any) {
        console.error(e);
        toast.error(
          e?.response?.data?.message || "Không tải được thông tin tracking"
        );
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [orderId, navigate]);

  // Group logs theo ngày
  const groupedLogs: GroupedLog[] = useMemo(() => {
    const src = data?.timeline;
    if (!src?.length) return [];

    const map: Record<string, GhnTrackingLog[]> = {};

    src.forEach((log: any) => {
      const d = new Date(log.action_at);
      if (Number.isNaN(d.getTime())) return;

      const key = d.toLocaleDateString("en-CA");

      if (!map[key]) map[key] = [];
      map[key].push(log);
    });

    return Object.entries(map)
      .sort(([a], [b]) => (a > b ? -1 : 1))
      .map(([key, logs]) => ({
        dateKey: key,
        dateLabel: formatDateWithWeekday(key),
        entries: logs.sort(
          (a, b) =>
            new Date(b.action_at!).getTime() - new Date(a.action_at!).getTime()
        ),
      }));
  }, [data]);

  if (!orderId) {
    return (
      <div className="p-6 text-sm text-red-600">
        Không có mã đơn hàng.
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="p-6 text-sm text-slate-600">
        Đang tải thông tin vận đơn...
      </div>
    );
  }

  const info = data.order_info;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            Theo dõi đơn hàng – {info.order_code}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-600 hover:underline"
          >
            ← Quay lại
          </button>
        </div>

        {/* 1. THÔNG TIN ĐƠN HÀNG + CHI TIẾT */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Thông tin đơn hàng */}
          <section className="bg-white rounded-xl shadow-sm p-4 text-sm">
            <h2 className="font-semibold mb-3">THÔNG TIN ĐƠN HÀNG</h2>
            <div className="space-y-1">
              <div className="flex">
                <span className="w-40 text-slate-500">Mã đơn hàng:</span>
                <span className="font-semibold">{info.order_code}</span>
              </div>
              <div className="flex">
                <span className="w-40 text-slate-500">Ngày lấy dự kiến:</span>
                <span>{formatDate(info.picktime)}</span>
              </div>
              <div className="flex">
                <span className="w-40 text-slate-500">Ngày giao dự kiến:</span>
                <span>{formatDate(info.leadtime)}</span>
              </div>
              <div className="flex items-center mt-2">
                <span className="w-40 text-slate-500">
                  Trạng thái hiện tại:
                </span>
                <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  {info.status_name}
                </span>
              </div>
            </div>
          </section>

          {/* Thông tin người nhận */}
          <section className="bg-white rounded-xl shadow-sm p-4 text-sm">
            <h2 className="font-semibold mb-3">NGƯỜI NHẬN</h2>
            <div className="space-y-1">
              <div className="flex">
                <span className="w-28 text-slate-500">Họ và tên:</span>
                <span>{info.to_name}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500">Điện thoại:</span>
                <span>{info.to_phone}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500">Địa chỉ:</span>
                <span>{info.to_address}</span>
              </div>
            </div>
          </section>
        </div>

        {/* 2. LỊCH SỬ ĐƠN HÀNG */}
        <section className="bg-white rounded-xl shadow-sm p-4 text-sm">
          <h2 className="font-semibold mb-3">Lịch sử đơn hàng</h2>

          {!groupedLogs.length && (
            <p className="text-slate-500 text-sm">
              Chưa có lịch sử trạng thái.
            </p>
          )}

          {groupedLogs.length > 0 && (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-2 w-64 text-left">Ngày</th>
                    <th className="px-4 py-2 text-left">Chi tiết</th>
                    <th className="px-4 py-2 w-24 text-right">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedLogs.map((group) => (
                    <React.Fragment key={group.dateKey}>
                      {/* header theo ngày */}
                      <tr className="bg-slate-100">
                        <td className="px-4 py-2 font-semibold" colSpan={3}>
                          {group.dateLabel}
                        </td>
                      </tr>

                      {group.entries.map((log, idx) => (
                        <tr key={group.dateKey + idx} className="border-t">
                          <td
                            className={`px-4 py-2 font-medium ${getStatusClass(
                              log
                            )}`}
                          >
                            {log.status_name}
                          </td>
                          <td className="px-4 py-2 align-top">
                            {renderDetail(log)}
                          </td>
                          <td className="px-4 py-2 text-right text-slate-700">
                            {formatTime(log.action_at!)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default OrderTrackingPage;


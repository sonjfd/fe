import { getUserOrder } from "@/api/order.api";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import UserOrderDetail from "./UserOrderDetail";
import { CancelOrderPopup } from "@/components/client/PopupCancel";

export default function UserOrderPage() {
  const [rows, setRows] = useState<Order[]>([]);
  const [meta, setMeta] = useState({ page: 1, size: 10, total: 0 });
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [orderStatus, setOrderStatus] = useState("");

  const [openDetail, setOpenDetail] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const [inputValue, setInputValue] = useState<number | "">("");
  const inputRef = useRef<number | null>(null);

  const query = useMemo(() => {
    let s = `page=${page}&size=${size}`;
    if (orderStatus) s += `&orderStatus=${orderStatus}`;
    return s;
  }, [page, size, orderStatus]);

  const totalPages = meta.size > 0 ? Math.ceil(meta.total / meta.size) || 1 : 1;

  const load = async () => {
    try {
      setLoading(true);
      const res = await getUserOrder(query);
      const data = res.data;

      setRows(data?.items ?? []);
      setMeta({
        page: data?.page ?? 1,
        size: data?.size ?? size,
        total: data?.total ?? 0,
      });
    } catch (e: any) {
      toast.error(e?.message || "Không tải được lịch sử đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    setInputValue(page);
  }, [page]);

  const resetFilter = () => {
    setOrderStatus("");
    setPage(1);
  };

  const formatCurrency = (n: number) =>
    n?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const formatDateTime = (v?: string) =>
    v ? new Date(v).toLocaleDateString("vi-VN") : "-";

  const mapPaymentMethod = (m: string) => {
    switch (m) {
      case "VN_PAY":
        return "Thanh toán online";
      case "CASH":
        return "Thanh toán khi nhận";
      default:
        return m;
    }
  };

  const mapPaymentStatus = (s: string) => {
    switch (s) {
      case "PAID":
        return "Đã thanh toán";
      case "PENDING":
        return "Chờ thanh toán";
      case "FAILED":
        return "Thất bại";
      case "CANCELLED":
        return "Đã hủy";
      case "REFUNDED":
        return "Đã hoàn tiền";
      default:
        return s;
    }
  };

  const mapOrderStatus = (s: string) => {
    switch (s) {
      case "COMPLETED":
        return "Đã hoàn thành";
      case "RETURNED":
        return "Hoàn trả hàng";
      case "SHIPPING":
        return "Đang giao";
      case "FAILED":
        return "Hư hỏng";
      case "CANCELLED":
        return "Đã hủy";
      case "PENDING":
        return "Đơn hàng mới tạo";
      case "CONFIRMED":
        return "Chuẩn bị giao";
      case "CANCEL_REQUESTED":
        return "Chờ duyệt huỷ";
      default:
        return s;
    }
  };

  const handleCancelOrder = (o: Order) => {
  if (o.orderStatus === "CANCELLED" || o.orderStatus === "COMPLETED") return;

  toast(
    ({ closeToast }) => (
      <CancelOrderPopup
        order={o}
        closeToast={closeToast}
        onSuccess={load} // gọi lại API load list đơn
      />
    ),
    {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    }
  );
};


  return (
    <>
      <div className="rounded-lg border bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Lịch sử mua hàng</h2>
        </div>

        <div className="grid gap-3 border-b p-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">
              Trạng thái đơn hàng
            </label>
            <select
              value={orderStatus}
              onChange={(e) => {
                setOrderStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="SHIPPING">Đang giao</option>
              <option value="DELIVERED">Đã giao</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilter}
              className="h-[38px] rounded border px-3 text-xs hover:bg-neutral-50"
            >
              Đặt lại
            </button>
          </div>
        </div>

        <div className="space-y-4 p-4">
          {loading && (
            <div className="py-4 text-center text-sm text-neutral-500">
              Đang tải...
            </div>
          )}

          {!loading && rows.length === 0 && (
            <div className="py-4 text-center text-sm text-neutral-500">
              Bạn chưa có đơn hàng nào.
            </div>
          )}

          {!loading &&
            rows.map((o) => (
              <div
                key={o.id}
                className="overflow-hidden rounded-lg border bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-2 text-xs md:text-sm">
                  <div className="font-medium">
                    Mã đơn: <span className="font-semibold">#{o.id}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 md:flex-row md:items-center md:gap-2">
                    <span className="text-[11px] text-neutral-500 md:text-xs">
                      Dự kiến giao: {formatDateTime(o.ghnExpectedDelivery)}
                    </span>
                    <span className="h-3 w-px bg-neutral-300 md:h-4" />
                    <span
                      className={`text-xs font-semibold md:text-sm ${
                        o.orderStatus === "CANCELLED"
                          ? "text-red-500"
                          : o.orderStatus === "COMPLETED" ||
                            o.orderStatus === "DELIVERED"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      {mapOrderStatus(o.orderStatus)}
                    </span>
                  </div>
                </div>

                <div className="px-4 py-3 text-sm">
                  <div className="mb-2 text-xs text-neutral-500 md:text-sm">
                    Địa chỉ giao:{" "}
                    <span className="font-medium text-neutral-700">
                      {o.addressDetail}, {o.ward}, {o.district}, {o.province}
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-between gap-3 text-xs md:text-sm">
                    <div className="space-y-1 text-neutral-700">
                      <div>
                        <span className="font-medium">Phương thức: </span>
                        {mapPaymentMethod(o.paymentMethod)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          Trạng thái thanh toán:
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold md:text-xs
                          ${
                            o.paymentStatus === "PAID"
                              ? "bg-green-100 text-green-700"
                              : o.paymentStatus === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : o.paymentStatus === "REFUNDED"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {mapPaymentStatus(o.paymentStatus)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-neutral-500">
                        Tổng thanh toán
                      </div>
                      <div className="text-base font-semibold text-red-500 md:text-lg">
                        {formatCurrency(o.totalPrice + o.ghnFee)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t bg-slate-50 px-4 py-2.5">
                  <button
                    className="rounded border px-3 py-1.5 text-xs hover:bg-white md:text-sm"
                    onClick={() => {
                      setDetailId(o.id);
                      setOpenDetail(true);
                    }}
                  >
                    Xem chi tiết
                  </button>

                 { (o.orderStatus === "PENDING" || o.orderStatus === "CONFIRMED") && (
                      <button
                        className="rounded border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 md:text-sm"
                        onClick={() => handleCancelOrder(o)}
                      >
                        Huỷ đơn
                      </button>
                  )}

                </div>
              </div>
            ))}
        </div>

        <div className="flex flex-col gap-3 border-t p-4 text-xs md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span>
              Trang <b>{meta.page}</b>/<b>{totalPages}</b>
            </span>
            <span className="text-neutral-500">
              (Tổng: {meta.total} đơn hàng)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <select
                value={size}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  setSize(newSize);
                  setPage(1);
                }}
                className="rounded border px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span>/ trang</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="rounded border px-3 py-1.5 disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trước
              </button>

              <input
                type="number"
                value={inputValue}
                min={1}
                max={totalPages}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") return setInputValue("");
                  const num = Number(raw);
                  setInputValue(num);
                  if (inputRef.current) clearTimeout(inputRef.current);
                  inputRef.current = window.setTimeout(() => {
                    if (!Number.isNaN(num) && num >= 1 && num <= totalPages) {
                      setPage(num);
                    }
                  }, 500);
                }}
                className="w-16 rounded border px-2 py-1.5 text-center"
              />

              <button
                className="rounded border px-3 py-1.5 disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

      {openDetail && detailId && (
        <UserOrderDetail id={detailId} onClose={() => setOpenDetail(false)} />
      )}
    </>
  );
}

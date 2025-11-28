import {
  getAllOrder,
  approveCancelOrder,
  rejectCancelOrder,
} from "@/api/admin.order";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { UpdateOrderModal } from "./UpdateOrderModal";
import OrderDetail from "./OrderDetail";
import { useSearchParams, useNavigate } from "react-router-dom";

/** ========= TOAST COMPONENTS ========= **/

type ToastActionProps = {
  order: Order;
  onDone: () => void;
  closeToast: () => void;
};

// Toast xác nhận DUYỆT HỦY
function ApproveCancelToast({ order, onDone, closeToast }: ToastActionProps) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await approveCancelOrder(order.id);
      if (res.data) {
        toast.success(res.data || "Đã duyệt hủy đơn hàng");
        onDone();
        closeToast();
      } else {
        toast.error(res.message || "Không thể duyệt hủy đơn hàng");
      }
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          "Lỗi khi duyệt hủy đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 text-sm">
      <p className="font-medium">
        Xác nhận duyệt hủy đơn hàng <span className="font-semibold">#{order.id}</span>?
      </p>
      <p className="text-xs text-neutral-600">
        Sau khi duyệt, đơn hàng sẽ được hủy và (nếu có) GHN sẽ được yêu cầu hủy đơn.
      </p>
      <div className="flex justify-end gap-2 pt-1">
        <button
          className="px-3 py-1.5 rounded border text-xs md:text-sm"
          onClick={closeToast}
          disabled={loading}
        >
          Đóng
        </button>
        <button
          className="px-3 py-1.5 rounded bg-red-600 text-white text-xs md:text-sm disabled:opacity-60"
          onClick={handleApprove}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Xác nhận duyệt hủy"}
        </button>
      </div>
    </div>
  );
}

// Toast xác nhận TỪ CHỐI HỦY
function RejectCancelToast({ order, onDone, closeToast }: ToastActionProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await rejectCancelOrder(order.id, reason.trim());
      if (res.data) {
        toast.success(res.data || "Đã từ chối yêu cầu hủy đơn hàng");
        onDone();
        closeToast();
      } else {
        toast.error(res.data || "Không thể từ chối yêu cầu hủy");
      }
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          e?.message ||
          "Lỗi khi từ chối yêu cầu hủy"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 text-sm">
      <p className="font-medium">
        Từ chối yêu cầu hủy đơn hàng{" "}
        <span className="font-semibold">#{order.id}</span>?
      </p>
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-600">
          Lý do từ chối (không bắt buộc)
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:border-blue-500"
          placeholder="Ví dụ: Đơn hàng đã chuẩn bị xong, không thể hủy..."
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          className="px-3 py-1.5 rounded border text-xs md:text-sm"
          onClick={closeToast}
          disabled={loading}
        >
          Đóng
        </button>
        <button
          className="px-3 py-1.5 rounded bg-amber-500 text-white text-xs md:text-sm disabled:opacity-60"
          onClick={handleReject}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Xác nhận từ chối"}
        </button>
      </div>
    </div>
  );
}

/** ========= MAIN COMPONENT ========= **/

export default function TableOrder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const stringId = searchParams.get("id");
  const id = Number(stringId);
  const refresh = searchParams.get("refresh");

  const [rows, setRows] = useState<Order[]>([]);
  const [meta, setMeta] = useState({
    page: 1,
    size: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);

  const [openDetail, setOpenDetail] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [email, setEmail] = useState("");
  const [orderStatus, setOrderStatus] = useState("");

  const [searchValue, setSearchValue] = useState("");
  const searchRef = useRef<number | null>(null);

  const [inputValue, setInputValue] = useState<number | "">("");
  const inputRef = useRef<number | null>(null);
  const activeToasts = useRef<Set<number>>(new Set());

  const ONE_HOUR_MS = 60 * 60 * 1000;

  const isCancelRequestExpired = (o: Order) => {
    if (o.orderStatus !== "CANCEL_REQUESTED") return false;
    if (!o.updatedAt) return false;
    const t = new Date(o.updatedAt).getTime();
    if (Number.isNaN(t)) return false;
    return Date.now() - t > ONE_HOUR_MS;
  };

  const query = useMemo(() => {
    let s = `page=${page}&size=${size}`;
    if (email) s += `&email=${encodeURIComponent(email)}`;
    if (orderStatus) s += `&orderStatus=${orderStatus}`;
    if (id) s += `&id=${id}`;
    if (refresh) s += `&refresh=${refresh}`;
    return s;
  }, [page, size, email, orderStatus, id, refresh]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAllOrder(query);
      const data = res.data;

      setRows(data?.items ?? []);
      setMeta({
        page: data?.page ?? 1,
        size: data?.size ?? size,
        total: data?.total ?? 0,
      });
    } catch (e: any) {
      toast.error(e?.message || "Không tải được danh sách đơn hàng");
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

  // Tự động reject những order CANCEL_REQUESTED quá 1 tiếng
  useEffect(() => {
    const targets = rows.filter(isCancelRequestExpired);
    if (!targets.length) return;

    const run = async () => {
      for (const o of targets) {
        try {
          await rejectCancelOrder(
            o.id,
            "Yêu cầu hủy quá thời gian 1 giờ, hệ thống tự động từ chối."
          );
        } catch (e) {
          console.error("Auto reject cancel request failed", e);
        }
      }
      toast.info(
        `Đã tự động từ chối ${targets.length} yêu cầu hủy quá 1 giờ.`
      );
      await load();
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const resetFilter = () => {
    setEmail("");
    setSearchValue("");
    setOrderStatus("");
    setPage(1);
  };

  const totalPages =
    meta.size > 0 ? Math.ceil(meta.total / meta.size) || 1 : 1;

  const formatCurrency = (n: number) =>
    n?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

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
        return "Yêu cầu hủy";
      default:
        return s;
    }
  };

  // Mở toast duyệt hủy
  const handleApproveCancel = (o: Order) => {
    if (o.orderStatus !== "CANCEL_REQUESTED") {
      toast.error("Đơn này không trong trạng thái yêu cầu hủy");
      return;
    }
    if (activeToasts.current.has(o.id)) {
    return;
  }

  activeToasts.current.add(o.id);

  const toastId = `approve-cancel-${o.id}`;
    toast(
      ({ closeToast }) => (
        <ApproveCancelToast
        order={o}
        onDone={() => {
          activeToasts.current.delete(o.id);
          load();
        }}
        closeToast={() => {
          activeToasts.current.delete(o.id);
          closeToast();
        }}
        />
      ),
      {
        toastId,
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        onClose: () => {
        activeToasts.current.delete(o.id);
      }
      }
    );
  };


  const handleRejectCancel = (o: Order) => {
    if (o.orderStatus !== "CANCEL_REQUESTED") {
      toast.error("Đơn này không trong trạng thái yêu cầu hủy");
      return;
    }
  if (activeToasts.current.has(o.id)) {
    return;
  }

  activeToasts.current.add(o.id);

  const toastId = `reject-cancel-${o.id}`;
    toast(
      ({ closeToast }) => (
        <RejectCancelToast order={o}
        onDone={() => {
          activeToasts.current.delete(o.id);
          load();
        }}
        closeToast={() => {
          activeToasts.current.delete(o.id);
          closeToast();
        }}
        />
      ),
      {
        toastId,
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        onClose: () => {
        // Cleanup khi toast đóng bằng cách khác
        activeToasts.current.delete(o.id);
      }
      }
    );
  };

  return (
    <>
      <div className="rounded-lg border bg-white">
        <div className="flex justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Danh sách đơn hàng</h2>
        </div>

        {/* Filters */}
        <div className="grid gap-3 p-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm">Tìm theo email khách</label>
            <input
              value={searchValue}
              onChange={(e) => {
                const val = e.target.value;
                setSearchValue(val);
                if (searchRef.current) clearTimeout(searchRef.current);
                searchRef.current = window.setTimeout(() => {
                  setEmail(val);
                  setPage(1);
                }, 400);
              }}
              className="w-full rounded border px-3 py-2"
              placeholder="Nhập email khách"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Trạng thái đơn hàng</label>
            <select
              value={orderStatus}
              onChange={(e) => {
                setOrderStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded border px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="SHIPPING">Đang giao</option>
              <option value="DELIVERED">Đã giao</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="CANCEL_REQUESTED">Yêu cầu hủy</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilter}
              className="h-[38px] rounded border px-3 text-sm"
            >
              Đặt lại
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-4 py-2 text-left">STT</th>
                <th className="px-4 py-2 text-left">Khách hàng</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Tổng tiền</th>
                <th className="px-4 py-2 text-left">Phương thức</th>
                <th className="px-4 py-2 text-left">TT thanh toán</th>
                <th className="px-4 py-2 text-left">Trạng thái đơn</th>
                <th className="px-4 py-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                rows.map((o, idx) => {
                  const hasGhnOrder = !!o.ghnOrderCode;

                  return (
                    <tr key={o.id} className="border-t">
                      <td className="px-4 py-3">
                        {(page - 1) * size + idx + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold">
                          {o.user?.fullName}
                        </div>
                      </td>

                      <td className="px-4 py-3">{o.user?.email}</td>

                      <td className="px-4 py-3 font-semibold">
                        {formatCurrency(
                          (o.totalPrice || 0) + (o.ghnFee || 0)
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          {mapPaymentMethod(o.paymentMethod)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold
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
                      </td>

                      {/* orderStatus - badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold
                        ${
                          o.orderStatus === "DELIVERED" ||
                          o.orderStatus === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : o.orderStatus === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : o.orderStatus === "CANCEL_REQUESTED"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                        >
                          {mapOrderStatus(o.orderStatus)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {/* Xem chi tiết order */}
                        <button
                          className="rounded border px-3 py-1.5 text-xs hover:bg-neutral-50 me-2"
                          onClick={() => {
                            setDetailId(o.id);
                            setOpenDetail(true);
                          }}
                        >
                          Xem
                        </button>

                        {/* Nếu là yêu cầu hủy → chỉ hiển thị 2 nút này, che các action khác */}
                        {o.orderStatus === "CANCEL_REQUESTED" && (
                          <>
                            <button
                              className="rounded border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 me-2"
                              onClick={() => handleApproveCancel(o)}
                            >
                              Duyệt hủy
                            </button>
                            <button
                              className="rounded border border-amber-500 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50"
                              onClick={() => handleRejectCancel(o)}
                            >
                              Từ chối
                            </button>
                          </>
                        )}

                        {/* Các trạng thái khác: cho cập nhật nếu chưa hủy / chưa hoàn */}
                        {o.orderStatus !== "CANCEL_REQUESTED" &&
                          o.orderStatus !== "CANCELLED" &&
                          o.orderStatus !== "COMPLETED" && (
                            <button
                              className="rounded border border-blue-500 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 me-2"
                              onClick={() => {
                                setOpenModalUpdate(true);
                                setEditing(o);
                              }}
                            >
                              Cập nhật
                            </button>
                          )}

                        {/* Tạo vận đơn / Theo dõi GHN chỉ hiển thị khi KHÔNG ở trạng thái CANCEL_REQUESTED */}
                        {o.orderStatus !== "CANCEL_REQUESTED" &&
                          o.orderStatus === "PENDING" &&
                          !hasGhnOrder && (
                            <button
                              className="rounded border border-emerald-500 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"
                              onClick={() =>
                                navigate(`/admin/orders/create-ghn/${o.id}`)
                              }
                            >
                              Tạo vận đơn
                            </button>
                          )}

                        {o.orderStatus !== "CANCEL_REQUESTED" && hasGhnOrder && (
                          <button
                            className="rounded border border-orange-500 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50"
                            onClick={() =>
                              navigate(
                                `/admin/orders/tracking/${o.ghnOrderCode}`
                              )
                            }
                          >
                            Theo dõi GHN
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

              {loading && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-neutral-500">
                    Đang tải…
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-neutral-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination + page size */}
        <div className="flex flex-col gap-3 border-t p-4 text-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span>
              Trang <b>{meta.page}</b>/<b>{totalPages}</b>
            </span>
            <span className="text-neutral-500">
              (Tổng: {meta.total} đơn hàng)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* page size */}
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
                <option value={50}>50</option>
              </select>
              <span>/ trang</span>
            </div>

            {/* điều hướng trang */}
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

      {editing && openModalUpdate && (
        <UpdateOrderModal
          order={editing}
          setOpenModalUpdate={setOpenModalUpdate}
          load={load}
        />
      )}

      {openDetail && detailId && (
        <OrderDetail id={detailId} onClose={() => setOpenDetail(false)} />
      )}
    </>
  );
}

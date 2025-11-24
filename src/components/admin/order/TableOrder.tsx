import { getAllOrder } from "@/api/admin.order";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { UpdateOrderModal } from "./UpdateOrderModal";
import OrderDetail from "./OrderDetail";
import { useSearchParams } from "react-router-dom";

export default function TableOrder() {
  const [searchParams] = useSearchParams();
  const stringId = searchParams.get("id");
  const id = Number(stringId);
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

  const query = useMemo(() => {
    let s = `page=${page}&size=${size}`;
    if (email) s += `&email=${encodeURIComponent(email)}`;
    if (orderStatus) s += `&orderStatus=${orderStatus}`;
    if (id) s += `&id=${id}`;
    return s;
  }, [page, size, email, orderStatus, id]);

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

  const resetFilter = () => {
    setEmail("");
    setSearchValue("");
    setOrderStatus("");
    setPage(1);
  };

  const totalPages = meta.size > 0 ? Math.ceil(meta.total / meta.size) || 1 : 1;

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
      default:
        return s;
    }
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
                rows.map((o, idx) => (
                  <tr key={o.id} className="border-t">
                    <td className="px-4 py-3">{(page - 1) * size + idx + 1}</td>

                    <td className="px-4 py-3">
                      <div className="font-semibold">{o.user?.fullName}</div>
                    </td>

                    <td className="px-4 py-3">{o.user?.email}</td>

                    <td className="px-4 py-3 font-semibold">
                      {formatCurrency(o.totalPrice + o.ghnFee)}
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
                          o.orderStatus === "DELIVERED"
                            ? "bg-green-100 text-green-700"
                            : o.orderStatus === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-neutral-100 text-neutral-700"
                        }`}
                      >
                        {mapOrderStatus(o.orderStatus)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        className="rounded border px-3 py-1.5 text-xs hover:bg-neutral-50 me-3"
                        onClick={() => {
                          setDetailId(o.id);
                          setOpenDetail(true);
                        }}
                      >
                        Xem
                      </button>
                      {o.orderStatus !== "CANCELLED" &&
                        o.orderStatus !== "COMPLETED" && (
                          <button
                            className="rounded border border-blue-500 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                            onClick={() => {
                              setOpenModalUpdate(true);
                              setEditing(o);
                            }}
                          >
                            Cập nhật
                          </button>
                        )}
                    </td>
                  </tr>
                ))}

              {loading && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-neutral-500">
                    Đang tải…
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-neutral-500">
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

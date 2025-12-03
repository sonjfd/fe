import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getOrderDetail } from "@/api/order.api";
import { useNavigate } from "react-router-dom";

interface UserOrderDetailProps {
  id: number;
  onClose?: () => void;
}

// Kiểu trạng thái đơn hàng (đồng bộ với BE)
type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCEL_REQUESTED"
  | "CANCELLED"
  | "RETURNED"
  | "FAILED";

// Kiểu trạng thái thanh toán (đồng bộ với BE)
type PaymentStatus = "PAID" | "PENDING" | "FAILED" | "CANCELLED" | "REFUNDED";

// ================== CONFIG HIỂN THỊ ==================

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; description: string; colorClass: string; dotClass: string }
> = {
  PENDING: {
    label: "Đơn hàng mới tạo",
    description: "Chúng tôi đã nhận được đơn hàng và đang chờ xác nhận.",
    colorClass: "bg-yellow-50 text-yellow-700",
    dotClass: "bg-yellow-400",
  },
  CONFIRMED: {
    label: "Chuẩn bị giao",
    description: "Đơn hàng đã được xác nhận và đang được chuẩn bị.",
    colorClass: "bg-blue-50 text-blue-700",
    dotClass: "bg-blue-400",
  },
  SHIPPING: {
    label: "Đang giao hàng",
    description: "Đơn hàng đang được đơn vị vận chuyển giao đến bạn.",
    colorClass: "bg-sky-50 text-sky-700",
    dotClass: "bg-sky-400",
  },
  DELIVERED: {
    label: "Đã giao hàng",
    description: "Đơn hàng đã được giao thành công đến bạn.",
    colorClass: "bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-400",
  },
  COMPLETED: {
    label: "Hoàn tất",
    description: "Đơn hàng đã hoàn tất. Cảm ơn bạn đã mua sắm!",
    colorClass: "bg-green-50 text-green-700",
    dotClass: "bg-green-400",
  },
  CANCEL_REQUESTED: {
    label: "Yêu cầu hủy",
    description: "Bạn đã gửi yêu cầu hủy, chúng tôi đang xử lý.",
    colorClass: "bg-orange-50 text-orange-700",
    dotClass: "bg-orange-400",
  },
  CANCELLED: {
    label: "Đã hủy",
    description: "Đơn hàng đã bị hủy và sẽ không được giao.",
    colorClass: "bg-red-50 text-red-700",
    dotClass: "bg-red-400",
  },
  RETURNED: {
    label: "Hoàn trả hàng",
    description: "Đơn hàng đã được hoàn trả lại cho cửa hàng.",
    colorClass: "bg-purple-50 text-purple-700",
    dotClass: "bg-purple-400",
  },
  FAILED: {
    label: "Giao hàng thất bại",
    description: "Đơn hàng giao không thành công hoặc hàng bị hư hỏng.",
    colorClass: "bg-rose-50 text-rose-700",
    dotClass: "bg-rose-400",
  },
};

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; colorClass: string; dotClass: string }
> = {
  PAID: {
    label: "Đã thanh toán",
    colorClass: "bg-green-100 text-green-700",
    dotClass: "bg-green-500",
  },
  PENDING: {
    label: "Chờ thanh toán",
    colorClass: "bg-yellow-100 text-yellow-700",
    dotClass: "bg-yellow-500",
  },
  FAILED: {
    label: "Thanh toán thất bại",
    colorClass: "bg-red-100 text-red-700",
    dotClass: "bg-red-500",
  },
  CANCELLED: {
    label: "Thanh toán đã hủy",
    colorClass: "bg-neutral-100 text-neutral-700",
    dotClass: "bg-neutral-500",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    colorClass: "bg-indigo-100 text-indigo-700",
    dotClass: "bg-indigo-500",
  },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  VN_PAY: "Thanh toán online (VNPay)",
  CASH: "Thanh toán khi nhận hàng",
};

const formatCurrency = (n?: number | null) =>
  (n ?? 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const getOrderStatusDisplay = (s: string) => {
  const key = s as OrderStatus;
  if (ORDER_STATUS_CONFIG[key]) return ORDER_STATUS_CONFIG[key];

  return {
    label: s,
    description: "",
    colorClass: "bg-neutral-100 text-neutral-700",
    dotClass: "bg-neutral-400",
  };
};

const getPaymentStatusDisplay = (s: string) => {
  const key = s as PaymentStatus;
  if (PAYMENT_STATUS_CONFIG[key]) return PAYMENT_STATUS_CONFIG[key];

  return {
    label: s,
    colorClass: "bg-neutral-100 text-neutral-700",
    dotClass: "bg-neutral-400",
  };
};

const mapPaymentMethod = (m: string) => {
  return PAYMENT_METHOD_LABEL[m] ?? m;
};

// ================== COMPONENT CHÍNH ==================

export default function UserOrderDetail({ id, onClose }: UserOrderDetailProps) {
  const [order, setOrder] = useState<OneOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const expectedDeliveryStr = useMemo(() => {
    if (!order?.ghnExpectedDelivery) return "-";
    return new Date(order.ghnExpectedDelivery).toLocaleString("vi-VN");
  }, [order]);

  const voucherDiscount = useMemo(() => {
    if (!order) return 0;
    const raw = (order as any).voucherDiscount as number | undefined;
    return raw && raw > 0 ? raw : 0;
  }, [order]);

  const productTotal = useMemo(() => order?.totalPrice ?? 0, [order]);

  const shippingFee = useMemo(() => order?.ghnFee ?? 0, [order]);

  const totalPayment = useMemo(() => {
    if (!order) return 0;
    return productTotal + shippingFee - voucherDiscount;
  }, [productTotal, shippingFee, voucherDiscount, order]);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await getOrderDetail(id);
      setOrder(res.data as OneOrder);
    } catch (e: any) {
      toast.error(e?.message || "Không tải được chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const orderStatusDisplay = order
    ? getOrderStatusDisplay(order.orderStatus)
    : null;

  const paymentStatusDisplay = order
    ? getPaymentStatusDisplay(order.paymentStatus)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold">
              Chi tiết đơn hàng #{order?.id ?? id}
            </h2>

            {order && orderStatusDisplay && (
              <div className="mt-1 space-y-1">
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs text-neutral-500">
                    Trạng thái đơn hàng:
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${orderStatusDisplay.colorClass}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${orderStatusDisplay.dotClass}`}
                    />
                    {orderStatusDisplay.label}
                  </span>
                </div>
                {orderStatusDisplay.description && (
                  <p className="text-[11px] text-neutral-400">
                    {orderStatusDisplay.description}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
                        {order?.ghnOrderCode && (
                            <button
                                onClick={() => {
                                    if (onClose) onClose();
                                    navigate(`/tai-khoan/don-mua/${id}/tracking`);
                                }}
                                className="rounded border border-blue-600 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                            >
                                Theo dõi đơn hàng
                            </button>
                        )}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="rounded border px-3 py-1.5 text-xs hover:bg-neutral-50"
                            >
                                Đóng
                            </button>
                        )}
                    </div>
        </div>

        {/* Loading / Empty */}
        {loading && (
          <div className="p-4 text-sm">Đang tải chi tiết đơn hàng...</div>
        )}

        {!loading && !order && (
          <div className="p-4 text-sm">Không tìm thấy đơn hàng</div>
        )}

        {/* Content */}
        {!loading && order && (
          <>
            {/* Thông tin khách + địa chỉ */}
            <div className="grid gap-4 border-b p-4 md:grid-cols-2">
              <div className="space-y-2 text-sm">
                <h3 className="text-sm font-semibold">Thông tin khách hàng</h3>
                <div className="text-neutral-700 space-y-1">
                  <div>
                    <span className="font-medium">Tên: </span>
                    {order.user?.fullName || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Email: </span>
                    {order.user?.email || "-"}
                  </div>
                  <div>
                    <span className="font-medium">SĐT: </span>
                    {order.user?.phone || "-"}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <h3 className="text-sm font-semibold">Địa chỉ giao hàng</h3>
                <div className="text-neutral-700 space-y-1">
                  <div>
                    <span className="font-medium">Tỉnh/TP: </span>
                    {order.province}
                  </div>
                  <div>
                    <span className="font-medium">Quận/Huyện: </span>
                    {order.district}
                  </div>
                  <div>
                    <span className="font-medium">Phường/Xã: </span>
                    {order.ward}
                  </div>
                  <div>
                    <span className="font-medium">Địa chỉ chi tiết: </span>
                    {order.addressDetail}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Dự kiến GHN giao: {expectedDeliveryStr}
                  </div>
                </div>
              </div>
            </div>

            {/* Thanh toán + tổng tiền */}
            <div className="grid gap-4 border-b p-4 md:grid-cols-3">
              <div className="space-y-2 text-sm">
                <h3 className="text-sm font-semibold">Thanh toán</h3>
                <div className="text-neutral-700 space-y-1">
                  <div>
                    <span className="font-medium">Phương thức: </span>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {mapPaymentMethod(order.paymentMethod)}
                    </span>
                  </div>

                  {paymentStatusDisplay && (
                    <div>
                      <span className="font-medium">Trạng thái: </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${paymentStatusDisplay.colorClass}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${paymentStatusDisplay.dotClass}`}
                        />
                        {paymentStatusDisplay.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-sm md:col-span-2">
                <h3 className="text-sm font-semibold">Tổng quan giá</h3>

                <div className="flex justify-between text-neutral-700">
                  <span>Tổng tiền sản phẩm</span>
                  <span>{formatCurrency(productTotal)}</span>
                </div>

                <div className="flex justify-between text-neutral-700">
                  <span>Phí vận chuyển (GHN)</span>
                  <span>{formatCurrency(shippingFee)}</span>
                </div>

                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-neutral-700">
                    <span>
                      Giảm giá từ voucher
                      {(order as any).voucherCode
                        ? ` (${(order as any).voucherCode})`
                        : ""}
                    </span>
                    <span>-{formatCurrency(voucherDiscount)}</span>
                  </div>
                )}

                <div className="mt-2 border-t pt-2 text-sm font-semibold">
                  <div className="flex justify-between">
                    <span>Tổng thanh toán</span>
                    <span>{formatCurrency(totalPayment)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sản phẩm */}
            <div className="p-4">
              <h3 className="mb-3 text-sm font-semibold">
                Sản phẩm trong đơn hàng
              </h3>
              <div className="space-y-3 text-sm">
                {order.details?.map((d, idx) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-3 border-b pb-3 last:border-b-0"
                  >
                    <div className="flex flex-1 items-center gap-3">
                      {d.variant?.thumbnail && (
                        <img
                          src={d.variant.thumbnail}
                          alt={d.variant.name}
                          className="h-14 w-14 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium">
                          {d.variant?.name || `Sản phẩm #${idx + 1}`}
                        </div>
                        <div className="text-xs text-neutral-500">
                          Số lượng: {d.quantity}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-neutral-500">Đơn giá</div>
                      <div>{formatCurrency(d.price)}</div>
                      <div className="mt-1 text-xs text-neutral-500">
                        Thành tiền
                      </div>
                      <div className="font-semibold">
                        {formatCurrency(d.price * d.quantity)}
                      </div>
                    </div>
                  </div>
                ))}

                {(!order.details || order.details.length === 0) && (
                  <div className="py-2 text-center text-neutral-500">
                    Không có sản phẩm trong đơn hàng
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

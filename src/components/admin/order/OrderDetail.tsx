import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { getOrderDetail } from "@/api/admin.order";

interface OrderDetailProps {
    id: number;
    onClose?: () => void;
}

export default function OrderDetail({ id, onClose }: OrderDetailProps) {
    const [order, setOrder] = useState<OneOrder | null>(null);
    const [loading, setLoading] = useState(false);

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
            case "PROCESSING":
                return "Đang xử lý";
            case "SHIPPING":
                return "Đang giao";
            case "DELIVERED":
                return "Đã giao";
            case "CANCELLED":
                return "Đã hủy";
            default:
                return s;
        }
    };

    const expectedDeliveryStr = useMemo(() => {
        if (!order?.ghnExpectedDelivery) return "-";
        return new Date(order.ghnExpectedDelivery).toLocaleString("vi-VN");
    }, [order]);

    // giảm giá từ voucher (lấy trực tiếp từ BE)
    const voucherDiscount = useMemo(() => {
        if (!order) return 0;
        return (order as any).voucherDiscount || 0;
    }, [order]);

    // tổng tiền sản phẩm trước khi giảm voucher
    const productTotal = useMemo(() => {
        if (!order) return 0;
        return order.totalPrice ;
    }, [order]);

    // tổng thanh toán = tiền sau giảm + phí ship
    const totalPayment = useMemo(() => {
        if (!order) return 0;
        const fee = order.ghnFee || 0;
        return order.totalPrice + fee - (order.voucherDiscount ?? 0) ;
    }, [order]);

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Chi tiết đơn hàng #{order?.id ?? id}
                        </h2>
                        {order && (
                            <p className="mt-1 text-xs text-neutral-500">
                                Trạng thái:{" "}
                                <span className="font-semibold">
                  {mapOrderStatus(order.orderStatus)}
                </span>
                            </p>
                        )}
                    </div>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="rounded border px-3 py-1.5 text-xs hover:bg-neutral-50"
                        >
                            Đóng
                        </button>
                    )}
                </div>

                {loading && (
                    <div className="p-4 text-sm">Đang tải chi tiết đơn hàng...</div>
                )}

                {!loading && !order && (
                    <div className="p-4 text-sm">Không tìm thấy đơn hàng</div>
                )}

                {!loading && order && (
                    <>
                        <div className="grid gap-4 border-b p-4 md:grid-cols-2">
                            <div className="space-y-2 text-sm">
                                <h3 className="text-sm font-semibold">Thông tin khách hàng</h3>
                                <div className="text-neutral-700">
                                    <div>
                                        <span className="font-medium">Tên: </span>
                                        {order.user?.fullName || "-"}
                                    </div>
                                    <div>
                                        <span className="font-medium">Email: </span>
                                        {order.user?.email || "-"}
                                    </div>
                                    <div>
                                        <span className="font-medium">Số điện thoại: </span>
                                        {order.user?.phone || "-"}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <h3 className="text-sm font-semibold">Địa chỉ giao hàng</h3>
                                <div className="text-neutral-700">
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

                        {/* Thông tin thanh toán */}
                        <div className="grid gap-4 border-b p-4 md:grid-cols-3">
                            <div className="space-y-2 text-sm">
                                <h3 className="text-sm font-semibold">Thanh toán</h3>
                                <div className="text-neutral-700">
                                    <div className="mb-1">
                                        <span className="font-medium">Phương thức: </span>
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {mapPaymentMethod(order.paymentMethod)}
                    </span>
                                    </div>
                                    <div className="mb-1">
                                        <span className="font-medium">Trạng thái: </span>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold
                        ${
                                                order.paymentStatus === "PAID"
                                                    ? "bg-green-100 text-green-700"
                                                    : order.paymentStatus === "PENDING"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : order.paymentStatus === "REFUNDED"
                                                            ? "bg-indigo-100 text-indigo-700"
                                                            : "bg-red-100 text-red-700"
                                            }`}
                                        >
                      {mapPaymentStatus(order.paymentStatus)}
                    </span>
                                    </div>
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
                                    <span>{formatCurrency(order.ghnFee)}</span>
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

                                <div className="mt-1 border-t pt-2 text-sm font-semibold">
                                    <div className="flex justify-between">
                                        <span>Tổng thanh toán</span>
                                        <span>{formatCurrency(totalPayment)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="mb-3 text-sm font-semibold">Sản phẩm trong đơn</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-neutral-50 text-neutral-600">
                                    <tr>
                                        <th className="px-4 py-2 text-left">#</th>
                                        <th className="px-4 py-2 text-left">Ảnh</th>
                                        <th className="px-4 py-2 text-left">Phiên bản</th>
                                        <th className="px-4 py-2 text-left">Giá</th>
                                        <th className="px-4 py-2 text-left">Số lượng</th>
                                        <th className="px-4 py-2 text-left">Thành tiền</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {order.details?.map((d, idx) => (
                                        <tr key={d.id} className="border-t">
                                            <td className="px-4 py-3">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {d.variant?.thumbnail && (
                                                        <img
                                                            src={d.variant.thumbnail}
                                                            alt={d.variant.name}
                                                            className="h-12 w-12 rounded object-cover"
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{d.variant?.name || "-"}</td>
                                            <td className="px-4 py-3">{formatCurrency(d.price)}</td>
                                            <td className="px-4 py-3">{d.quantity}</td>
                                            <td className="px-4 py-3 font-semibold">
                                                {formatCurrency(d.price * d.quantity)}
                                            </td>
                                        </tr>
                                    ))}

                                    {(!order.details || order.details.length === 0) && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-4 text-center text-neutral-500"
                                            >
                                                Không có sản phẩm trong đơn hàng
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

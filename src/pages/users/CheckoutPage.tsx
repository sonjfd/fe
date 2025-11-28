import React, {useEffect, useMemo, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {
    createOrder,
    getShippingFree,
    getUserAddresses,
    vnPayPayment,
    getAvailableVouchers,
    type ApplicableVoucher,
} from "@/api/order.api";
import {useCurrentApp} from "@/components/context/AppContext";

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN").format(value) + "đ";

type PaymentMethod = "CASH" | "VN_PAY";

export const CheckoutPage: React.FC = () => {
    const {cart, isAuthenticated, reloadCart} = useCurrentApp();
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state as { selectedIds?: number[] } | undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const selectedIds = state?.selectedIds ?? [];

    const [addresses, setAddresses] = useState<IAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
        null
    );
    const [loadingAddress, setLoadingAddress] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

    const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(
        null
    );
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [vouchers, setVouchers] = useState<ApplicableVoucher[]>([]);
    const [selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(
        null
    );

    const formatDate = (value?: string | null) => {
        if (!value) return "";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleDateString("vi-VN");
    };
    const items: ICartItem[] = useMemo(() => {
        if (!cart) return [];
        if (!selectedIds || selectedIds.length === 0) return [];
        const idSet = new Set<number>(selectedIds);
        return cart.items.filter((i) => idSet.has(i.id));
    }, [cart, selectedIds]);

    const defaultAddress = useMemo(() => {
        if (addresses.length === 0) return null;
        if (selectedAddressId != null) {
            const found = addresses.find((a) => a.id === selectedAddressId);
            if (found) return found;
        }
        const byDefault = addresses.find((a: any) => a.default || a.isDefault);
        return byDefault ?? addresses[0];
    }, [addresses, selectedAddressId]);

    const itemsSubtotal = useMemo(
        () => items.reduce((sum, item) => sum + item.total, 0),
        [items]
    );

    const shippingFee = Number(shippingQuote?.serviceFee) || 0;

    const selectedVoucher = useMemo(
        () => vouchers.find((v) => v.code === selectedVoucherCode) || null,
        [vouchers, selectedVoucherCode]
    );

    const voucherDiscount = useMemo(() => {
        if (!selectedVoucher) return 0;
        if (itemsSubtotal <= 0) return 0;

        const minOrder = selectedVoucher.minOrderValue ?? 0;
        if (itemsSubtotal < minOrder) return 0;

        if (selectedVoucher.discountType === "PERCENT") {
            let d = (itemsSubtotal * selectedVoucher.discountValue) / 100;
            const max = selectedVoucher.maxDiscountAmount ?? 0;
            if (max > 0 && d > max) d = max;
            return Math.floor(d);
        }


        return Math.min(itemsSubtotal, selectedVoucher.discountValue);
    }, [selectedVoucher, itemsSubtotal]);

    const totalPay = Math.max(itemsSubtotal - voucherDiscount, 0);


    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                setLoadingAddress(true);
                const res = await getUserAddresses();
                const raw = res.data as any;
                const data: IAddress[] = raw?.data ?? raw ?? [];
                setAddresses(data || []);
                if (data && data.length > 0) {
                    const def =
                        data.find((a: any) => a.default || a.isDefault) ?? data[0];
                    setSelectedAddressId(def.id);
                }
            } catch (e) {
                console.error(e);
                toast.error("Không tải được danh sách địa chỉ");
            } finally {
                setLoadingAddress(false);
            }
        };
        fetchAddresses();
    }, []);

    useEffect(() => {
        if (!defaultAddress) return;
        const fetchShippingFee = async () => {
            try {
                setLoadingShipping(true);
                const res = await getShippingFree(defaultAddress.id);
                setShippingQuote(res);
            } catch (e: any) {
                toast.error(e.message);
            } finally {
                setLoadingShipping(false);
            }
        };
        fetchShippingFee();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultAddress?.id]);

    useEffect(() => {
        if (!itemsSubtotal) {
            setVouchers([]);
            setSelectedVoucherCode(null);
            return;
        }

        const fetchVouchers = async () => {
            try {
                const res = await getAvailableVouchers(itemsSubtotal);
                const raw = res.data as any;
                const data: ApplicableVoucher[] = raw?.data ?? raw ?? [];
                setVouchers(data || []);

                // nếu voucher đang chọn không còn hợp lệ thì reset
                if (
                    selectedVoucherCode &&
                    !data.find((v) => v.code === selectedVoucherCode)
                ) {
                    setSelectedVoucherCode(null);
                }
            } catch (e: any) {
                console.error(e);
            }
        };

        fetchVouchers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemsSubtotal]);


    const handlePlaceOrder = async () => {
        if (!defaultAddress) {
            toast.error("Vui lòng thêm địa chỉ nhận hàng trước khi đặt hàng");
            return;
        }
        if (!items || items.length === 0) {
            toast.error("Không có sản phẩm để đặt hàng");
            return;
        }

        try {
            setPlacingOrder(true);

            const payload: CreateOrderRequest = {
                addressId: defaultAddress.id,
                codAmount: paymentMethod === "CASH" ? totalPay : 0,
                itemsValue: totalPay,
                items: items.map((item) => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price,
                })),
                paymentMethod,
                voucherId: selectedVoucher ? selectedVoucher.id : null,
                voucherDiscount: voucherDiscount || 0,
            };

            const res = await createOrder(payload);

            if (res && res.data) {
                const {order} = res.data;

                if (order.paymentMethod === "VN_PAY") {
                    const res = await vnPayPayment(
                        order.id,
                        order.ghnFee + order.totalPrice
                    );
                    const {paymentUrl} = res.data as { paymentUrl: string };
                    if (paymentUrl) {
                        window.location.href = paymentUrl;
                        return;
                    } else {
                        toast.error("Không lấy được link thanh toán VNPay");
                    }
                    return;
                }

                toast.success(res.message || "Đặt hàng thành công");
                reloadCart();
                navigate("/thanks");
            } else {
                toast.error(res?.message || "Có lỗi khi tạo đơn hàng");
            }
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "Có lỗi xảy ra");
        } finally {
            setPlacingOrder(false);
        }
    };

    if (!cart || !items || items.length === 0) {
        return (
            <div className="bg-slate-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-0 py-8">
                    <h1 className="text-xl font-semibold mb-4">Thanh toán</h1>
                    <div className="bg-white rounded-xl shadow-sm py-10 flex flex-col items-center">
                        <p className="text-slate-600 mb-4">
                            Không tìm thấy sản phẩm để thanh toán
                        </p>
                        <Link
                            to="/cart"
                            className="px-6 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600"
                        >
                            Quay lại giỏ hàng
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-0 py-6">
                <h1 className="text-xl font-semibold mb-4">Thanh toán</h1>
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <div className="flex items-center justify-between mb-3">
              <span className="text-orange-500 font-semibold text-sm">
                ĐỊA CHỈ NHẬN HÀNG
              </span>
                                <button
                                    type="button"
                                    onClick={() => toast.info("Demo: chức năng thay đổi địa chỉ")}
                                    className="text-sm text-blue-500 hover:underline"
                                >
                                    Thay đổi
                                </button>
                            </div>
                            {loadingAddress ? (
                                <p className="text-sm text-slate-500">Đang tải địa chỉ...</p>
                            ) : defaultAddress ? (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-slate-800">
                    {defaultAddress.fullName}
                  </span>
                                        <span className="text-slate-600">
                    {defaultAddress.phone}
                  </span>
                                        {(defaultAddress as any).default ||
                                        (defaultAddress as any).isDefault ? (
                                            <span className="px-2 py-0.5 rounded border text-[11px] text-emerald-600 border-emerald-500">
                      Mặc định
                    </span>
                                        ) : null}
                                    </div>
                                    <p className="text-slate-700">
                                        {defaultAddress.addressDetail}-{defaultAddress.ward}-
                                        {defaultAddress.district}-{defaultAddress.province}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-sm text-slate-500">
                                    Bạn chưa có địa chỉ nhận hàng.{" "}
                                    <Link to={"/tai-khoan/dia-chi"}>
                                        <button
                                            type="button"
                                            className="text-blue-500 hover:underline"
                                        >
                                            Thêm địa chỉ
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm">
                            <div className="grid grid-cols-12 px-4 py-3 border-b text-xs text-slate-500">
                                <div className="col-span-6">Sản phẩm</div>
                                <div className="col-span-2 text-center">Đơn giá</div>
                                <div className="col-span-2 text-center">Số lượng</div>
                                <div className="col-span-2 text-center">Thành tiền</div>
                            </div>
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid grid-cols-12 px-4 py-4 border-b last:border-b-0 items-center"
                                >
                                    <div className="col-span-6 flex gap-3">
                                        <img
                                            src={item.thumbnailUrl}
                                            alt={item.productName}
                                            className="w-16 h-16 rounded border object-cover"
                                        />
                                        <div>
                                            <p className="text-sm text-slate-800 line-clamp-2">
                                                {item.productName}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                SKU: {item.sku}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-center text-sm text-slate-700">
                                        {formatCurrency(item.price)}
                                    </div>
                                    <div className="col-span-2 text-center text-sm text-slate-700">
                                        {item.quantity}
                                    </div>
                                    <div className="col-span-2 text-center text-sm font-semibold text-slate-800">
                                        {formatCurrency(item.total)}
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div className="p-4 text-center text-sm text-slate-500">
                                    Giỏ hàng trống.
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <h2 className="text-sm font-semibold mb-3">
                                Phí vận chuyển & ghi chú
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-700">Phương thức giao hàng</span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Nhanh (GHN)
                </span>
                                </div>
                                <div className="text-xs text-slate-500">
                                    Phí vận chuyển được tính dựa trên địa chỉ nhận hàng và giá trị
                                    đơn.
                                </div>
                                <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-600">
                                    {loadingShipping ? (
                                        <span>Đang tính phí vận chuyển...</span>
                                    ) : (
                                        <>
                                            <span>Phí vận chuyển: </span>
                                            <span className="ml-1 font-semibold text-slate-800">
                      {formatCurrency(shippingFee)}
                    </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <h2 className="text-sm font-semibold mb-3">
                                Phương thức thanh toán
                            </h2>
                            <div className="space-y-3">
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="CASH"
                                            checked={paymentMethod === "CASH"}
                                            onChange={() => setPaymentMethod("CASH")}
                                        />
                                        <span className="text-sm text-slate-700">
                    Thanh toán khi nhận hàng (COD)
                  </span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="VN_PAY"
                                            checked={paymentMethod === "VN_PAY"}
                                            onChange={() => setPaymentMethod("VN_PAY")}
                                        />
                                        <span className="text-sm text-slate-700">
                    Thanh toán qua VNPay
                  </span>
                                    </label>
                                </div>
                                <p className="mt-3 text-xs text-slate-500">
                                    Sau khi nhấn &quot;Đặt hàng&quot;, nếu chọn VNPay bạn sẽ được
                                    chuyển sang cổng thanh toán để hoàn tất.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CARD TÓM TẮT ĐƠN HÀNG + VOUCHER */}
                    <div className="w-full lg:w-80">
                        <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4">
                            <h2 className="text-sm font-semibold mb-3">
                                Đơn hàng ({items.length} sản phẩm)
                            </h2>

                            <div className="space-y-2 text-sm text-slate-700">
                                <div className="flex justify-between">
                                    <span>Tổng tiền hàng</span>
                                    <span>{formatCurrency(itemsSubtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phí vận chuyển</span>
                                    <span>{formatCurrency(shippingFee)}</span>
                                </div>

                                {/* Voucher */}
                                <div className="flex flex-col gap-1">
                                    <span>Voucher</span>
                                    {vouchers.length === 0 ? (
                                        <span className="text-xs text-slate-400">
                    Không có voucher khả dụng
                  </span>
                                    ) : (
                                        <select
                                            className="text-sm border rounded px-2 py-1"
                                            value={selectedVoucherCode ?? ""}
                                            onChange={(e) =>
                                                setSelectedVoucherCode(e.target.value || null)
                                            }
                                        >
                                            <option value="">Không dùng voucher</option>
                                            {vouchers.map((v) => (
                                                <option key={v.id} value={v.code}>
                                                    {v.code}{" "}
                                                    {v.discountType === "PERCENT"
                                                        ? `- ${v.discountValue}%`
                                                        : `- ${formatCurrency(v.discountValue)}`}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {selectedVoucher && voucherDiscount > 0 && (
                                        <span className="text-xs text-emerald-600">
                    Giảm {formatCurrency(voucherDiscount)} với mã{" "}
                                            <b>{selectedVoucher.code}</b>
                  </span>
                                    )}

                                    {/* Thẻ hiển thị ảnh + ngày hết hạn */}
                                    {selectedVoucher && (
                                        <div className="mt-1 flex items-center gap-3 rounded border border-dashed border-slate-200 p-2">
                                            {selectedVoucher.imageUrl && (
                                                <img
                                                    src={selectedVoucher.imageUrl}
                                                    alt={selectedVoucher.code}
                                                    className="h-12 w-12 rounded object-cover border"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <div className="text-xs font-semibold">
                                                    {selectedVoucher.code}
                                                </div>
                                                {selectedVoucher.endDate && (
                                                    <div className="text-[11px] text-slate-500">
                                                        Hết hạn: {formatDate(selectedVoucher.endDate)}
                                                    </div>
                                                )}
                                                {selectedVoucher.description && (
                                                    <div className="text-[11px] text-slate-500 line-clamp-2">
                                                        {selectedVoucher.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {voucherDiscount > 0 && (
                                    <div className="flex justify-between text-emerald-700">
                                        <span>Giảm từ voucher</span>
                                        <span>-{formatCurrency(voucherDiscount)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t mt-3 pt-3 flex justify-between items-center">
                                <span className="text-sm text-slate-700">Tổng thanh toán</span>
                                <span className="text-xl font-bold text-rose-600">
                {formatCurrency(totalPay + shippingFee)}
              </span>
                            </div>

                            <p className="mt-2 text-xs text-slate-500">
                                Phương thức thanh toán:{" "}
                                <span className="font-medium">
                {paymentMethod === "CASH"
                    ? "Thanh toán khi nhận hàng"
                    : "VNPay"}
              </span>
                            </p>

                            <button
                                type="button"
                                onClick={handlePlaceOrder}
                                disabled={placingOrder}
                                className={`mt-4 w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-full text-sm font-semibold ${
                                    placingOrder ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                            >
                                {placingOrder ? "Đang xử lý..." : "Đặt hàng"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

};

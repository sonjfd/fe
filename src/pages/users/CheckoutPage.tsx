import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createOrder,
  getShippingFree,
  getUserAddresses,
} from "@/api/order.api";
import { useCurrentApp } from "@/components/context/AppContext";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

type PaymentMethod = "CASH" | "VN_PAY";

export const CheckoutPage: React.FC = () => {
  const { cart, isAuthenticated, reloadCart } = useCurrentApp();
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

  const shippingFee = Number(shippingQuote?.serviceFee);
  const totalPay = itemsSubtotal;

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
      };

      const res = await createOrder(payload); // 👈 res = { message, data }

      console.log("createOrder response >>>", res);

      if (res && res.data) {
        const { order, paymentUrl } = res.data;
        console.log("order.paymentMethod =", order.paymentMethod);
        console.log("paymentUrl =", paymentUrl);

        if (order.paymentMethod === "VN_PAY" && paymentUrl) {
          window.location.href = paymentUrl;
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
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-3">
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
                  <div className="col-span-2 text-center text-sm font-semibold text-rose-600">
                    {formatCurrency(item.total)}
                  </div>
                </div>
              ))}
              <div className="px-4 py-4 border-t space-y-4">
                <div className="flex justify-end text-xs text-slate-600">
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
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    value="CASH"
                    checked={paymentMethod === "CASH"}
                    onChange={() => setPaymentMethod("CASH")}
                  />
                  <span className="text-sm text-slate-700">
                    Thanh toán khi nhận hàng
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
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between items-center">
                <span className="text-sm text-slate-700">Tổng thanh toán</span>
                <span className="text-xl font-bold text-rose-600">
                  {formatCurrency(totalPay)}
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

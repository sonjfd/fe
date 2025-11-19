/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCurrentApp } from "@/components/context/AppContext";
import type { ShippingQuoteResponse } from "@/api/shipping.api";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";

type ShippingMethod = "STANDARD" | "EXPRESS";
type PaymentMethod = "CASH" | "VN_PAY";

export const CheckoutPage: React.FC = () => {
  const { isAuthenticated, cart } = useCurrentApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Nhận danh sách cartDetailId được chọn từ CartPage
  const state = location.state as { selectedIds?: string[] } | undefined;
  const selectedIds = state?.selectedIds ?? [];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent("/checkout")}`);
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  // Nếu không có cart hoặc không có item nào được chọn → quay lại giỏ
  if (!cart || cart.items.length === 0 || selectedIds.length === 0) {
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

  // Lọc các item được chọn
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const items: ICartItem[] = useMemo(
    () => cart.items.filter((i) => selectedIds.includes(i.id)),
    [cart, selectedIds]
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const itemsSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.total, 0),
    [items]
  );
  // Tổng tiền hàng để làm cod / insurance (không tính phí ship)
const baseAmount = itemsSubtotal;

// Tạm thời: kích thước/khối lượng gói hàng
// (nếu bạn có sẵn trong cart item thì thay cho phù hợp)
const totalWeight = 1500; // gram
const parcelLength = 20;
const parcelWidth = 15;
const parcelHeight = 10;

  // TODO: load list địa chỉ từ API user-address, tạm thời mock bằng 1 cái IAddress
  // Bạn có thể thay chỗ này bằng hook: const { addresses } = useUserAddresses();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [addresses, setAddresses] = useState<IAddress[]>([]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // TODO: call API get address list, setAddresses(res.data)
    // tạm cho 1 địa chỉ demo để UI không lỗi
    setAddresses([
      {
        id: 1,
        fullName: "Đỗ Quang Đại",
        phone: "0987xxxxxx",
        province: "Hà Nội",
        district: "Thị xã Sơn Tây",
        ward: "Xã Cổ Đông",
        addressDetail:
          "36 Chợ Bãi Đá, Xã Cổ Đông, Thị xã Sơn Tây, Hà Nội, Vietnam",
        isDefault: true,
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const defaultAddress =
    addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  // Vận chuyển + thanh toán + ghi chú
  const [shippingMethod, setShippingMethod] =
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useState<ShippingMethod>("STANDARD");
  const [paymentMethod, setPaymentMethod] =
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useState<PaymentMethod>("CASH");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [note, setNote] = useState("");

  const [shippingQuote, setShippingQuote] =
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useState<ShippingQuoteResponse | null>(null);
// eslint-disable-next-line react-hooks/rules-of-hooks
const [loadingQuote, setLoadingQuote] = useState(false);

  const shippingFee = shippingMethod === "STANDARD" ? 15000 : 30000;
  const totalPay = itemsSubtotal + shippingFee;
  

  const handlePlaceOrder = async () => {
    if (!defaultAddress) {
      toast.error("Vui lòng thêm địa chỉ nhận hàng trước khi đặt hàng");
      return;
    }

    // TODO: call API createOrder
    // payload có thể là:
    // {
    //   addressId: defaultAddress.id,
    //   paymentMethod,
    //   items: items.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
    //   codAmount: paymentMethod === "CASH" ? totalPay : 0,
    //   ...
    // }

    toast.success("Đặt hàng thành công (demo UI) 🎉");
    navigate("/");
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-0 py-6">
        <h1 className="text-xl font-semibold mb-4">Thanh toán</h1>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Cột trái */}
          <div className="flex-1 space-y-4">
            <CheckoutAddressSection
              address={defaultAddress}
              onChangeAddress={() =>
                toast.info("TODO: Mở modal chọn / sửa địa chỉ 😊")
              }
            />

            <CheckoutItemsSection
              items={items}
              shippingMethod={shippingMethod}
              onChangeShipping={setShippingMethod}
              shippingFee={shippingFee}
              note={note}
              onNoteChange={setNote}
            />

            <CheckoutPaymentSection
              paymentMethod={paymentMethod}
              onChangePayment={setPaymentMethod}
            />
          </div>

          {/* Cột phải */}
          <div className="w-full lg:w-80">
            <CheckoutSummarySection
              itemCount={items.length}
              itemsSubtotal={itemsSubtotal}
              shippingFee={shippingFee}
              totalPay={totalPay}
              paymentMethod={paymentMethod}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* --------------------------- COMPONENTS ---------------------------- */
/* ------------------------------------------------------------------ */

interface CheckoutAddressProps {
  address: IAddress | null;
  onChangeAddress: () => void;
}

const CheckoutAddressSection: React.FC<CheckoutAddressProps> = ({
  address,
  onChangeAddress,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-orange-500 font-semibold text-sm">
          ĐỊA CHỈ NHẬN HÀNG
        </span>
        <button
          type="button"
          onClick={onChangeAddress}
          className="text-sm text-blue-500 hover:underline"
        >
          Thay đổi
        </button>
      </div>

      {address ? (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800">
              {address.fullName}
            </span>
            <span className="text-slate-600">{address.phone}</span>
            {address.isDefault && (
              <span className="px-2 py-0.5 rounded border text-[11px] text-emerald-600 border-emerald-500">
                Mặc định
              </span>
            )}
          </div>
          <p className="text-slate-700">{address.addressDetail}</p>
        </div>
      ) : (
        <div className="text-sm text-slate-500">
          Bạn chưa có địa chỉ nhận hàng.{" "}
          <button
            type="button"
            onClick={onChangeAddress}
            className="text-blue-500 hover:underline"
          >
            Thêm địa chỉ
          </button>
        </div>
      )}
    </div>
  );
};

interface CheckoutItemsProps {
  items: ICartItem[];
  shippingMethod: ShippingMethod;
  onChangeShipping: (m: ShippingMethod) => void;
  shippingFee: number;
  note: string;
  onNoteChange: (v: string) => void;
}

const CheckoutItemsSection: React.FC<CheckoutItemsProps> = ({
  items,
  shippingMethod,
  onChangeShipping,
  shippingFee,
  note,
  onNoteChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="grid grid-cols-12 px-4 py-3 border-b text-xs text-slate-500">
        <div className="col-span-6">Sản phẩm</div>
        <div className="col-span-2 text-center">Đơn giá</div>
        <div className="col-span-2 text-center">Số lượng</div>
        <div className="col-span-2 text-center">Thành tiền</div>
      </div>

      {/* Items */}
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
              <p className="text-xs text-slate-400 mt-1">SKU: {item.sku}</p>
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

      {/* Shipping + note */}
      <div className="px-4 py-4 border-t space-y-4">
        {/* Phương thức vận chuyển */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-sm text-slate-700">
            Phương thức vận chuyển
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => onChangeShipping("STANDARD")}
              className={`px-3 py-2 rounded-full text-xs border ${
                shippingMethod === "STANDARD"
                  ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Tiêu chuẩn · {formatCurrency(15000)}
            </button>
            <button
              type="button"
              onClick={() => onChangeShipping("EXPRESS")}
              className={`px-3 py-2 rounded-full text-xs border ${
                shippingMethod === "EXPRESS"
                  ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Nhanh · {formatCurrency(30000)}
            </button>
          </div>
        </div>

        {/* Ghi chú */}
        <div className="flex flex-col gap-2 text-sm">
          <span className="text-slate-700">Lưu ý cho người bán</span>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

        <div className="flex justify-end text-xs text-slate-600">
          <span>Phí vận chuyển: </span>
          <span className="ml-1 font-semibold text-slate-800">
            {formatCurrency(shippingFee)}
          </span>
        </div>
      </div>
    </div>
  );
};

interface CheckoutPaymentProps {
  paymentMethod: PaymentMethod;
  onChangePayment: (m: PaymentMethod) => void;
}

const CheckoutPaymentSection: React.FC<CheckoutPaymentProps> = ({
  paymentMethod,
  onChangePayment,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-sm font-semibold mb-3">Phương thức thanh toán</h2>

      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="payment"
            value="CASH"
            checked={paymentMethod === "CASH"}
            onChange={() => onChangePayment("CASH")}
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
            onChange={() => onChangePayment("VN_PAY")}
          />
          <span className="text-sm text-slate-700">
            Thanh toán qua VNPay
          </span>
        </label>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Sau khi nhấn &quot;Đặt hàng&quot;, nếu chọn VNPay bạn sẽ được chuyển
        sang cổng thanh toán để hoàn tất.
      </p>
    </div>
  );
};

interface CheckoutSummaryProps {
  itemCount: number;
  itemsSubtotal: number;
  shippingFee: number;
  totalPay: number;
  paymentMethod: PaymentMethod;
  onPlaceOrder: () => void;
}

const CheckoutSummarySection: React.FC<CheckoutSummaryProps> = ({
  itemCount,
  itemsSubtotal,
  shippingFee,
  totalPay,
  paymentMethod,
  onPlaceOrder,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4">
      <h2 className="text-sm font-semibold mb-3">
        Đơn hàng ({itemCount} sản phẩm)
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
        onClick={onPlaceOrder}
        className="mt-4 w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-full text-sm font-semibold"
      >
        Đặt hàng
      </button>
    </div>
  );
};

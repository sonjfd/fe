import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

type PaymentStatus = "COD" | "SUCCESS" | "FAILED";

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const statusParam = searchParams.get("status");
  const errorMessage = searchParams.get("message");
  const orderId = searchParams.get("orderId");

  const status: PaymentStatus = useMemo(() => {
    if (statusParam === "SUCCESS") return "SUCCESS";
    if (statusParam === "FAILED") return "FAILED";
    return "COD";
  }, [statusParam]);

  const handleGoHome = () => navigate("/");
  const handleViewOrders = () => navigate("/tai-khoan/don-mua");
  const handleGoCart = () => navigate("/cart");

  const title =
    status === "SUCCESS"
      ? "Thanh toán thành công!"
      : status === "FAILED"
      ? "Thanh toán thất bại!"
      : "Đặt hàng thành công!";

  const description =
    status === "SUCCESS"
      ? "Đơn hàng của bạn đã thanh toán qua VNPay. Chúng tôi sẽ xử lý và giao hàng trong thời gian sớm nhất."
      : status === "FAILED"
      ? "Thanh toán qua VNPay không thành công. Bạn có thể thử lại hoặc chọn phương thức thanh toán khác."
      : "Đơn hàng của bạn đã được ghi nhận và sẽ thanh toán khi nhận hàng.";

  const iconBgColor =
    status === "FAILED"
      ? "#fee2e2"
      : status === "SUCCESS"
      ? "#dcfce7"
      : "#e5e7eb";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
        {/* Icon */}
        <div
          className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4"
          style={{ backgroundColor: iconBgColor }}
        >
          {status === "SUCCESS" && <span className="text-3xl">✅</span>}
          {status === "FAILED" && <span className="text-3xl">❌</span>}
          {status === "COD" && <span className="text-3xl">📦</span>}
        </div>

        {/* Title + mô tả chính */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h1>

        <p className="text-gray-600 mb-3">{description}</p>

        {/* Mã đơn hàng (nếu có) */}
        {orderId && status !== "FAILED" && (
          <p className="text-gray-800 text-sm mb-3">
            Mã đơn hàng của bạn:{" "}
            <span className="font-semibold">{orderId}</span>
          </p>
        )}

        {/* Lý do thất bại từ backend */}
        {status === "FAILED" && errorMessage && (
          <p className="text-red-600 font-semibold text-sm mb-4">
            Lý do: {errorMessage}
          </p>
        )}

        {/* Button actions */}
        {status === "FAILED" ? (
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={handleGoCart}
              className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
            >
              Quay lại giỏ hàng
            </button>
            <button
              onClick={handleGoHome}
              className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Về trang chủ
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={handleGoHome}
              className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
            >
              Tiếp tục mua hàng
            </button>
            <button
              onClick={handleViewOrders}
              className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Xem đơn hàng của tôi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;

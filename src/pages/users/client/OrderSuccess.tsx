// src/pages/OrderFailed.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const OrderFailed: React.FC = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate("/checkout"); // đổi path sang trang thanh toán của bạn
  };

  const handleGoHome = () => {
    navigate("/"); // đổi path nếu cần
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
        {/* Icon thất bại */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <span className="text-3xl">❌</span>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Đặt hàng thất bại
        </h1>

        <p className="text-gray-600 mb-6">
          Rất tiếc, đã xảy ra lỗi trong quá trình xử lý thanh toán hoặc đặt hàng.
          Vui lòng kiểm tra lại thông tin thanh toán, kết nối mạng hoặc thử lại sau.
        </p>

        {/* Gợi ý lỗi – bạn có thể sửa tuỳ ý */}
        <ul className="text-left text-sm text-gray-600 bg-gray-50 rounded-xl p-4 space-y-1 mb-6">
          <li>• Thông tin thẻ thanh toán không chính xác</li>
          <li>• Số dư tài khoản không đủ</li>
          <li>• Kết nối mạng bị gián đoạn</li>
        </ul>

        {/* Nút hành động */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRetry}
            className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition"
          >
            Thử đặt lại
          </button>
          <button
            onClick={handleGoHome}
            className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFailed;

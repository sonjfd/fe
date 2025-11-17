import React from "react";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] bg-slate-50">
      {/* Hero */}
      <section className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Giới thiệu về <span className="text-blue-600">DSH</span>
          </h1>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Chào mừng bạn đến với <strong>DSH</strong>, hệ thống thương mại điện tử
            được xây dựng nhằm mang đến trải nghiệm mua sắm – bán hàng nhanh chóng,
            thông minh và tối ưu. Mỗi giao dịch, dù nhỏ hay lớn, đều cần được vận hành
            mượt mà, minh bạch và tiện lợi – đó chính là lý do <strong>DSH</strong> ra đời.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-4 py-10 md:py-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            🌐 Sứ mệnh của DSH
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            <strong>DSH</strong> hướng tới mục tiêu tạo ra một hệ sinh thái thương mại
            điện tử hiện đại, nơi:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
            <li>Người mua dễ dàng tìm được sản phẩm chất lượng, giá tốt.</li>
            <li>
              Người bán có công cụ mạnh mẽ để quản lý sản phẩm, tồn kho, đơn hàng và vận hành
              kinh doanh hiệu quả.
            </li>
            <li>
              Mọi trải nghiệm đều được tối ưu từ tốc độ, giao diện đến khả năng xử lý dữ liệu.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            Chúng tôi không chỉ xây dựng một trang web bán hàng —{" "}
            <strong>chúng tôi xây dựng một hệ thống kết nối giá trị.</strong>
          </p>
        </div>
      </section>

      {/* Core features */}
      <section className="max-w-5xl mx-auto px-4 pb-10 md:pb-12 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            ⚙️ Cốt lõi của hệ thống DSH
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>DSH</strong> được phát triển dựa trên kiến trúc linh hoạt và mạnh mẽ,
            tích hợp đầy đủ tính năng cần thiết của một hệ thống ecommerce hiện đại:
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🔸 Quản lý sản phẩm & biến thể thông minh
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Hỗ trợ đa biến thể (màu sắc, kích cỡ, thuộc tính mở rộng).</li>
              <li>Quản lý kho theo từng SKU.</li>
              <li>Tối ưu hiển thị hình ảnh, giá, tồn kho theo từng biến thể.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🔸 Giỏ hàng & thanh toán tối ưu
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Theo dõi giỏ hàng theo tài khoản người dùng.</li>
              <li>Trải nghiệm mượt mà khi thêm – sửa – xoá sản phẩm.</li>
              <li>Tự động tính giá, voucher, phí vận chuyển.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🔸 Quản lý kho – nhập hàng – tồn kho chính xác
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Theo dõi nhập kho, xuất kho, điều chuyển.</li>
              <li>Kiểm soát sai lệch tồn kho theo từng biến thể.</li>
              <li>Hỗ trợ nhiều kho cho từng sản phẩm.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🔸 Đặt hàng & vận chuyển tự động
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Kết nối API các đơn vị vận chuyển như GHN.</li>
              <li>Tự động lấy phí, mã vận đơn, cập nhật trạng thái giao hàng.</li>
              <li>Theo dõi lịch sử vận chuyển gần như thời gian thực.</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🔸 Quản lý người dùng – phân quyền – bảo mật
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Đăng nhập bảo mật, kiểm soát phiên và token.</li>
              <li>Phân quyền theo vai trò (admin, staff, v.v.).</li>
              <li>Lưu trữ thông tin địa chỉ, lịch sử đơn hàng rõ ràng.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="max-w-5xl mx-auto px-4 pb-10 md:pb-12">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            🚀 Tầm nhìn của DSH
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Chúng tôi mong muốn đưa <strong>DSH</strong> trở thành nền tảng thương mại
            điện tử mạnh mẽ dành cho doanh nghiệp vừa và nhỏ, cửa hàng, nhà bán lẻ hoặc
            các thương hiệu muốn số hoá hoạt động kinh doanh.
          </p>
          <p className="text-gray-700 leading-relaxed">
            <strong>DSH</strong> không chỉ là hệ thống —{" "}
            <strong>DSH là bước đệm để doanh nghiệp của bạn mở rộng, phát triển và bứt phá.</strong>
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-4 pb-10 md:pb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          ❤️ Giá trị chúng tôi mang đến
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                <strong>Đơn giản hóa vận hành</strong> – giảm thiểu sai sót, tăng hiệu suất.
              </li>
              <li>
                <strong>Trải nghiệm người dùng tối ưu</strong> – giao diện trực quan, nhanh, thân thiện.
              </li>
              <li>
                <strong>Khả năng mở rộng linh hoạt</strong> – dễ tích hợp, dễ nâng cấp.
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                <strong>Bảo mật cao</strong> – dữ liệu được bảo vệ, phân quyền rõ ràng.
              </li>
              <li>
                <strong>Hỗ trợ liên tục</strong> – đồng hành cùng sự phát triển của doanh nghiệp.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA / Closing */}
      <section className="border-t bg-white">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
            🤝 DSH – Nơi kết nối sản phẩm & khách hàng
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto mb-6 leading-relaxed">
            Dù bạn là khách hàng đang tìm kiếm sản phẩm tốt nhất, hay là doanh nghiệp muốn
            tối ưu hệ thống bán hàng, <strong>DSH</strong> luôn sẵn sàng đồng hành cùng bạn.
          </p>
          <p className="text-lg font-semibold text-gray-900">
            DSH – <span className="text-blue-600">Simplify. Sell. Scale.</span>
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

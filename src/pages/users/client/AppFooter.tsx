import { Container } from "./AppHeader";

export const AppFooter: React.FC = () => (
  <footer className="mt-10 border-t border-slate-200 bg-white text-sm">
    <Container className="py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="col-span-2 md:col-span-1">
        <div className="font-extrabold text-xl text-slate-900">DSH <span className="text-slate-600">STORE</span></div>
        <p className="mt-2 text-slate-600">Đồ chính hãng – giá tốt mỗi ngày.</p>
        <div className="mt-3 text-slate-500">Hotline: 0987.863.174</div>
      </div>
      <div>
        <div className="font-semibold">Hỗ trợ</div>
        <ul className="mt-3 space-y-2 text-slate-600">
          <li><a href="#" className="hover:text-indigo-700">Hướng dẫn mua hàng</a></li>
          <li><a href="#" className="hover:text-indigo-700">Chính sách đổi trả</a></li>
          <li><a href="#" className="hover:text-indigo-700">Vận chuyển – giao nhận</a></li>
        </ul>
      </div>
      <div>
        <div className="font-semibold">Về chúng tôi</div>
        <ul className="mt-3 space-y-2 text-slate-600">
          <li><a href="#" className="hover:text-indigo-700">Hệ thống cửa hàng</a></li>
          <li><a href="#" className="hover:text-indigo-700">Tuyển dụng</a></li>
          <li><a href="#" className="hover:text-indigo-700">Liên hệ</a></li>
        </ul>
      </div>
      <div>
        <div className="font-semibold">Kết nối</div>
        <ul className="mt-3 space-y-2 text-slate-600">
          <li><a href="#" className="hover:text-indigo-700">Facebook</a></li>
          <li><a href="#" className="hover:text-indigo-700">Instagram</a></li>
          <li><a href="#" className="hover:text-indigo-700">TikTok</a></li>
        </ul>
      </div>
    </Container>
    <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
      © {new Date().getFullYear()} DSH STORE. All rights reserved.
    </div>
  </footer>
);

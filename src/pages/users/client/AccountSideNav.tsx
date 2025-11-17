import { NavLink } from "react-router-dom";
import { useCurrentApp } from "../../components/context/AppContext.tsx"; // sửa đường dẫn nếu khác

export default function AccountSideNav() {
    const { user } = useCurrentApp();
    const name = user?.fullName || "Tài khoản";
    const avatar = user?.avatar || "https://placehold.co/80x80";

    const link = ({ isActive }: { isActive: boolean }) =>
        `block px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-800 ${
            isActive ? "bg-slate-100 text-slate-900 font-medium" : "text-gray-700"
        }`;

    return (
        <aside className="rounded-2xl border bg-white p-4">
            <div className="mb-3 flex items-center gap-3">
                <img src={avatar} className="h-10 w-10 rounded-full object-cover" />
                <div>
                    <div className="font-semibold leading-tight">{name}</div>
                    <NavLink to="/tai-khoan/ho-so" className="text-xs text-blue-700 hover:underline">
                        Sửa Hồ Sơ
                    </NavLink>
                </div>
            </div>

            <nav className="space-y-1">
                <div className="px-2 text-[12px] font-semibold uppercase text-gray-500">Tài Khoản Của Tôi</div>
                <NavLink to="/tai-khoan/ho-so" className={link}>Hồ Sơ</NavLink>
                <NavLink to="/tai-khoan/dia-chi" className={link}>Địa Chỉ</NavLink>
                <NavLink to="/tai-khoan/doi-mat-khau" className={link}>Đổi Mật Khẩu</NavLink>
            </nav>
        </aside>
    );
}

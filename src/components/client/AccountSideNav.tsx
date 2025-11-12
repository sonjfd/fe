import { NavLink } from "react-router-dom";
import React from "react";
import { getMe } from "../../api/account.api";
import avatarDefault from "@/assets/img/avatar-default.png";

export default function AccountSideNav() {
  const [name, setName] = React.useState<string>("");
  const [avatar, setAvatar] = React.useState<string>("");
  React.useEffect(() => {
    getMe().then((u) => {
      setName(u.fullName);
      setAvatar(u.avatar || "");
    });
  }, []);

  const link = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded-md hover:bg-gray-50 hover:text-gray-600 ${
      isActive ? "bg-gray-100 text-gray-700 font-medium" : "text-gray-700"
    }`;

  return (
    <aside className="w-64 p-4 border-r bg-white min-h-screen">
      <div className="mb-4 flex items-center gap-3">
        <img
          src={avatarDefault}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <div className="font-semibold">{name || "Tài khoản"}</div>
          <NavLink
            to="/tai-khoan/ho-so"
            className="text-sm text-blue-600 hover:underline"
          >
            Sửa Hồ Sơ
          </NavLink>
        </div>
      </div>
      <nav className="space-y-1">
        <div className="text-sm font-semibold text-gray-500 uppercase px-4">
          Tài Khoản Của Tôi
        </div>
        <NavLink to="/tai-khoan/ho-so" className={link}>
          Hồ Sơ
        </NavLink>
        <NavLink to="/tai-khoan/dia-chi" className={link}>
          Địa Chỉ
        </NavLink>
        <NavLink to="/tai-khoan/doi-mat-khau" className={link}>
          Đổi Mật Khẩu
        </NavLink>
      </nav>
    </aside>
  );
}

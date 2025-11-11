import { registerApi } from "@/api/auth.api";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  gender: string;
}
const Register = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const handleRegister = async (values: FormData) => {
    try {
      const { fullName, email, phone, password, gender } = values;
      const res = await registerApi(fullName, email, password, phone, gender);

      if (res?.data) {
        toast.success("Đăng ký thành công");
        navigate("/login");
      } else {
        toast.error(res?.message || "Đăng ký thất bại, vui lòng thử lại");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 mt-8">
        <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900">
          Đăng ký
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit(handleRegister)}>
          <div>
            <label
              htmlFor="fullName"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Họ và tên <span className="text-red-600">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Dinh Ngoc Son"
              className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20"
              {...register("fullName", {
                required: "Vui lòng nhập họ tên",
                minLength: { value: 3, message: "Tên phải lớn hơn 3 kí tự" },
              })}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Email <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20"
              {...register("email", {
                required: "Vui lòng nhập email",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email không hợp lệ",
                },
              })}
            />

            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Số điện thoại */}
          <div>
            <label
              htmlFor="phone"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Số điện thoại <span className="text-red-600">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="0123456789"
              className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20"
              {...register("phone", {
                required: "Vui long nhập số điện thoại",
                pattern: {
                  value: /^0\d{9,10}$/,
                  message: "Số điện thoại bắt đầu bằng 0,đủ 10 kí tự",
                },
              })}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Mật khẩu */}
          <div className="relative">
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Mật khẩu <span className="text-red-600">*</span>
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20"
              {...register("password", {
                required: "Vui lòng nhập mật khẩu",
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/,
                  message:
                    "Mật khẩu phải có tối thiểu 6 ký tự, gồm ít nhất 1 chữ thường và 1 chữ hoa",
                },
              })}
            />

            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-3 right-3 flex items-center text-xl text-slate-500 hover:text-slate-900 mt-5"
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>

          {/* Giới tính */}
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Giới tính
            </span>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  className="text-blue-600 focus:ring-blue-600"
                  checked
                />
                Nam
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  className="text-blue-600 focus:ring-blue-600"
                />
                Nữ
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm ring-1 ring-inset ring-blue-600/30 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/30"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <Link
            to={"/login"}
            className="font-medium text-blue-600 hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </>
  );
};

export default Register;

import { registerApi } from "@/api/auth.api";
import { useForm } from "react-hook-form";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  gender: string;
}

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      gender: "MALE", // default gender
    },
  });

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
      toast.error(error.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 mt-8">
      <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900">
        Đăng ký
      </h1>

      <form className="space-y-4" onSubmit={handleSubmit(handleRegister)}>
        {/* Họ và tên */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Họ và tên <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            placeholder="Dinh Ngoc Son"
            className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20"
            {...register("fullName", {
              required: "Vui lòng nhập họ tên",
              minLength: { value: 3, message: "Tên phải lớn hơn 3 kí tự" },
              validate: (v) =>
                v.trim().length > 0 || "Không được chỉ nhập khoảng trắng",
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
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20"
            {...register("email", {
              required: "Vui lòng nhập email",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Email không hợp lệ",
              },
            })}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Số điện thoại <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            placeholder="0123456789"
            className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20"
            {...register("phone", {
              required: "Vui lòng nhập số điện thoại",
              pattern: {
                value: /^(0\d{9,10}|(\+84)\d{8,9})$/,
                message:
                  "Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có độ dài hợp lệ",
              },
            })}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Mật khẩu */}
        <div className="relative">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Mật khẩu <span className="text-red-600">*</span>
          </label>
          <input
            type={showPassword ? "text" : "password"}
            className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20"
            {...register("password", {
              required: "Vui lòng nhập mật khẩu",
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/,
                message:
                  "Mật khẩu phải có tối thiểu 6 ký tự, gồm ít nhất 1 chữ thường và 1 chữ hoa",
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-3 right-3 flex items-center text-xl text-slate-500 hover:text-slate-900 mt-5"
          >
            {showPassword ? <IoEyeOff /> : <IoEye />}
          </button>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Giới tính */}
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Giới tính
          </span>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 rounded-xl border px-3 py-2">
              <input
                type="radio"
                value="MALE"
                {...register("gender")}
                defaultChecked
              />
              Nam
            </label>
            <label className="flex items-center gap-2 rounded-xl border px-3 py-2">
              <input type="radio" value="FEMALE" {...register("gender")} />
              Nữ
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/30"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Đã có tài khoản?{" "}
        <Link to="/login" className="font-medium text-blue-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default Register;

// src/pages/auth/ResetPasswordPage.tsx
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import { IoEye, IoEyeOff } from "react-icons/io5";
import axios from "@/services/axios.customize";

type FormValues = {
  password: string;
  confirmPassword: string;
};

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const passwordValue = watch("password");

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      toast.error("Token không hợp lệ hoặc đã hết hạn.");
      return;
    }

    if (data.password !== data.confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp.");
      return;
    }

    try {
      await axios.post("/api/v1/auth/password/reset", {
        token,
        password: data.password,
      });

      toast.success("Cập nhật mật khẩu thành công, vui lòng đăng nhập lại.");
      navigate("/login");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Cập nhật mật khẩu thất bại. Vui lòng thử lại.";
      toast.error(msg);
    }
  };

  const handleResendToken = async () => {
    if (!token) {
      toast.error("Token không hợp lệ, không thể gửi lại email.");
      return;
    }

    try {
      setResendLoading(true);
      setResendMsg(null);

      const res = await axios.post(
        "http://localhost:8080/api/v1/auth/password/reset/resend",
        { token }
      );

      const msg = res.data?.message || "Đã gửi email đặt lại mật khẩu mới.";
      setResendMsg(msg);
      toast.success(msg);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Gửi lại email thất bại. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-slate-900 text-center mb-2">
          Đặt lại mật khẩu
        </h1>
        <p className="text-sm text-slate-500 text-center mb-4">
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>

        {!token && (
          <p className="mb-4 text-xs text-red-600 text-center">
            Token không hợp lệ hoặc đã hết hạn. Hãy yêu cầu gửi lại email đặt
            lại mật khẩu.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Mật khẩu mới */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20"
                placeholder="Nhập mật khẩu mới"
                {...register("password", {
                  required: "Vui lòng nhập mật khẩu mới",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-xl text-slate-500 hover:text-slate-900"
              >
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Nhập lại mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nhập lại mật khẩu
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20"
                placeholder="Nhập lại mật khẩu"
                {...register("confirmPassword", {
                  required: "Vui lòng nhập lại mật khẩu",
                  validate: (value) =>
                    value === passwordValue || "Mật khẩu nhập lại không khớp",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-xl text-slate-500 hover:text-slate-900"
              >
                {showConfirmPassword ? <IoEyeOff /> : <IoEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Nút cập nhật */}
          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </form>

        {/* Gửi lại email */}
        <div className="mt-6 border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500 mb-2">
            Không dùng được liên kết trong email? Bạn có thể yêu cầu hệ thống
            gửi lại email đặt lại mật khẩu.
          </p>
          <button
            type="button"
            onClick={handleResendToken}
            disabled={resendLoading || !token}
            className="inline-flex w-full items-center justify-center rounded-xl border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
          >
            {resendLoading ? "Đang gửi lại..." : "Gửi lại email"}
          </button>
          {resendMsg && (
            <p className="mt-2 text-xs text-emerald-600 text-center">
              {resendMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

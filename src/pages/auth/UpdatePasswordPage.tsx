import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

type FormValues = {
  password: string;
  confirmPassword: string;
};

const UpdatePasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      setError("root", {
        type: "token",
        message: "Token không hợp lệ hoặc đã hết hạn.",
      });
      setIsTokenExpired(true);
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/v1/auth/update-password", {
        token,
        password: data.password,
      });
      toast.success("Cập nhật mật khẩu thành công");
      navigate("/login");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Cập nhật mật khẩu thất bại. Vui lòng thử lại.";

      setError("root", {
        type: "server",
        message: msg,
      });

      // nếu BE trả lỗi có chữ "hết hạn" → hiện nút gửi lại email
      if (msg.toLowerCase().includes("hết hạn")) {
        setIsTokenExpired(true);
      }
    }
  };

  // Gửi yêu cầu BE tạo token mới và gửi email mới
  const handleResendToken = async () => {
    if (!token) return;

    try {
      setResendLoading(true);
      setResendMsg(null);

      const res = await axios.post(
        "http://localhost:8080/api/v1/auth/resend-update-password",
        { token }
      );

      setResendMsg(res.data?.message || "Đã gửi email chứa liên kết mới.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Không thể gửi lại token. Vui lòng thử lại.";
      setResendMsg(msg);
    } finally {
      setResendLoading(false);
    }
  };

  const passwordValue = watch("password");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-slate-900 text-center mb-2">
          Cập nhật mật khẩu
        </h1>
        <p className="text-sm text-slate-500 text-center mb-6">
          Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
        </p>

        {!token && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            Token không hợp lệ hoặc đã hết hạn.
          </div>
        )}

        {errors.root?.message && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {errors.root.message}
          </div>
        )}

        {/* Khi token hết hạn → hiện box & nút gửi lại email */}
        {isTokenExpired && token && (
          <div className="mb-4 rounded-xl bg-yellow-50 border border-yellow-300 px-4 py-3 text-sm">
            <p className="text-yellow-700 mb-2">
              Token đổi mật khẩu đã hết hạn. Bạn có thể yêu cầu hệ thống gửi lại
              email với liên kết mới.
            </p>
            <button
              type="button"
              onClick={handleResendToken}
              disabled={resendLoading}
              className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              {resendLoading
                ? "Đang gửi..."
                : "Gửi lại email cập nhật mật khẩu"}
            </button>
            {resendMsg && (
              <p className="mt-2 text-xs text-emerald-700">{resendMsg}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Mật khẩu mới */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
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
            <input
              type="password"
              className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20"
              placeholder="Nhập lại mật khẩu"
              {...register("confirmPassword", {
                required: "Vui lòng nhập lại mật khẩu",
                validate: (value) =>
                  value === passwordValue || "Mật khẩu nhập lại không khớp",
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;

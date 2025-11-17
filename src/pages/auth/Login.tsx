import { fetchAccountAPI, loginApi } from "@/api/auth.api";
import { useCurrentApp } from "@/components/context/AppContext";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const { setIsAuthenticated, setUser, reloadWishlistCount} = useCurrentApp();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) toast.error(decodeURIComponent(error));
  }, [searchParams]);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const handleLogin = async (values: FormData) => {
    try {
      const { email, password } = values;
      const res = await loginApi(email, password);

      if (res.data) {
        localStorage.setItem("access_token", res.data.access_token);
        const acc = await fetchAccountAPI();
        setUser(acc.data?.user as any);
        setIsAuthenticated(true);
        await reloadWishlistCount();

        if (acc.data?.user?.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  const handleGoogleLogin = () => {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    window.location.href = `${API_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="flex min-h-[500px] items-center justify-center bg-slate-100">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-center text-2xl font-semibold text-slate-800">
          Đăng nhập
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit(handleLogin)}>
          {/* email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              {...register("email", {
                required: "Vui lòng nhập email",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email không hợp lệ",
                },
              })}
            />
            {errors.email && (
              <p className="pt-1 text-xs text-red-600">
                {errors.email?.message}
              </p>
            )}
          </div>

          {/* password */}
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mật khẩu <span className="text-red-600">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
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
              <p className="pt-1 text-xs text-red-600">
                {errors.password?.message}
              </p>
            )}

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-3 right-3 mt-5 flex items-center text-xl text-slate-500 hover:text-slate-900"
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 transition"
          >
            Đăng nhập
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200"></div>
          <span className="text-xs uppercase tracking-wider text-slate-500">
            hoặc
          </span>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        {/* Nút Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-300 py-2 hover:bg-slate-50 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="h-5 w-5"
          />
          <span className="text-sm font-medium text-slate-700">
            Đăng nhập với Google
          </span>
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          Chưa có tài khoản?{" "}
          <Link to={"/register"} className="text-blue-600 hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

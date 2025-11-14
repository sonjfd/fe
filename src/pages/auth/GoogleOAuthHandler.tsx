import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentApp } from "@/components/context/AppContext";
import { toast } from "react-toastify";
import { fetchAccountAPI } from "@/api/auth.api";

const GoogleOAuthHandler = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setUser } = useCurrentApp();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");

    if (!token) {
      toast.error("Không tìm thấy access token!");
      navigate("/login");
      return;
    }

    localStorage.setItem("access_token", token);

    const fetchUser = async () => {
      try {
        const res = await fetchAccountAPI();
        const user = res.data?.user;

        if (user) {
          setUser(user);
          setIsAuthenticated(true);
          navigate("/");
        }
      } catch (error: any) {
        toast.error(error.message);
        navigate("/login");
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg font-medium">Đang xử lý đăng nhập Google...</p>
    </div>
  );
};

export default GoogleOAuthHandler;

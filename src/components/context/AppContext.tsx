import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { fetchAccountAPI } from "@/api/auth.api";
import { fetchMyWishlist } from "@/api/home.api";
import CenterSpinner from "../CustomLoading";

interface IAppContext {
  isAuthenticated: boolean;
  isAppLoading: boolean;
  setIsAppLoading: (v: boolean) => void;
  setUser: (v: IContext | null) => void;
  setIsAuthenticated: (v: boolean) => void;
  user: IContext | null;

  // 👇 thêm phần này
  wishlistCount: number;
  setWishlistCount: (v: number) => void;
  reloadWishlistCount: () => Promise<void>;
}

const CurrentAppContext = createContext<IAppContext | null>(null);

type TProps = {
  children: React.ReactNode;
};

export const AppProvider = (props: TProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IContext | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [wishlistCount, setWishlistCount] = useState(0);

  // gọi API lấy total wishlist
  const reloadWishlistCount = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistCount(0);
      return;
    }
    try {
      // page=0, size=1 chỉ để lấy total
      const page = await fetchMyWishlist(0, 1, "createdAt", "desc");
      setWishlistCount(page.total);
    } catch {
      setWishlistCount(0);
    }
  }, [isAuthenticated]);

  // Lần đầu mở app: check account
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const res = await fetchAccountAPI();
        if (res.data?.user) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        }
      } finally {
        setIsAppLoading(false);
      }
    };

    fetchAccount();
  }, []);

  // Mỗi khi isAuthenticated đổi (login / logout) thì xử lý wishlistCount
  useEffect(() => {
    if (isAuthenticated) {
      reloadWishlistCount();
    } else {
      setWishlistCount(0);
    }
  }, [isAuthenticated, reloadWishlistCount]);

  if (isAppLoading) {
    return <CenterSpinner />;
  }

  return (
    <CurrentAppContext.Provider
      value={{
        isAuthenticated,
        isAppLoading,
        setIsAppLoading,
        setUser,
        setIsAuthenticated,
        user,
        wishlistCount,
        setWishlistCount,
        reloadWishlistCount,
      }}
    >
      {props.children}
    </CurrentAppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrentApp = () => {
  const currentAppContext = useContext(CurrentAppContext);
  if (!currentAppContext) {
    throw new Error(
      "useCurrentApp has to be use within  <CurrentAppContext.Provider>"
    );
  }
  return currentAppContext;
};

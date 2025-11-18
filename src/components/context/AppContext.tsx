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
import { getCartApi } from "@/api/cart.api";

interface IAppContext {
  isAuthenticated: boolean;
  isAppLoading: boolean;
  setIsAppLoading: (v: boolean) => void;
  setUser: (v: IContext | null) => void;
  setIsAuthenticated: (v: boolean) => void;
  user: IContext | null;

  // Wishlist
  wishlistCount: number;
  setWishlistCount: (v: number) => void;
  reloadWishlistCount: () => Promise<void>;

  // 👇 Cart
  cart: ICartResponse | null;
  cartCount: number;
  isCartLoading: boolean;
  reloadCart: () => Promise<void>;
}

const CurrentAppContext = createContext<IAppContext | null>(null);

type TProps = {
  children: React.ReactNode;
};

export const AppProvider = (props: TProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IContext | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);

  // Wishlist
  const [wishlistCount, setWishlistCount] = useState(0);

  // Cart
  const [cart, setCart] = useState<ICartResponse | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const cartCount = cart?.items?.length ?? 0;

  /* ---------- WISHLIST ---------- */
  const reloadWishlistCount = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistCount(0);
      return;
    }
    try {
      const page = await fetchMyWishlist(0, 1, "createdAt", "desc");
      setWishlistCount(page.total);
    } catch {
      setWishlistCount(0);
    }
  }, [isAuthenticated]);

  /* ---------- CART ---------- */
  const reloadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setIsCartLoading(true);
      const res = await getCartApi(); // { message, data }
      setCart(res.data ?? null);
    } catch (e) {
      console.error("Failed to load cart", e);
      setCart(null);
    } finally {
      setIsCartLoading(false);
    }
  }, [isAuthenticated]);

  /* ---------- FETCH ACCOUNT LẦN ĐẦU ---------- */
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

  /* ---------- MỖI KHI LOGIN / LOGOUT ---------- */
  useEffect(() => {
    if (isAuthenticated) {
      reloadWishlistCount();
      reloadCart();
    } else {
      setWishlistCount(0);
      setCart(null);
    }
  }, [isAuthenticated, reloadWishlistCount, reloadCart]);

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

        cart,
        cartCount,
        isCartLoading,
        reloadCart,
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

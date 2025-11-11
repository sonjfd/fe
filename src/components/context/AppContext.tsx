import { createContext, useContext, useEffect, useState } from "react";
import { fetchAccountAPI } from "@/api/auth.api";
import CenterSpinner from "../CustomLoading";

interface IAppContext {
  isAuthenticated: boolean;
  isAppLoading: boolean;
  setIsAppLoading: (v: boolean) => void;
  setUser: (v: IUser | null) => void;
  setIsAuthenticated: (v: boolean) => void;
  user: IUser | null;
}

const CurrentAppContext = createContext<IAppContext | null>(null);
type TProps = {
  children: React.ReactNode;
};
export const AppProvider = (props: TProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAccount = async () => {
      const res = await fetchAccountAPI();
      if (res.data) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
      setIsAppLoading(false);
    };
    fetchAccount();
  }, []);
  return isAppLoading == true ? (
    <CenterSpinner />
  ) : (
    <CurrentAppContext.Provider
      value={{
        isAuthenticated,
        user,
        setIsAuthenticated,
        setUser,
        isAppLoading,
        setIsAppLoading,
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

import { useCurrentApp } from "../context/AppContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface IProps {
  children: React.ReactNode;
}

const Auth = (props: IProps) => {
  const { isAuthenticated } = useCurrentApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return <>{props.children}</>;
};

export default Auth;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";

import ROUTER from "./router";
import { ToastContainer } from "react-toastify";
import { AppProvider } from "./components/context/AppContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={ROUTER} />
      <ToastContainer position="top-right" autoClose={2500} />
    </AppProvider>
  </StrictMode>
);

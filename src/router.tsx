import { createBrowserRouter } from "react-router-dom";
import LayoutAdmin from "./components/layout/admin/LayoutAdmin";
import Dashboard from "./pages/admin/Dashboard";
import UserList from "./pages/admin/UserList";

import CategoryList from "./pages/admin/CategoryList";
import OrderList from "./pages/admin/OrderList";
import OrderDetail from "./pages/admin/OrderDetail";

import { ContactPage } from "./pages/users/ContactPage";
import ProductList from "./pages/admin/ProductList";
import RoleManagementPage from "./pages/admin/RoleList";
import { LayoutClient } from "./components/layout/client/LayoutClient";
import { DSHStoreHome } from "./pages/users/HomePage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Attribute from "./components/admin/product/Attribute";
import VariantList from "./pages/admin/VariantList";
import AdminContactsPage from "./pages/admin/ContactList";

export const ROUTER = createBrowserRouter([
  {
    path: "/",
    element: <LayoutClient />,
    children: [
      { index: true, element: <DSHStoreHome /> },
      { path: "lien-he", element: <ContactPage /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
  {
    path: "/admin",
    element: <LayoutAdmin />,
    children: [
      { index: true, element: <Dashboard /> },

      { path: "users", element: <UserList /> },

      { path: "products", element: <ProductList /> },
      { path: "/admin/products/:id/attributes", element: <Attribute /> },

      { path: "/admin/products/:id/variants/", element: <VariantList /> },

      { path: "categories", element: <CategoryList /> },

      { path: "orders", element: <OrderList /> },
      { path: "orders/:id", element: <OrderDetail /> },
      { path: "roles", element: <RoleManagementPage /> },
      { path: "contact-message", element: <AdminContactsPage /> },
      // active only

      // { path: "warehouses", element: <WarehouseList /> },
      // { path: "inventory", element: <InventoryByVariant /> },
      // { path: "purchase-orders", element: <PurchaseOrderList /> },
      // { path: "purchase-orders/:id", element: <PurchaseOrderDetail /> }, // active only

      // { path: "sliders", element: <SliderList /> },
      // { path: "sliders/:id", element: <SliderDetail /> },     // active only
    ],
  },
]);

export default ROUTER;

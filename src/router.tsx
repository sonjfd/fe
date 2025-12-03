import { createBrowserRouter } from "react-router-dom";
import LayoutAdmin from "./components/layout/admin/LayoutAdmin";
import Dashboard from "./pages/admin/Dashboard";
import UserList from "./pages/admin/UserList";

import CategoryList from "./pages/admin/CategoryList";
import OrderList from "./pages/admin/OrderList";

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
import AccountPage from "./pages/users/AccountPage";
import ProfilePage from "./pages/users/ProfilePage";
import AddressPage from "./pages/users/AddressPage";
import ChangePasswordPage from "./pages/users/ChangePasswordPage";
import AddProductPage from "./components/admin/product/AddProduct";
import ImagesList from "./pages/admin/ImagesList";

import ProtectedRoute from "./ProtectedRoute";
import NotFoundPage from "./components/NotFoundPage";
import AdminSlidersPage from "./pages/admin/SliderList";
import { WishlistPage } from "./pages/users/WishlistPage";
import GoogleOAuthHandler from "./pages/auth/GoogleOAuthHandler";
import UpdatePasswordPage from "./pages/auth/UpdatePasswordPage";
import AboutPage from "./pages/users/AboutPage";
import CategoryPage from "./pages/users/FilterPage";
import { CartPage } from "./pages/users/client/CardPage";
import { SearchPage } from "./pages/users/SearchPage";
import ProductDetailPage from "./pages/users/ProductDetailPage";
import OrderSuccess from "./pages/users/OrderSuccess";
import VoucherListPage from "pages/admin/VoucherList.tsx";
import { CheckoutPage } from "./pages/users/CheckoutPage";
import UserOrderPage from "./pages/users/UserOrderPage";
import StockPage from "pages/admin/StockPage.tsx";
import StockInPage from "pages/admin/StockInPage.tsx";
import StockOut from "pages/admin/StockOut.tsx";
import StockAdjPage from "pages/admin/StockAdjPage.tsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import AdminCreateGhnOrderPage from "./pages/admin/AdminCreateGhnOrderPage";
import AdminGhnTrackingPage from "./pages/admin/AdminTrackingOrderPage";

import ResetPasswordPage from "pages/auth/ResetPasswordPage.tsx";
import OrderTrackingPage from "./pages/users/OrderTrackingPage";
export const ROUTER = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute requireAuth={false}>
        <LayoutClient />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DSHStoreHome />,
      },
      {
        path: "lien-he",
        element: <ContactPage />,
      },
      {
        path: "/tim-kiem",
        element: <SearchPage />,
      },
      { path: "/oauth2/callback", element: <GoogleOAuthHandler /> },
      { path: "/update-password", element: <UpdatePasswordPage /> },
      { path: "/category/:id", element: <CategoryPage /> },
      { path: "/products/:id", element: <ProductDetailPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/thanks", element: <OrderSuccess /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "gioi-thieu", element: <AboutPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "wishlist", element: <WishlistPage /> },
        {path: "forgot-password",element : <ForgotPasswordPage />},
        { path:"reset-password", element:<ResetPasswordPage />}
    ],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <LayoutClient />
      </ProtectedRoute>
    ),
    children: [
      { path: "checkout", element: <CheckoutPage /> },
      {
        path: "tai-khoan",
        element: <AccountPage />,
        children: [
          { path: "ho-so", element: <ProfilePage /> },
          { path: "dia-chi", element: <AddressPage /> },
          { path: "doi-mat-khau", element: <ChangePasswordPage /> },
          { path: "don-mua", element: <UserOrderPage /> },
          { path: "don-mua/:orderId/tracking", element: <OrderTrackingPage /> },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <LayoutAdmin />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },

      { path: "users", element: <UserList /> },

      { path: "products", element: <ProductList /> },
      { path: "/admin/products/create", element: <AddProductPage /> },
      { path: "/admin/products/:id/attributes", element: <Attribute /> },
      { path: "/admin/products/:id/images", element: <ImagesList /> },

      { path: "/admin/products/:id/variants/", element: <VariantList /> },

      { path: "categories", element: <CategoryList /> },

      { path: "orders", element: <OrderList /> },
      { path: "orders/create-ghn/:orderId", element: <AdminCreateGhnOrderPage /> },
      { path: "orders/tracking/:ghnOrderCode", element: <AdminGhnTrackingPage /> },
      { path: "roles", element: <RoleManagementPage /> },
      { path: "contact-message", element: <AdminContactsPage /> },
      // active only

      { path: "stock", element: <StockPage /> },
      { path: "StockOut", element: <StockOut /> },
      { path: "stockIn", element: <StockInPage /> },
        { path: "StockAdj", element: <StockAdjPage /> },

      { path: "sliders", element: <AdminSlidersPage /> },
      // { path: "sliders/:id", element: <SliderDetail /> },     // active only
      // { path: "sliders/:id", element: <SliderDetail /> },     // active only
      { path: "vouchers", element: <VoucherListPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export default ROUTER;

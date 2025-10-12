import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home";
import ErrorPage from "../pages/ErrorPage";
import LogIn from "../pages/authPages/LogIn";
import Register from "../pages/authPages/Register";
import AllProducts from "../pages/AllProducts";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import VendorDashboard from "../pages/dashboard/VendorDashboard";
import UserDashboard from "../pages/dashboard/UserDashboard";
import RoleBasedRoute from "./privateRoutes/RoleBasedRoute";
import AdminAllProduct from "../pages/admin/AdminAllProduct";
import AdminAllAdvertisement from "../pages/admin/AdminAllAdvertisement";
import AdminAllOrder from "../pages/admin/AdminAllOrder";
import AdminAllUser from "../pages/admin/AdminAllUser";
import VendorAddProduct from "../pages/vendor/VendorAddProduct";
import VendorMyProducts from "../pages/vendor/VendorMyProducts";
import VendorMyAdvertisements from "../pages/vendor/VendorMyAdvertisements";
import VendorAddAdvertisement from "../pages/vendor/VendorAddAdvertisement";
import UserViewPriceTrends from "../pages/user/UserViewPriceTrends";
import UserManageWatchlist from "../pages/user/UserManageWatchlist";
import UserMyOrderList from "../pages/user/UserMyOrderList";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import VendorUpdateProduct from "../pages/vendor/VendorUpdateProduct";
import VendorHomePage from "../pages/vendor/VendorHomePage";
import UserHomePage from "../pages/user/UserHomePage";
import AdminHomePage from "../pages/admin/AdminHomePage";
import Payment from "../pages/payment/Payment";
import PrivateRoute from "../router/privateRoutes/PrivateRoute";

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: LogIn },
      { path: "register", Component: Register },
      { path: "all-products", Component: AllProducts },
      {
        path: "/payment/:productId",
        element: (
          <PrivateRoute>
            <Payment></Payment>
          </PrivateRoute>
        ),
      },
      {
        path: "/products/:id",
        element: <ProductDetailsPage></ProductDetailsPage>,
      },
    ],
  },

  {
    path: "/dashboard/admin",
    element: (
      <RoleBasedRoute allowedRoles={["admin"]}>
        <AdminDashboard />
      </RoleBasedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminHomePage></AdminHomePage>,
      },
      {
        path: "/dashboard/admin/all-users",
        element: <AdminAllUser></AdminAllUser>,
      },
      {
        path: "/dashboard/admin/all-product",
        element: <AdminAllProduct></AdminAllProduct>,
      },
      {
        path: "/dashboard/admin/all-advertisement",
        element: <AdminAllAdvertisement></AdminAllAdvertisement>,
      },
      {
        path: "/dashboard/admin/all-order",
        element: <AdminAllOrder></AdminAllOrder>,
      },
      {
        path: "/dashboard/admin/products/:id/edit",
        element: <VendorUpdateProduct></VendorUpdateProduct>,
      },
    ],
  },
  {
    path: "/dashboard/vendor",
    element: (
      <RoleBasedRoute allowedRoles={["vendor"]}>
        <VendorDashboard />
      </RoleBasedRoute>
    ),
    children: [
      {
        index: true,
        element: <VendorHomePage></VendorHomePage>,
      },

      {
        path: "/dashboard/vendor/update/:id",
        element: <VendorUpdateProduct></VendorUpdateProduct>,
      },

      {
        path: "/dashboard/vendor/add-advertisement",
        element: <VendorAddAdvertisement></VendorAddAdvertisement>,
      },

      {
        path: "/dashboard/vendor/my-advertisements",
        element: <VendorMyAdvertisements></VendorMyAdvertisements>,
      },

      {
        path: "/dashboard/vendor/add-product",
        element: <VendorAddProduct></VendorAddProduct>,
      },

      {
        path: "/dashboard/vendor/my-products",
        element: <VendorMyProducts></VendorMyProducts>,
      },
    ],
  },
  {
    path: "/dashboard/user",
    element: (
      <RoleBasedRoute allowedRoles={["user"]}>
        <UserDashboard />
      </RoleBasedRoute>
    ),
    children: [
      {
        index: true,
        element: <UserHomePage></UserHomePage>,
      },
      {
        path: "/dashboard/user/view-price-trends",
        element: <UserViewPriceTrends></UserViewPriceTrends>,
      },
      {
        path: "/dashboard/user/manage-watchlist",
        element: <UserManageWatchlist></UserManageWatchlist>,
      },
      {
        path: "/dashboard/user/my-order-list",
        element: <UserMyOrderList></UserMyOrderList>,
      },
    ],
  },

  // {
  //   path: "/payment/:productId",
  //   element: <PrivateRoute><Payment></Payment></PrivateRoute>,
  // },

  { path: "/*", Component: ErrorPage },
]);

export default router;

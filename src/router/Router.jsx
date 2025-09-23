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


const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: LogIn },
      { path: "register", Component: Register },
      { path: "all-products", Component: AllProducts },
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
            path: "/dashboard/admin/all-users",
            element: <AdminAllUser></AdminAllUser>
        },
        {
            path: "/dashboard/admin/all-product",
            element: <AdminAllProduct></AdminAllProduct>
        },
        {
            path: "/dashboard/admin/all-advertisement",
            element: <AdminAllAdvertisement></AdminAllAdvertisement>
        },
        {
            path: "/dashboard/admin/all-order",
            element: <AdminAllOrder></AdminAllOrder>
        },
    ]
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
            path: "/dashboard/vendor/add-product",
            element: <VendorAddProduct></VendorAddProduct>
        },
        {
            path: "/dashboard/vendor/my-products",
            element: <VendorMyProducts></VendorMyProducts>
        },
        {
            path: "/dashboard/vendor/add-advertisement",
            element: <VendorAddAdvertisement></VendorAddAdvertisement>
        },
        {
            path: "/dashboard/vendor/my-advertisements",
            element: <VendorMyAdvertisements></VendorMyAdvertisements>
        },
    ]
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
            path: "/dashboard/user/view-price-trends",
            element: <UserViewPriceTrends></UserViewPriceTrends>
        },
        {
            path: "/dashboard/user/manage-watchlist",
            element: <UserManageWatchlist></UserManageWatchlist>
        },
        {
            path: "/dashboard/user/my-order-list",
            element: <UserMyOrderList></UserMyOrderList>
        },
    ]
  },

  {
    path: "/products/:id",
    element: <ProductDetailsPage></ProductDetailsPage>
  },

  {
    path: "/dashboard/vendor/update/:id",
    element: <VendorUpdateProduct></VendorUpdateProduct>
  },

  { path: "/*", Component: ErrorPage },
]);

export default router;

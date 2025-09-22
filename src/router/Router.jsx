import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home";
import ErrorPage from "../pages/ErrorPage";
import LogIn from "../pages/authPages/LogIn";
import Register from "../pages/authPages/Register";
import AllProducts from "../pages/AllProducts";
import PrivateRoute from "./privateRoutes/PrivateRoute";
import DashBoardLayout from "../layouts/DashBoardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";
import AdminDashboard from "../pages/dashboard/AdminDashboard";

const router = createBrowserRouter([
    {
        path: "/",
        Component: RootLayout,
        children: [
            {
                index: true,
                Component: Home,
            },
            {
                path: "login",
                Component: LogIn,
            },
            {
                path: "register",
                Component: Register,
            },
            {
                path: "all-products",
                Component: AllProducts,
            },
        ]
    },

    {
        path: "/dashboard",
        element: <PrivateRoute><DashBoardLayout></DashBoardLayout></PrivateRoute>,
        children: [
            {
                index: true,
                Component: DashboardHome
            },

            {
                path: "/dashboard/admin",
                Component: AdminDashboard
            }
        ]
    },

    {
        path: "/*",
        Component: ErrorPage,
    }
])

export default router;
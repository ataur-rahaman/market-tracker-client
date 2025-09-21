import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home";
import ErrorPage from "../pages/ErrorPage";
import LogIn from "../pages/authPages/LogIn";
import Register from "../pages/authPages/Register";
import AllProducts from "../pages/AllProducts";
import PrivateRoute from "./privateRoutes/PrivateRoute";

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
                element: <PrivateRoute><AllProducts></AllProducts></PrivateRoute>
            },
        ]
    },
    {
        path: "/*",
        Component: ErrorPage,
    }
])

export default router;
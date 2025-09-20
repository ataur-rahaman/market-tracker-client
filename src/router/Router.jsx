import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home";
import ErrorPage from "../pages/ErrorPage";
import LogIn from "../pages/authPages/LogIn";
import Register from "../pages/authPages/Register";

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
        ]
    },
    {
        path: "/*",
        Component: ErrorPage,
    }
])

export default router;
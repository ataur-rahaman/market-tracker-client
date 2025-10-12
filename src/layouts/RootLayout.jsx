import React from "react";
import NavBar from "../components/NavBar";
import { Outlet } from "react-router";
import Footer from "../components/Footer";
import { Bounce, ToastContainer } from "react-toastify";

const RootLayout = () => {
  return (
    <div>
      <NavBar></NavBar>
      <div className="pt-15"><Outlet></Outlet></div>
      <Footer></Footer>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </div>
  );
};

export default RootLayout;

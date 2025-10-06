import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingBag, FaChartBar } from "react-icons/fa";
import { FiLogIn, FiLogOut } from "react-icons/fi";
import { MdAppRegistration } from "react-icons/md";
import useAuth from "../hooks/useAuth";
import { Link, useLocation } from "react-router";
import useUserRole from "../hooks/useUserRole";
import Swal from "sweetalert2";
import LoadingSpinner from "./LoadingSpinner";

const NavBar = () => {
  const { user, logOutUser } = useAuth();
  const { role, roleLoading } = useUserRole();
  const location = useLocation();
  const userData = location.state;

  const handleLogOut = async () => {
    try {
      await logOutUser();
    } catch (error) {
      if (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
        });
      }
    }
  };

  if (roleLoading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="navbar bg-base-100 shadow-md px-4 fixed top-0 left-0 right-0 z-50"
    >
      {/* Left side - Logo */}
      <motion.div
        className="flex-1"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Link
          to={"/"}
          className="flex items-center gap-2 text-xl font-bold cursor-pointer"
        >
          🌟 <span>Market Tracker</span>
        </Link>
      </motion.div>

      {/* Middle - NavLinks (Desktop) */}
      <div className="hidden md:flex">
        <ul className="menu menu-horizontal px-1 gap-3">
          <motion.li
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Link to={"/all-products"} className="flex items-center gap-1">
              <FaShoppingBag /> All Products
            </Link>
          </motion.li>

          <AnimatePresence>
            {user && (
              <>
                {role === "user" && (
                  <motion.li
                    key="user-dashboard"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      to="/dashboard/user"
                      className="flex items-center gap-1"
                    >
                      <FaChartBar /> User Dashboard
                    </Link>
                  </motion.li>
                )}
                {role === "vendor" && (
                  <motion.li
                    key="vendor-dashboard"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      to="/dashboard/vendor"
                      className="flex items-center gap-1"
                    >
                      <FaChartBar /> Vendor Dashboard
                    </Link>
                  </motion.li>
                )}
                {role === "admin" && (
                  <motion.li
                    key="admin-dashboard"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      to="/dashboard/admin"
                      className="flex items-center gap-1"
                    >
                      <FaChartBar /> Admin Dashboard
                    </Link>
                  </motion.li>
                )}
              </>
            )}
          </AnimatePresence>
        </ul>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Profile Avatar */}
        {user && (
          <motion.div
            className="avatar"
            whileHover={{ rotate: 10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                referrerPolicy="no-referrer"
                src={
                  user
                    ? user?.photoURL || user?.providerData?.[0]?.photoURL
                    : userData?.user.photoURL
                }
                alt="profile"
              />
            </div>
          </motion.div>
        )}

        {/* Buttons (Desktop) */}
        <div className="hidden md:flex gap-2">
          {!user ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to={"/login"}
                  className="btn btn-outline btn-sm flex items-center gap-1"
                >
                  <FiLogIn /> Login
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to={"/register"}
                  className="btn btn-primary btn-sm flex items-center gap-1"
                >
                  <MdAppRegistration /> Sign Up
                </Link>
              </motion.div>
            </>
          ) : (
            <motion.button
              onClick={handleLogOut}
              whileHover={{
                scale: 1.05,
                backgroundColor: "#ef4444",
                color: "#fff",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="btn btn-sm flex items-center gap-1"
            >
              <FiLogOut /> Logout
            </motion.button>
          )}
        </div>

        {/* Mobile Dropdown */}
        <div className="dropdown dropdown-end md:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <motion.svg
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.4 }}
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </motion.svg>
          </label>

          <AnimatePresence>
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <Link to={"/all-products"} className="flex items-center gap-1">
                  <FaShoppingBag /> All Products
                </Link>
              </li>

              {user && (
                <>
                  {role === "user" && (
                    <li>
                      <Link
                        to="/dashboard/user"
                        className="flex items-center gap-1"
                      >
                        <FaChartBar /> User Dashboard
                      </Link>
                    </li>
                  )}
                  {role === "vendor" && (
                    <li>
                      <Link
                        to="/dashboard/vendor"
                        className="flex items-center gap-1"
                      >
                        <FaChartBar /> Vendor Dashboard
                      </Link>
                    </li>
                  )}
                  {role === "admin" && (
                    <li>
                      <Link
                        to="/dashboard/admin"
                        className="flex items-center gap-1"
                      >
                        <FaChartBar /> Admin Dashboard
                      </Link>
                    </li>
                  )}
                </>
              )}

              {!user ? (
                <>
                  <li>
                    <Link to={"/login"} className="flex items-center gap-1">
                      <FiLogIn /> Login
                    </Link>
                  </li>
                  <li>
                    <Link to={"/register"} className="flex items-center gap-1">
                      <MdAppRegistration /> Sign Up
                    </Link>
                  </li>
                </>
              ) : (
                <li>
                  <button
                    onClick={handleLogOut}
                    className="flex items-center gap-1 text-red-500"
                  >
                    <FiLogOut /> Logout
                  </button>
                </li>
              )}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default NavBar;

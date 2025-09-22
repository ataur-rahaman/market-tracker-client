import React from "react";
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

  if (roleLoading) return <LoadingSpinner></LoadingSpinner>;

  return (
    <div className="navbar bg-base-100 shadow-md px-4 sticky top-0 left-0 right-0 z-50">
      {/* Left side - Logo + Site name */}
      <div className="flex-1">
        <Link
          to={"/"}
          className="flex items-center gap-2 text-xl font-bold cursor-pointer"
        >
          🌟 <span>Market Tracker</span>
        </Link>
      </div>

      {/* Middle - NavLinks (hidden on small devices) */}
      <div className="hidden md:flex">
        <ul className="menu menu-horizontal px-1 gap-3">
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
                    <FaChartBar /> User Dashboard{" "}
                  </Link>
                </li>
              )}
              {role === "vendor" && (
                <li>
                  <Link
                    to="/dashboard/vendor"
                    className="flex items-center gap-1"
                  >
                    <FaChartBar /> Vendor Dashboard{" "}
                  </Link>
                </li>
              )}
              {role === "admin" && (
                <li>
                  <Link
                    to="/dashboard/admin"
                    className="flex items-center gap-1"
                  >
                    <FaChartBar /> Admin Dashboard{" "}
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Profile avatar is always shown if logged in */}
        {user && (
          <div className="avatar">
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
          </div>
        )}

        {/* Buttons (only visible on md+) */}
        <div className="hidden md:flex gap-2">
          {!user ? (
            <>
              <Link
                to={"/login"}
                className="btn btn-outline btn-sm flex items-center gap-1"
              >
                <FiLogIn /> Login
              </Link>
              <Link
                to={"/register"}
                className="btn btn-primary btn-sm flex items-center gap-1"
              >
                <MdAppRegistration /> Sign Up
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogOut}
              className="btn hover:btn-error btn-sm flex items-center gap-1"
            >
              <FiLogOut /> Logout
            </button>
          )}
        </div>

        {/* Mobile Dropdown */}
        <div className="dropdown dropdown-end md:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <svg
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
            </svg>
          </label>
          <ul
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
                      <FaChartBar /> User Dashboard{" "}
                    </Link>
                  </li>
                )}
                {role === "vendor" && (
                  <li>
                    <Link
                      to="/dashboard/vendor"
                      className="flex items-center gap-1"
                    >
                      <FaChartBar /> Vendor Dashboard{" "}
                    </Link>
                  </li>
                )}
                {role === "admin" && (
                  <li>
                    <Link
                      to="/dashboard/admin"
                      className="flex items-center gap-1"
                    >
                      <FaChartBar /> Admin Dashboard{" "}
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
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavBar;

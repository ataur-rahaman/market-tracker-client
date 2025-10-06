import React from "react";
import { NavLink, Outlet } from "react-router";
import { FaArrowTrendDown } from "react-icons/fa6";
import { BsTools } from "react-icons/bs";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

const UserDashboard = () => {
  const linkBase =
    "flex items-center gap-2 px-3 py-2 rounded-lg transition hover:bg-base-200";
  const activeBase = "bg-primary text-primary-content hover:bg-primary";

  return (
    <div className="min-h-screen bg-base-100">
      {/* Top Nav */}
      <NavBar></NavBar>

      {/* Main Content */}
      <div className="flex-1 top-0 mt-15">
        {/* Drawer for mobile (DaisyUI) */}
        <div className="drawer lg:drawer-open">
          <input id="vendor-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            {/* Page content here */}
            <div className="p-4 md:p-6 lg:p-8">
              {/* Mobile toggle button */}
              <label
                htmlFor="vendor-drawer"
                className="btn btn-outline btn-sm mb-4 lg:hidden"
              >
                Menu
              </label>

              {/* Outlet area */}
              <div className="card bg-base-100 shadow-sm border border-gray-300">
                <div className="card-body p-0 md:p-6">
                  <Outlet />
                  <Footer></Footer>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="drawer-side fixed top-15">
            <label
              htmlFor="vendor-drawer"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <aside className="w-60 bg-base-100 border-r border-r-gray-300 h-screen">
              <div className="p-5 border-b border-b-gray-300">
                <h2 className="text-xl font-bold">User Panel</h2>
                <p className="text-sm text-base-content/60">
                  Manage your orders
                </p>
              </div>

              <nav className="p-4 space-y-2 text-[16px]">
                <NavLink
                  to="/dashboard/user/view-price-trends"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeBase : ""}`
                  }
                >
                    <FaArrowTrendDown className="text-xl"/>
                  <span>View price trends</span>
                </NavLink>

                <NavLink
                  to="/dashboard/user/manage-watchlist"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeBase : ""}`
                  }
                >
                    <BsTools className="text-xl"/>
                  <span>Manage Watchlist</span>
                </NavLink>

                <div className="divider my-3" />

                <NavLink
                  to="/dashboard/user/my-order-list"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeBase : ""}`
                  }
                >
                  <span>🛒 My Order List</span>
                </NavLink>
              </nav>
            </aside>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default UserDashboard;

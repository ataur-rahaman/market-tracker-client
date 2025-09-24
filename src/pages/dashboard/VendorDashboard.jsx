import React from "react";
import { NavLink, Outlet } from "react-router";
import { MdAddCircleOutline } from "react-icons/md";
import { FiPackage } from "react-icons/fi";
import { HiOutlineMegaphone } from "react-icons/hi2";
import { TbChartBar } from "react-icons/tb";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

const VendorDashboard = () => {
  const linkBase =
    "flex items-center gap-2 px-3 py-2 rounded-lg transition hover:bg-base-200";
  const activeBase =
    "bg-primary text-primary-content hover:bg-primary";

  return (
    <div className="min-h-screen bg-base-100">
      {/* Top Nav */}
    <NavBar></NavBar>

      {/* Main Content */}
      <div className="flex-1 top-0">
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
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="drawer-side">
            <label htmlFor="vendor-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
            <aside className="w-72 bg-base-100 border-r border-r-gray-300 min-h-full">
              <div className="p-5 border-b border-b-gray-300">
                <h2 className="text-xl font-bold">Vendor Panel</h2>
                <p className="text-sm text-base-content/60">Manage your market posts</p>
              </div>

              <nav className="p-4 space-y-2">
                <NavLink
                  to="/dashboard/vendor/add-product"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeBase : ""}`
                  }
                >
                  <MdAddCircleOutline className="text-xl" />
                  <span>📝 Add Product</span>
                </NavLink>

                <NavLink
                  to="/dashboard/vendor/my-products"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeBase : ""}`
                  }
                >
                  <FiPackage className="text-xl" />
                  <span>📄 My Products</span>
                </NavLink>

                <div className="divider my-3" />

                <NavLink
                  to="/dashboard/vendor/add-advertisement"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeBase : ""}`
                  }
                >
                  <HiOutlineMegaphone className="text-xl" />
                  <span>📢 Add Advertisement</span>
                </NavLink>

                <NavLink
                  to="/dashboard/vendor/my-advertisements"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? activeBase : ""}`
                  }
                >
                  <TbChartBar className="text-xl" />
                  <span>📊 My Advertisements</span>
                </NavLink>
              </nav>
            </aside>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default VendorDashboard;

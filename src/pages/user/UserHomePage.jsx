import React from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { FaBoxOpen, FaStar, FaShoppingCart, FaChartLine } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const UserHomePage = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const userKey = user?.email?.toLowerCase();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", userKey],
    enabled: !!userKey,
    queryFn: async () => {
      const res = await axiosSecure.get(`/orders/${encodeURIComponent(userKey)}`);
      return res.data || [];
    },
  });

  const { data: watchlist = [], isLoading: watchlistLoading } = useQuery({
    queryKey: ["watchlist", userKey],
    enabled: !!userKey,
    queryFn: async () => {
      const res = await axiosSecure.get(`/watchlist/${encodeURIComponent(userKey)}`);
      return res.data || [];
    },
  });

  if (ordersLoading || watchlistLoading) return <LoadingSpinner />;

  const recentOrders = orders.slice(0, 3);
  const recentWatchlist = watchlist.slice(0, 3);

  return (
   <>
   <title>User-panel</title>
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Welcome back, {user?.displayName || "User"} 👋</h1>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body flex items-center gap-3">
            <FaShoppingCart className="text-primary" size={24} />
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body flex items-center gap-3">
            <FaStar className="text-warning" size={24} />
            <div>
              <p className="text-sm text-gray-500">Watchlist Items</p>
              <p className="text-2xl font-semibold">{watchlist.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body flex items-center gap-3">
            <FaChartLine className="text-success" size={24} />
            <div>
              <p className="text-sm text-gray-500">Tracked Markets</p>
              <p className="text-2xl font-semibold">
                {new Set(watchlist.map(w => w.product?.market_name)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">🧾 Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500">No orders yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentOrders.map((o) => (
                <li key={o._id} className="flex justify-between border-b pb-2">
                  <span>{o.product_snapshot?.item_name} — ৳{o.price}</span>
                  <span>{new Date(o.date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/dashboard/user/my-order-list" className="btn btn-sm btn-outline mt-3">View All Orders</Link>
        </div>
      </div>

      {/* Watchlist */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">⭐ My Watchlist</h2>
          {recentWatchlist.length === 0 ? (
            <p className="text-gray-500">Your watchlist is empty.</p>
          ) : (
            <ul className="space-y-2">
              {recentWatchlist.map((w) => (
                <li key={w._id} className="flex justify-between border-b pb-2">
                  <span>{w.product?.item_name} ({w.product?.market_name})</span>
                  <span>৳{w.product?.price_per_unit}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/dashboard/user/manage-watchlist" className="btn btn-sm btn-outline mt-3">Manage Watchlist</Link>
        </div>
      </div>
    </div>
   </>
  );
};

export default UserHomePage;

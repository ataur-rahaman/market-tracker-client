import React from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { FaUsers, FaBoxOpen, FaClock, FaCheckCircle, FaTimesCircle, FaShoppingCart, FaAd } from "react-icons/fa";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import LoadingSpinner from "../../components/LoadingSpinner";

const AdminHomePage = () => {
  const axiosPublic = useAxiosPublic();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const res = await axiosPublic.get("/users");
      return res.data || [];
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: async () => {
      const res = await axiosPublic.get("/products");
      return res.data || [];
    },
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      const res = await axiosPublic.get("/orders");
      return res.data || [];
    },
  });

  const { data: ads = [], isLoading: adsLoading } = useQuery({
    queryKey: ["adminAds"],
    queryFn: async () => {
      const res = await axiosPublic.get("/advertisements");
      return res.data || [];
    },
  });

  if (usersLoading || productsLoading || ordersLoading || adsLoading) return <LoadingSpinner />;

  const pendingProducts = products.filter(p => p.status === "pending").length;
  const approvedProducts = products.filter(p => p.status === "approved").length;
  const rejectedProducts = products.filter(p => p.status === "rejected").length;
  const pendingAds = ads.filter(ad => ad.status === "pending").length;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Welcome, Admin 👑</h1>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body flex items-center gap-3">
            <FaUsers className="text-primary" size={24} />
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body flex items-center gap-3">
            <FaBoxOpen className="text-info" size={24} />
            <div>
              <p className="text-sm text-gray-500">Products</p>
              <p className="text-2xl font-semibold">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body flex items-center gap-3">
            <FaShoppingCart className="text-success" size={24} />
            <div>
              <p className="text-sm text-gray-500">Orders</p>
              <p className="text-2xl font-semibold">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body flex items-center gap-3">
            <FaAd className="text-warning" size={24} />
            <div>
              <p className="text-sm text-gray-500">Pending Ads</p>
              <p className="text-2xl font-semibold">{pendingAds}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Status Overview */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">📦 Product Status</h2>
          <p>✅ Approved: {approvedProducts}</p>
          <p>⏳ Pending: {pendingProducts}</p>
          <p>❌ Rejected: {rejectedProducts}</p>
          <Link to="/dashboard/admin/all-product" className="btn btn-sm btn-outline mt-2">Manage Products</Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">🧾 Recent Orders</h2>
          {orders.slice(0, 5).map(o => (
            <div key={o._id} className="flex justify-between border-b py-1">
              <span>{o.product_snapshot?.item_name}</span>
              <span>৳{o.price}</span>
              <span>{o.buyerEmail}</span>
            </div>
          ))}
          <Link to="/dashboard/admin/all-order" className="btn btn-sm btn-outline mt-2">View All Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;

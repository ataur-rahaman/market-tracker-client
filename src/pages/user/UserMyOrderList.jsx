import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const UserMyOrderList = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const userKey = user?.email ? user.email.toLowerCase() : undefined;

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ["orders", userKey],
    enabled: !!userKey,
    queryFn: async () => {
      const res = await axiosSecure.get(`/orders/${encodeURIComponent(userKey)}`);
      return res.data || [];
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: "always",      // 👈 important so it refetches on navigation
    staleTime: 0,                  // treat as stale to encourage refetch
  });

  if (!userKey) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="alert alert-warning">
          <span>Please log in to view your orders.</span>
        </div>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="alert alert-error">
          <span>Failed to load your orders. Please try again.</span>
        </div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
      <h1 className="text-2xl md:text-3xl font-bold">🧾 My Orders</h1>

      <div className="card bg-base-100 shadow">
        <div className="card-body overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Market</th>
                <th>Price</th>
                <th>Date</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="py-10 text-center text-gray-500">
                      You don’t have any orders yet.
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o, idx) => {
                  const snap = o.product_snapshot || {};
                  return (
                    <tr key={o._id}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-10 h-10">
                              <img src={snap.image_url} alt={snap.item_name} />
                            </div>
                          </div>
                          <div className="font-medium">{snap.item_name || "—"}</div>
                        </div>
                      </td>
                      <td>{snap.market_name || "—"}</td>
                      <td>৳{Number(o.price ?? 0).toFixed(2)}</td>
                      <td>{o.date ? new Date(o.date).toLocaleDateString() : "—"}</td>
                      <td className="text-right">
                        <button
                          onClick={() => navigate(`/products/${o.productId}`)}
                          className="btn btn-sm btn-outline"
                        >
                          🔍 View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserMyOrderList;

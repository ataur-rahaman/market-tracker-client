import React, { useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import LoadingSpinner from "../../components/LoadingSpinner";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const AdminAllOrders = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const prevCountRef = useRef(0);

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["adminAllOrders"],
    queryFn: async () => {
      const res = await axiosSecure.get("/orders"); // admin: all orders
      return res.data || [];
    },
    // 👇 live-ish updates
    refetchOnWindowFocus: true,           // refetch when window/tab focused
    refetchInterval: 5000,                // poll every 5s
    refetchIntervalInBackground: true,    // keep polling even if tab is hidden
    staleTime: 1000 * 2,                  // consider fresh for 2s to avoid spam re-renders
  });

  // (Optional) tiny visual indicator if new orders arrived
  useEffect(() => {
    if (orders?.length > prevCountRef.current && prevCountRef.current !== 0) {
      // You could add a toast/snackbar here if you want.
      // e.g., toast.info("New order received");
    }
    prevCountRef.current = orders?.length || 0;
  }, [orders?.length]);

  const viewProduct = (productId) => navigate(`/products/${productId}`);

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="alert alert-error">
          <span>Failed to load orders. Please try again.</span>
          <button className="btn btn-sm ml-4" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto p-4 md:p-0 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">📦 All Orders</h1>
        <div className="flex items-center gap-3">
          {isFetching && <span className="text-sm text-gray-500">Refreshing…</span>}
          <button className="btn btn-sm" onClick={() => refetch()}>
            ⟳ Refresh
          </button>
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Market</th>
                <th>Buyer</th>
                <th>Price</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="py-10 text-center text-gray-500">
                      No orders found.
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
                      <td className="whitespace-nowrap">{o.buyerEmail}</td>
                      <td>৳{Number(o.price ?? 0).toFixed(2)}</td>
                      <td className="whitespace-nowrap">
                        {o.date ? new Date(o.date).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            o.status === "placed"
                              ? "badge-info"
                              : o.status === "shipped"
                              ? "badge-warning"
                              : o.status === "delivered"
                              ? "badge-success"
                              : o.status === "cancelled"
                              ? "badge-error"
                              : ""
                          }`}
                        >
                          {o.status || "—"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="btn btn-sm btn-outline ml-5"
                            onClick={() => viewProduct(o.productId)}
                          >
                            🔍 View Details
                          </button>
                          {/* future admin actions (update status) can go here */}
                        </div>
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

export default AdminAllOrders;

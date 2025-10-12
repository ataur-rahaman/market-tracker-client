import React, { useMemo, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router";
import Swal from "sweetalert2";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const VendorMyProducts = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [feedbackModal, setFeedbackModal] = useState({
    open: false,
    product: null,
  });

  const {
    data: products = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["vendorProducts", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/products/vendor/${encodeURIComponent(user.email.toLowerCase())}`
      );
      return res.data;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  const rejectedCount = useMemo(
    () => products.filter((p) => (p.status || "pending") === "rejected").length,
    [products]
  );

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete your product.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axiosSecure.delete(`/products/${id}`);
      Swal.fire("Deleted!", "Product has been deleted.", "success");
      refetch();
    } catch (error) {
      console.error(error);
      Swal.fire("Error!", "Failed to delete product.", "error");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-0 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📦 My Products: {products.length}</h2>
        <Link to="/dashboard/vendor/add-product" className="btn btn-primary btn-sm">
          + Add Product
        </Link>
      </div>

      {rejectedCount > 0 && (
        <div className="alert alert-error shadow">
          <span>
            You have <b>{rejectedCount}</b> rejected {rejectedCount > 1 ? "items" : "item"}.
            Please review the feedback and resubmit with corrections.
          </span>
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-gray-500">No products submitted yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Market</th>
                <th>Date</th>
                <th>Price</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => {
                const latestDate =
                  p.prices?.length > 0 ? p.prices[p.prices.length - 1].date : p.date;
                const status = p.status || "pending";
                const statusClass =
                  status === "approved"
                    ? "badge-success"
                    : status === "rejected"
                    ? "badge-error"
                    : "badge-warning";

                return (
                  <tr key={p._id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <img
                          src={p.image_url}
                          alt={p.item_name}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{p.item_name}</span>
                          {/* If rejected, show reason inline */}
                          {status === "rejected" && p.rejection_reason && (
                            <span className="text-xs text-error">
                              Reason: {p.rejection_reason}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{p.market_name}</td>
                    <td>{latestDate}</td>
                    <td>৳{Number(p.price_per_unit).toFixed(2)}/kg</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${statusClass}`}>{status}</span>

                        {/* Show feedback button if rejected */}
                        {status === "rejected" && (p.rejection_reason || p.rejection_feedback) && (
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => setFeedbackModal({ open: true, product: p })}
                          >
                            View feedback
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="flex gap-2 justify-center">
                      {/* View Details */}
                      <Link to={`/products/${p._id}`} className="btn btn-sm btn-outline">
                        View
                      </Link>

                      {/* Update (reuse your vendor update page) */}
                      <Link
                        to={`/dashboard/vendor/update/${p._id}`}
                        className="btn btn-sm btn-info text-white"
                      >
                        Update
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="btn btn-sm btn-error text-white"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection feedback modal */}
      {feedbackModal.open && feedbackModal.product && (
        <dialog className="modal modal-open" onClose={() => setFeedbackModal({ open: false, product: null })}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">Rejection Feedback</h3>
            <div className="mt-3 space-y-2">
              <div className="text-sm">
                <span className="font-semibold">Item:</span> {feedbackModal.product.item_name}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Market:</span> {feedbackModal.product.market_name}
              </div>
              {feedbackModal.product.rejection_reason && (
                <div className="p-3 rounded bg-error/10 text-error">
                  <span className="font-semibold">Reason:</span>{" "}
                  {feedbackModal.product.rejection_reason}
                </div>
              )}
              {feedbackModal.product.rejection_feedback && (
                <div className="p-3 rounded bg-base-200">
                  <span className="font-semibold">Feedback:</span>{" "}
                  {feedbackModal.product.rejection_feedback}
                </div>
              )}
              {!feedbackModal.product.rejection_reason &&
                !feedbackModal.product.rejection_feedback && (
                  <div className="text-gray-500 text-sm">No detailed feedback available.</div>
                )}
            </div>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setFeedbackModal({ open: false, product: null })}
              >
                Close
              </button>
              <Link
                to={`/dashboard/vendor/update/${feedbackModal.product._id}`}
                className="btn btn-primary"
                onClick={() => setFeedbackModal({ open: false, product: null })}
              >
                Fix & Update
              </Link>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default VendorMyProducts;

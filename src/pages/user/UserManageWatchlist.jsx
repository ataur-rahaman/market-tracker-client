import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import useAuth from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const UserManageWatchlist = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // Load watchlist
  const {
    data: items = [],
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ["watchlist", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/watchlist/${encodeURIComponent(user.email.toLowerCase())}`
      );
      return res.data || [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (watchlistId) => {
      const res = await axiosSecure.delete(`/watchlist/${watchlistId}/${user.email}`);
      return res.data;
    },
    onMutate: async (watchlistId) => {
      await qc.cancelQueries({ queryKey: ["watchlist", user?.email] });
      const prev = qc.getQueryData(["watchlist", user?.email]);
      qc.setQueryData(["watchlist", user?.email], (old = []) =>
        old.filter((row) => row._id !== watchlistId)
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["watchlist", user?.email], ctx.prev);
      toast.error("Failed to remove from watchlist.");
    },
    onSuccess: (data) => {
      if (data?.deletedCount > 0) {
        toast.success("Removed from watchlist.");
      } else {
        toast.info("Item already removed.");
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["watchlist", user?.email] });
    },
  });

  const openConfirm = (row) => {
    setToDelete(row);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setToDelete(null);
  };
  const confirmDelete = () => {
    if (toDelete?._id) deleteMutation.mutate(toDelete._id);
    closeConfirm();
  };

  const goAddMore = () => navigate("/all-products");

  if (!user?.email) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="alert alert-warning">
          <span>Please log in to view your watchlist.</span>
        </div>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="alert alert-error">
          <span>Failed to load your watchlist. Please try again.</span>
        </div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">⭐ Manage Watchlist</h1>
        <button className="btn btn-primary btn-sm" onClick={goAddMore}>
          ➕ Add More
        </button>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body overflow-x-auto">
          {isFetching && <div className="text-sm text-gray-500 mb-2">Refreshing…</div>}
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Market</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="py-10 text-center text-gray-500">
                      Your watchlist is empty. Click “Add More” to start tracking items.
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((row, idx) => {
                  const p = row.product || {};
                  return (
                    <tr key={row._id}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-10 h-10">
                              <img src={p.image_url} alt={p.item_name} />
                            </div>
                          </div>
                          <div className="font-medium">{p.item_name || "—"}</div>
                        </div>
                      </td>
                      <td>{p.market_name || "—"}</td>
                      <td>{p.date ? new Date(p.date).toLocaleDateString() : "—"}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button className="btn btn-sm" onClick={goAddMore}>
                            ➕ Add More
                          </button>
                          <button
                            className="btn btn-sm btn-error text-white"
                            onClick={() => openConfirm(row)}
                          >
                            ❌ Remove
                          </button>
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

      {/* Confirm Remove Modal */}
      {confirmOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Remove from Watchlist?</h3>
            <p className="py-2">
              {toDelete?.product?.item_name
                ? `This will remove "${toDelete.product.item_name}" from your watchlist.`
                : "This will remove the selected item from your watchlist."}
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={closeConfirm}>
                Cancel
              </button>
              <button className="btn btn-error text-white" onClick={confirmDelete}>
                Remove
              </button>
            </div>
          </div>
        </dialog>
      )}

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
};

export default UserManageWatchlist;

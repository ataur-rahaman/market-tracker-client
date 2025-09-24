import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaStore,
  FaUser,
} from "react-icons/fa";
import Swal from "sweetalert2";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import LoadingSpinner from "../../components/LoadingSpinner";

const STATUS_COLORS = {
  approved: "badge-success",
  pending: "badge-warning",
  rejected: "badge-error",
};

const AdminAllProduct = () => {
  const axiosPublic = useAxiosPublic();
  const qc = useQueryClient();
  const location = useLocation();

  // controls
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [rejectModal, setRejectModal] = useState({
    open: false,
    product: null,
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    product: null,
  });

  // load products
  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["adminAllProducts"],
    queryFn: async () => {
      const res = await axiosPublic.get("/products");
      return res.data || [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  // Approve
  const approveMutation = useMutation({
    mutationFn: async (product) => {
      const res = await axiosPublic.patch(`/products/${product._id}/status`, {
        status: "approved",
        reason: null,
        feedback: null,
      });
      return res.data;
    },
    onMutate: async (product) => {
      await qc.cancelQueries({ queryKey: ["adminAllProducts"] });
      const prev = qc.getQueryData(["adminAllProducts"]);
      qc.setQueryData(["adminAllProducts"], (old = []) =>
        old.map((p) =>
          p._id === product._id
            ? {
                ...p,
                status: "approved",
                rejection_reason: null,
                rejection_feedback: null,
              }
            : p
        )
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["adminAllProducts"], ctx.prev);
      Swal.fire("Error", "Failed to approve product", "error");
    },
    onSuccess: () =>
      Swal.fire("Approved", "Product has been approved", "success"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["adminAllProducts"] }),
  });

  // Reject
  const rejectMutation = useMutation({
    mutationFn: async ({ product, reason, feedback }) => {
      const res = await axiosPublic.patch(`/products/${product._id}/status`, {
        status: "rejected",
        reason,
        feedback,
      });
      return res.data;
    },
    onMutate: async ({ product, reason, feedback }) => {
      await qc.cancelQueries({ queryKey: ["adminAllProducts"] });
      const prev = qc.getQueryData(["adminAllProducts"]);
      qc.setQueryData(["adminAllProducts"], (old = []) =>
        old.map((p) =>
          p._id === product._id
            ? {
                ...p,
                status: "rejected",
                rejection_reason: reason,
                rejection_feedback: feedback,
              }
            : p
        )
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["adminAllProducts"], ctx.prev);
      Swal.fire("Error", "Failed to reject product", "error");
    },
    onSuccess: () =>
      Swal.fire("Rejected", "Product has been rejected", "success"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["adminAllProducts"] }),
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (product) => {
      const res = await axiosPublic.delete(`/products/${product._id}`);
      return res.data;
    },
    onMutate: async (product) => {
      await qc.cancelQueries({ queryKey: ["adminAllProducts"] });
      const prev = qc.getQueryData(["adminAllProducts"]);
      qc.setQueryData(["adminAllProducts"], (old = []) =>
        old.filter((p) => p._id !== product._id)
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["adminAllProducts"], ctx.prev);
      Swal.fire("Error", "Failed to delete product", "error");
    },
    onSuccess: () =>
      Swal.fire("Deleted", "Product has been removed", "success"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["adminAllProducts"] }),
  });

  // Derived list
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return products
      .filter((p) =>
        statusFilter === "all" ? true : (p.status || "pending") === statusFilter
      )
      .filter((p) =>
        !s
          ? true
          : (p.item_name || "").toLowerCase().includes(s) ||
            (p.market_name || "").toLowerCase().includes(s) ||
            (p.vendor_email || "").toLowerCase().includes(s)
      )
      .sort((a, b) => (a.item_name || "").localeCompare(b.item_name || ""));
  }, [products, statusFilter, search]);

  const onApprove = (product) => {
    if ((product.status || "pending") === "approved") return;
    approveMutation.mutate(product);
  };

  const onOpenReject = (product) => setRejectModal({ open: true, product });
  const onCloseReject = () => setRejectModal({ open: false, product: null });

  const onSubmitReject = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const reason = form.get("reason")?.toString().trim();
    const feedback = form.get("feedback")?.toString().trim();

    if (!reason || !feedback) {
      return Swal.fire(
        "Missing info",
        "Please provide both reason and feedback.",
        "warning"
      );
    }
    rejectMutation.mutate({ product: rejectModal.product, reason, feedback });
    onCloseReject();
  };

  const onOpenDelete = (product) => setDeleteModal({ open: true, product });
  const onCloseDelete = () => setDeleteModal({ open: false, product: null });
  const onConfirmDelete = () => {
    deleteMutation.mutate(deleteModal.product);
    onCloseDelete();
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="alert alert-error">
          <span>Failed to load products. Please try again.</span>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Admin · All Products
          </h1>
          <p className="text-sm md:text-base text-gray-500">
            Review, approve, reject, edit, or remove products created by
            vendors.
          </p>
        </div>
        <button onClick={() => refetch()} className="btn btn-outline">
          <FaSyncAlt className={isFetching ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Controls */}
      <div className="card bg-base-100 shadow">
        <div className="card-body grid md:grid-cols-3 gap-3">
          <div className="form-control">
            <label className="label">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="form-control md:col-span-2">
            <label className="label">Search (item / market / vendor)</label>
            <div className="join w-full">
              <div className="join-item input input-bordered flex items-center gap-2 w-full">
                <FaSearch className="opacity-60" />
                <input
                  className="grow outline-none bg-transparent"
                  placeholder="e.g., Onion / Kawran Bazar / vendor@mail.com"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                className="join-item btn btn-outline"
                onClick={() => setSearch("")}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow">
        <div className="card-body overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th className="hidden lg:table-cell">Market</th>
                <th className="hidden md:table-cell">
                  <FaUser className="inline mr-1" /> Vendor
                </th>
                <th>Price (৳)</th>
                <th className="hidden md:table-cell">Last Update</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="py-10 text-center text-gray-500">
                      No products match your filters.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p, idx) => {
                  const latest = (p.prices || [])
                    .slice()
                    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                  return (
                    <tr key={p._id}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-10 h-10">
                              <img src={p.image_url} alt={p.item_name} />
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold">{p.item_name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <FaStore /> {p.market_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden lg:table-cell">{p.market_name}</td>
                      <td className="hidden md:table-cell">{p.vendor_email}</td>
                      <td className="font-medium">
                        ৳{Number(p.price_per_unit).toFixed(2)}
                      </td>
                      <td className="hidden md:table-cell">
                        {latest?.date
                          ? new Date(latest.date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            STATUS_COLORS[p.status || "pending"]
                          }`}
                        >
                          {p.status || "pending"}
                        </span>
                        {p.status === "rejected" && p.rejection_reason && (
                          <div className="text-xs text-error mt-1">
                            Reason: {p.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="btn btn-xs btn-success"
                            onClick={() => onApprove(p)}
                            disabled={(p.status || "pending") === "approved"}
                            title="Approve"
                          >
                            <FaCheckCircle />
                          </button>
                          <button
                            className="btn btn-xs btn-warning"
                            onClick={() => onOpenReject(p)}
                            title="Reject"
                          >
                            <FaTimesCircle />
                          </button>
                          <Link
                            state={location.pathname}
                            to={`/dashboard/admin/products/${p._id}/edit`}
                            className="btn btn-xs"
                            title="Edit (uses vendor update page)"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            className="btn btn-xs btn-error"
                            onClick={() => onOpenDelete(p)}
                            title="Remove"
                          >
                            <FaTrash />
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

      {/* Reject Modal */}
      {rejectModal.open && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Reject Product</h3>
            <p className="text-sm text-gray-500 mb-4">
              Provide a clear <b>reason</b> and <b>feedback</b>. Vendors will
              see this on their product.
            </p>

            <form onSubmit={onSubmitReject} className="space-y-3">
              <div className="form-control">
                <label className="label">Reason</label>
                <input
                  name="reason"
                  className="input input-bordered w-full"
                  placeholder="e.g., Insufficient details / Wrong image"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">Feedback</label>
                <textarea
                  name="feedback"
                  className="textarea textarea-bordered w-full"
                  placeholder="Explain what to fix for approval"
                  required
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={onCloseReject}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-warning">
                  Reject
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Remove Product?</h3>
            <p className="py-2">This action cannot be undone.</p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={onCloseDelete}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={onConfirmDelete}>
                Remove
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default AdminAllProduct;

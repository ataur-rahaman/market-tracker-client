import React, { useState } from "react";
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
import ReactPaginate from "react-paginate";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/LoadingSpinner";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const STATUS_COLORS = {
  approved: "badge-success",
  pending: "badge-warning",
  rejected: "badge-error",
};

const AdminAllProduct = () => {
  const axiosSecure = useAxiosSecure();
  const qc = useQueryClient();
  const location = useLocation();

  // Controls
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // 1-based for UX
  const LIMIT = 8;

  const [rejectModal, setRejectModal] = useState({ open: false, product: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });

  // Load paginated products from backend
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching, // true while background refetch (page/filter/search change)
  } = useQuery({
    queryKey: ["adminAllProducts", currentPage, statusFilter, search],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/products-admin?page=${currentPage}&limit=${LIMIT}&status=${encodeURIComponent(
          statusFilter
        )}&search=${encodeURIComponent(search)}`
      );
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const products = data?.products || [];
  const total = data?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / LIMIT));

  // Actions (no optimistic cache; we refetch server data)
  const approveMutation = useMutation({
    mutationFn: async (product) =>
      axiosSecure.patch(`/products/${product._id}/status`, {
        status: "approved",
        reason: null,
        feedback: null,
      }),
    onSuccess: () => {
      Swal.fire("Approved", "Product has been approved", "success");
      qc.invalidateQueries({ queryKey: ["adminAllProducts"] });
    },
    onError: () => Swal.fire("Error", "Failed to approve product", "error"),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ product, reason, feedback }) =>
      axiosSecure.patch(`/products/${product._id}/status`, {
        status: "rejected",
        reason,
        feedback,
      }),
    onSuccess: () => {
      Swal.fire("Rejected", "Product has been rejected", "success");
      qc.invalidateQueries({ queryKey: ["adminAllProducts"] });
    },
    onError: () => Swal.fire("Error", "Failed to reject product", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (product) => axiosSecure.delete(`/products/${product._id}`),
    onSuccess: () => {
      Swal.fire("Deleted", "Product removed successfully", "success");
      // If we deleted the last item on the page, bump back a page to keep UX smooth
      qc.invalidateQueries({ queryKey: ["adminAllProducts"] });
    },
    onError: () => Swal.fire("Error", "Failed to delete product", "error"),
  });

  const handlePageClick = ({ selected }) => {
    // react-paginate gives 0-based index; convert to 1-based
    setCurrentPage(selected + 1);
    // optional: scroll to top of table
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onApprove = (p) => {
    if ((p.status || "pending") === "approved") return;
    approveMutation.mutate(p);
  };

  const onOpenReject = (p) => setRejectModal({ open: true, product: p });
  const onCloseReject = () => setRejectModal({ open: false, product: null });

  const onSubmitReject = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const reason = form.get("reason")?.toString().trim();
    const feedback = form.get("feedback")?.toString().trim();
    if (!reason || !feedback) {
      return Swal.fire("Missing info", "Please provide both fields.", "warning");
    }
    rejectMutation.mutate({ product: rejectModal.product, reason, feedback });
    onCloseReject();
  };

  const onOpenDelete = (p) => setDeleteModal({ open: true, product: p });
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
    <>
    <title>All-product</title>
    <div className="max-w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin · All Products</h1>
          <p className="text-sm md:text-base text-gray-500">
            Review, approve, reject, edit, or remove products created by vendors.
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
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
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
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <button
                className="join-item btn btn-outline"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table + Fetching overlay */}
      <div className="card bg-base-100 shadow relative">
        {/* overlay while fetching new page/filter/search */}
        {isFetching && !isLoading && (
          <div className="absolute inset-0 bg-base-100/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}

        <div className="card-body p-0 md:p-0 overflow-x-auto">
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
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="py-10 text-center text-gray-500">
                      No products match your filters.
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((p, idx) => {
                  const latest = (p.prices || [])
                    .slice()
                    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                  return (
                    <tr key={p._id}>
                      <td>{(currentPage - 1) * LIMIT + idx + 1}</td>
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
                      <td className="font-medium">৳{Number(p.price_per_unit).toFixed(2)}</td>
                      <td className="hidden md:table-cell">
                        {latest?.date ? new Date(latest.date).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[p.status || "pending"]}`}>
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
                            disabled={(p.status || "pending") === "approved" || approveMutation.isPending}
                            title="Approve"
                          >
                            <FaCheckCircle />
                          </button>
                          <button
                            className="btn btn-xs btn-warning"
                            onClick={() => onOpenReject(p)}
                            disabled={rejectMutation.isPending}
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
                            disabled={deleteMutation.isPending}
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

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center py-4">
          <ReactPaginate
            previousLabel={"← Prev"}
            nextLabel={"Next →"}
            breakLabel={"…"}
            pageCount={pageCount}
            forcePage={Math.min(currentPage - 1, pageCount - 1)}
            onPageChange={handlePageClick}
            renderOnZeroPageCount={null}
            // container
            containerClassName="join"
            // page button (li + a)
            pageClassName="join-item"
            pageLinkClassName="btn btn-sm"
            // previous
            previousClassName="join-item"
            previousLinkClassName="btn btn-sm"
            // next
            nextClassName="join-item"
            nextLinkClassName="btn btn-sm"
            // active
            activeLinkClassName="btn-primary text-white"
            // break
            breakClassName="join-item"
            breakLinkClassName="btn btn-sm btn-ghost"
            // disable styles
            disabledLinkClassName="btn-disabled"
          />
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Reject Product</h3>
            <p className="text-sm text-gray-500 mb-4">
              Provide a clear <b>reason</b> and <b>feedback</b>. Vendors will see this.
            </p>
            <form onSubmit={onSubmitReject} className="space-y-3">
              <div className="form-control">
                <label className="label">Reason</label>
                <input
                  name="reason"
                  className="input input-bordered w-full"
                  placeholder="e.g., Wrong image / Incomplete info"
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
                <button type="button" className="btn btn-ghost" onClick={onCloseReject}>
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
    </>
  );
};

export default AdminAllProduct;

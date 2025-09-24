import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { FaSearch, FaSyncAlt, FaTrash, FaAd, FaExternalLinkAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import LoadingSpinner from "../../components/LoadingSpinner";

const STATUS_OPTIONS = ["pending", "active", "paused", "rejected"];
const STATUS_COLORS = {
  pending: "badge-warning",
  active: "badge-success",
  paused: "badge-info",
  rejected: "badge-error",
};

const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "—");

const AdminAllAdvertisement = () => {
  const axiosPublic = useAxiosPublic();
  const qc = useQueryClient();

  // controls
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  // fetch all ads
  const { data: ads = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["adminAllAds"],
    queryFn: async () => {
      const res = await axiosPublic.get("/advertisements");
      return res.data || [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  // mutate: update status
  const updateStatus = useMutation({
    mutationFn: async ({ _id, status }) => {
      const res = await axiosPublic.patch(`/advertisements/${_id}/status`, { status });
      return res.data;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["adminAllAds"] });
      const prev = qc.getQueryData(["adminAllAds"]);
      qc.setQueryData(["adminAllAds"], (old = []) =>
        old.map((a) => (a._id === vars._id ? { ...a, status: vars.status } : a))
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["adminAllAds"], ctx.prev);
      Swal.fire("Error", "Failed to update status", "error");
    },
    onSuccess: () => Swal.fire("Updated", "Advertisement status updated", "success"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["adminAllAds"] }),
  });

  // mutate: delete ad
  const deleteAd = useMutation({
    mutationFn: async ({ _id }) => {
      const res = await axiosPublic.delete(`/advertisements/${_id}`);
      return res.data;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["adminAllAds"] });
      const prev = qc.getQueryData(["adminAllAds"]);
      qc.setQueryData(["adminAllAds"], (old = []) => old.filter((a) => a._id !== vars._id));
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["adminAllAds"], ctx.prev);
      Swal.fire("Error", "Failed to delete advertisement", "error");
    },
    onSuccess: () => Swal.fire("Deleted", "Advertisement removed", "success"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["adminAllAds"] }),
  });

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return ads
      .filter((a) => (statusFilter === "all" ? true : (a.status || "pending") === statusFilter))
      .filter((a) =>
        !s
          ? true
          : (a.title || "").toLowerCase().includes(s) ||
            (a.vendor_email || "").toLowerCase().includes(s) ||
            (a.placement || "").toLowerCase().includes(s)
      )
      .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }, [ads, statusFilter, search]);

  const handleChangeStatus = async (ad, newStatus) => {
    if (ad.status === newStatus) return;
    const res = await Swal.fire({
      title: "Change status?",
      html: `
        <div class="text-left">
          <div><b>Ad:</b> ${ad.title || "Untitled"}</div>
          <div><b>From:</b> ${ad.status || "pending"} → <b>${newStatus}</b></div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
    });
    if (res.isConfirmed) {
      updateStatus.mutate({ _id: ad._id, status: newStatus });
    }
  };

  const handleDelete = async (ad) => {
    const res = await Swal.fire({
      title: "Delete advertisement?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });
    if (res.isConfirmed) deleteAd.mutate({ _id: ad._id });
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="alert alert-error">
          <span>Failed to load advertisements. Please try again.</span>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FaAd /> Admin · All Advertisements
          </h1>
          <p className="text-sm md:text-base text-gray-500">
            Review, activate, pause, reject or delete vendor advertisements.
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
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control md:col-span-2">
            <label className="label">Search (title / vendor / placement)</label>
            <div className="join w-full">
              <div className="join-item input input-bordered flex items-center gap-2 w-full">
                <FaSearch className="opacity-60" />
                <input
                  className="grow outline-none bg-transparent"
                  placeholder="e.g., Summer Sale / vendor@mail.com / homepage-top"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="join-item btn btn-outline" onClick={() => setSearch("")}>
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
                <th>Ad</th>
                <th className="hidden lg:table-cell">Placement</th>
                <th className="hidden md:table-cell">Vendor</th>
                <th className="hidden md:table-cell">Dates</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="py-10 text-center text-gray-500">
                      No advertisements match your filters.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((ad, idx) => (
                  <tr key={ad._id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10">
                            <img src={ad.image_url} alt={ad.title} />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold">{ad.title || "Untitled"}</div>
                          {ad.cta_url && (
                            <a
                              href={ad.cta_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary inline-flex items-center gap-1"
                              title="Open landing"
                            >
                              Open link <FaExternalLinkAlt />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell">{ad.placement || "—"}</td>
                    <td className="hidden md:table-cell">{ad.vendor_email || "—"}</td>
                    <td className="hidden md:table-cell">
                      <div className="text-xs">
                        <div><b>Start:</b> {fmt(ad.start_date)}</div>
                        <div><b>End:</b> {fmt(ad.end_date)}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[ad.status || "pending"]}`}>
                        {ad.status || "pending"}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <select
                          className="select select-sm select-bordered"
                          value={ad.status || "pending"}
                          onChange={(e) => handleChangeStatus(ad, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn btn-xs btn-error"
                          onClick={() => handleDelete(ad)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAllAdvertisement;

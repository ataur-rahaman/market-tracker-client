import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaUserShield, FaSearch, FaSyncAlt } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import ReactPaginate from "react-paginate";
import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const ROLE_OPTIONS = ["user", "vendor", "admin"];
const LIMIT = 8;

const formatDate = (val) => {
  if (!val) return "—";
  try {
    const d = typeof val === "string" ? new Date(val) : val;
    return d.toLocaleDateString();
  } catch {
    return "—";
  }
};

const AdminAllUser = () => {
  const axiosSecure = useAxiosSecure();
  const { user: me } = useAuth();
  const qc = useQueryClient();

  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch paginated users
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["adminAllUsers", currentPage, roleFilter, search],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/users?page=${currentPage}&limit=${LIMIT}&role=${encodeURIComponent(
          roleFilter
        )}&search=${encodeURIComponent(search)}`
      );
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const users = data?.users || [];
  const total = data?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / LIMIT));

  // Update role mutation
  const { mutate: updateRole, isLoading: updating } = useMutation({
    mutationFn: async ({ _id, role }) => {
      const res = await axiosSecure.patch(`/users/${_id}/role`, { role });
      return res.data;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["adminAllUsers"] });
      const prev = qc.getQueryData(["adminAllUsers"]);
      qc.setQueryData(["adminAllUsers"], (old = []) =>
        old.map((u) =>
          u._id === vars._id ? { ...u, user_role: vars.role } : u
        )
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["adminAllUsers"], ctx.prev);
      Swal.fire("Error", "Failed to update role", "error");
    },
    onSuccess: () => Swal.fire("Updated", "User role has been updated", "success"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["adminAllUsers"] }),
  });

  const handleChangeRole = async (u, newRole) => {
    if (u.user_role === newRole) return;

    if (me?.email && u.user_email?.toLowerCase() === me.email.toLowerCase()) {
      return Swal.fire("Not allowed", "You cannot change your own role.", "warning");
    }

    const result = await Swal.fire({
      title: "Update Role?",
      html: `
        <div class="text-left">
          <div><b>User:</b> ${u.user_name || "Unnamed"} (${u.user_email})</div>
          <div class="mt-1"><b>Old role:</b> ${u.user_role || "user"}</div>
          <div><b>New role:</b> ${newRole}</div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
    });

    if (result.isConfirmed) {
      updateRole({ _id: u._id, role: newRole });
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="alert alert-error">
          <span>Failed to load users. Please try again.</span>
        </div>
      </div>
    );

  return (
    <>
    <title>All-user</title>
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <MdAdminPanelSettings /> Admin · All Users
          </h1>
          <p className="text-sm md:text-base text-gray-500">
            View and manage user roles across the platform.
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
            <label className="label">Filter by Role</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="select select-bordered w-full"
            >
              <option value="all">All</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control md:col-span-2">
            <label className="label">Search (name or email)</label>
            <div className="join w-full">
              <div className="join-item input input-bordered flex items-center gap-2 w-full">
                <FaSearch className="opacity-60" />
                <input
                  className="grow outline-none bg-transparent"
                  placeholder="e.g., alice@mail.com"
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

      {/* Table with loading overlay */}
      <div className="card bg-base-100 shadow relative">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 bg-base-100/60 flex items-center justify-center z-10">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}

        <div className="card-body overflow-x-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="card-title">
              <FaUserShield /> Users ({total})
            </h2>
          </div>

          {users.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No users found.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th className="hidden md:table-cell">Name</th>
                  <th>Role</th>
                  <th className="hidden md:table-cell">Created</th>
                  <th className="hidden md:table-cell">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => {
                  const isMe =
                    me?.email && u.user_email?.toLowerCase() === me.email.toLowerCase();
                  return (
                    <tr key={u._id}>
                      <td>{(currentPage - 1) * LIMIT + idx + 1}</td>
                      <td>{u.user_email}</td>
                      <td className="hidden md:table-cell">{u.user_name || "—"}</td>
                      <td>
                        <select
                          className="select select-sm select-bordered"
                          value={u.user_role || "user"}
                          onChange={(e) => handleChangeRole(u, e.target.value)}
                          disabled={updating || isMe}
                          title={isMe ? "You cannot change your own role" : "Change role"}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="hidden md:table-cell">{formatDate(u.created_at)}</td>
                      <td className="hidden md:table-cell">{formatDate(u.last_login)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
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
            containerClassName="join"
            pageClassName="join-item"
            pageLinkClassName="btn btn-sm"
            previousClassName="join-item"
            previousLinkClassName="btn btn-sm"
            nextClassName="join-item"
            nextLinkClassName="btn btn-sm"
            activeLinkClassName="btn-primary text-white"
            breakClassName="join-item"
            breakLinkClassName="btn btn-sm btn-ghost"
            disabledLinkClassName="btn-disabled"
          />
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        Tip: You can’t modify your own role. Select a role from the dropdown to update another user.
      </div>
    </div>
    </>
  );
};

export default AdminAllUser;

import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaUserShield, FaSearch, FaSyncAlt } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import Swal from "sweetalert2";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAuth from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";

const ROLE_OPTIONS = ["user", "vendor", "admin"];

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
  const axiosPublic = useAxiosPublic();
  const { user: me } = useAuth();
  const qc = useQueryClient();

  // Controls
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Fetch users
  const { data: users = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["adminAllUsers"],
    queryFn: async () => {
      const res = await axiosPublic.get("/users");
      return res.data || [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  // Role update mutation (optimistic)
  const { mutate: updateRole, isLoading: updating } = useMutation({
    mutationFn: async ({ _id, role }) => {
      const res = await axiosPublic.patch(`/users/${_id}/role`, { role });
      return res.data;
    },
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey: ["adminAllUsers"] });
      const prev = qc.getQueryData(["adminAllUsers"]);
      // optimistic update
      qc.setQueryData(["adminAllUsers"], (old = []) =>
        old.map((u) => (u._id === variables._id ? { ...u, user_role: variables.role } : u))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["adminAllUsers"], ctx.prev);
      Swal.fire("Error", "Failed to update role", "error");
    },
    onSuccess: () => {
      Swal.fire("Updated", "User role has been updated", "success");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["adminAllUsers"] });
    },
  });

  // Derived filtered list
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return users
      .filter((u) => (roleFilter === "all" ? true : (u.user_role || "user") === roleFilter))
      .filter((u) =>
        !s
          ? true
          : (u.user_email || "").toLowerCase().includes(s) ||
            (u.user_name || "").toLowerCase().includes(s)
      )
      .sort((a, b) => (a.user_email || "").localeCompare(b.user_email || ""));
  }, [users, roleFilter, search]);

  const handleChangeRole = async (u, newRole) => {
    if (u.user_role === newRole) return;

    // prevent changing own role
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
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="btn btn-outline">
            <FaSyncAlt className={isFetching ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="card bg-base-100 shadow">
        <div className="card-body grid md:grid-cols-3 gap-3">
          <div className="form-control">
            <label className="label">Filter by Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
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
                  placeholder="e.g., alice / alice@mail.com"
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
          <div className="flex items-center justify-between mb-2">
            <h2 className="card-title">
              <FaUserShield /> Users ({filtered.length})
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No users match your filters.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th className="hidden md:table-cell">Name</th>
                  <th>Role</th>
                  <th className="hidden md:table-cell">Created</th>
                  <th className="hidden md:table-cell">Last Login</th>
                  {/* <th className="text-right">Action</th> */}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => {
                  const isMe =
                    me?.email && u.user_email?.toLowerCase() === me.email.toLowerCase();

                  return (
                    <tr key={u._id}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="font-medium">{u.user_email}</div>
                      </td>
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

      {/* Footer note */}
      <div className="text-xs text-gray-500 text-center">
        Tip: You can’t modify your own role. Select a role from the dropdown to update a user.
      </div>
    </div>
  );
};

export default AdminAllUser;

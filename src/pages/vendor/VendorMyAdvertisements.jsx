import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAuth from "../../hooks/useAuth";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import LoadingSpinner from "../../components/LoadingSpinner";

const VendorMyAdvertisements = () => {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();

  const [editingAd, setEditingAd] = useState(null); 

  // Fetch vendor's ads
  const {
    data: ads = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["vendorAdvertisements", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosPublic.get(`/advertisements/vendor/${user?.email}`);
      return res.data;
    },
  });

  // Delete Ad
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this advertisement?"))
      return;
    try {
      await axiosPublic.delete(`/advertisements/${id}`);
      toast.success("Advertisement deleted successfully!");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete advertisement.");
    }
  };

  // Update Ad
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosPublic.put(
        `/advertisements/${editingAd._id}`,
        editingAd
      );
      if (res.data.success) {
        toast.success("Advertisement updated successfully!");
        setEditingAd(null);
        refetch();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update advertisement.");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📢 My Advertisements: {ads.length}</h2>

      {ads.length === 0 ? (
        <p className="text-gray-500">No advertisements submitted yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Ad Title</th>
                <th>Description</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad, idx) => (
                <tr key={ad._id}>
                  <td>{idx + 1}</td>
                  <td>{ad.ad_title}</td>
                  <td>{ad.description}</td>
                  <td>
                    <span
                      className={`badge ${
                        ad.status === "pending"
                          ? "badge-warning"
                          : "badge-success"
                      }`}
                    >
                      {ad.status}
                    </span>
                  </td>
                  <td className="flex gap-2 justify-center">
                    <button
                      onClick={() => setEditingAd(ad)}
                      className="btn btn-sm btn-info text-white"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(ad._id)}
                      className="btn btn-sm btn-error text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Modal */}
      {editingAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">✏️ Update Advertisement</h3>
            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="text"
                value={editingAd.ad_title}
                onChange={(e) =>
                  setEditingAd({ ...editingAd, ad_title: e.target.value })
                }
                className="input input-bordered w-full"
                required
              />
              <textarea
                value={editingAd.description}
                onChange={(e) =>
                  setEditingAd({ ...editingAd, description: e.target.value })
                }
                className="textarea textarea-bordered w-full"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEditingAd(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorMyAdvertisements;

import React from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router";
import Swal from "sweetalert2";

const VendorMyProducts = () => {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();

  const {
    data: products = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["vendorProducts", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosPublic.get(`/products/vendor/${user?.email}`);
      return res.data;
    },
  });

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
      await axiosPublic.delete(`/products/${id}`);
      Swal.fire("Deleted!", "Product has been deleted.", "success");
      refetch();
    } catch (error) {
      console.error(error);
      Swal.fire("Error!", "Failed to delete product.", "error");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-0">
      <h2 className="text-2xl font-bold mb-4">📦 My Products: {products.length}</h2>

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
              {products.map((p, idx) => (
                <tr key={p._id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <img
                        src={p.image_url}
                        alt={p.item_name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <span>{p.item_name}</span>
                    </div>
                  </td>
                  <td>{p.market_name}</td>
                  <td>
                    {p.prices?.length > 0
                      ? p.prices[p.prices.length - 1].date
                      : p.date}
                  </td>
                  <td>৳{p.price_per_unit}/kg</td>
                  <td>
                    <span
                      className={`badge ${
                        p.status === "pending"
                          ? "badge-warning"
                          : "badge-success"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="flex gap-2 justify-center">
                    {/* View Details */}
                    <Link
                      to={`/products/${p._id}`}
                      className="btn btn-sm btn-outline"
                    >
                      View
                    </Link>

                    {/* Update Price */}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VendorMyProducts;

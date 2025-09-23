import React from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosPublic from "../hooks/useAxiosPublic";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axiosPublic.get(`/products/${id}`);
      return res.data;
    },
  });

  const handleAddToWatchlist = async () => {
    try {
      await axiosPublic.post("/watchlist", {
        productId: product._id,
        userEmail: user.email,
      });
      Swal.fire("Added!", "Product added to your watchlist.", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error!", "Could not add to watchlist.", "error");
    }
  };

  const handleBuyProduct = () => {
    Swal.fire("Coming Soon!", "Purchase feature will be available soon.", "info");
  };

  if (isLoading) return <LoadingSpinner />;

  if (!product) {
    return <p className="text-center text-red-500">❌ Product not found</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-base-100 shadow rounded-lg">
      {/* Market + Image */}
      <h2 className="text-2xl font-bold mb-4">🏪 {product.market_name}</h2>
      <img
        src={product.image_url}
        alt={product.item_name}
        className="w-full max-h-80 object-cover rounded mb-4"
      />

      {/* Date */}
      <p className="text-gray-600 mb-4">📅 {product.date}</p>

      {/* Full Item list with prices */}
      <h3 className="text-xl font-semibold mb-2">🥕 Item & Price History</h3>
      <ul className="list-disc pl-6 mb-4">
        {product.prices?.map((p, idx) => (
          <li key={idx}>
            {product.item_name} — ৳{p.price}/kg <span className="text-gray-500">({p.date})</span>
          </li>
        ))}
      </ul>

      {/* Vendor Info */}
      <h3 className="text-xl font-semibold mb-2">👨‍🌾 Vendor Info</h3>
      <p>
        <strong>{product.vendor_name}</strong> <br />
        {product.vendor_email}
      </p>

      {/* Reviews / Comments */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">💬 User Reviews</h3>
        {/* Placeholder — later you can fetch from /reviews/:productId */}
        {product.reviews?.length ? (
          <ul className="space-y-2">
            {product.reviews.map((r, idx) => (
              <li key={idx} className="p-2 border rounded">
                <strong>{r.user}</strong>: {r.comment}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleAddToWatchlist}
          disabled={!user || user.role === "admin" || user.role === "vendor"}
          className="btn btn-outline flex-1"
        >
          ⭐ Add to Watchlist
        </button>
        <button onClick={handleBuyProduct} className="btn btn-primary flex-1">
          🛒 Buy Product
        </button>
      </div>
    </div>
  );
};

export default ProductDetailsPage;

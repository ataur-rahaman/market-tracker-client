import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAxiosPublic from "../hooks/useAxiosPublic";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";
import useAxiosSecure from "../hooks/useAxiosSecure";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const qc = useQueryClient();

  const userKey = user?.email ? user.email.toLowerCase() : undefined;

  // Fetch product
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/products/${id}`);
      return res.data;
    },
  });

  // Fetch reviews
  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/reviews/${id}`);
      return res.data || [];
    },
  });

  // Watchlist
  const { data: watchlist = [] } = useQuery({
    queryKey: ["watchlist", userKey],
    enabled: !!userKey,
    queryFn: async () => {
      const res = await axiosSecure.get(`/watchlist/${userKey}`);
      return res.data || [];
    },
  });

  // Orders
  // const { data: orders = [] } = useQuery({
  //   queryKey: ["orders", userKey],
  //   enabled: !!userKey,
  //   queryFn: async () => {
  //     const res = await axiosPublic.get(`/orders/${userKey}`);
  //     return res.data || [];
  //   },
  // });

  const isAlreadyInWatchlist = watchlist.some(
    (item) => item.product?._id === product?._id
  );

  // const isAlreadyBought = orders.some(
  //   (order) => order.productId === product?._id
  // );

  // Watchlist Mutation
  const addWatchlistMutation = useMutation({
    mutationFn: async () =>
      axiosSecure.post("/watchlist", {
        productId: product._id,
        userEmail: user.email,
      }),
    onSuccess: () => {
      qc.invalidateQueries(["watchlist", userKey]);
      Swal.fire("Added!", "Product added to your watchlist.", "success");
    },
    onError: () => Swal.fire("Error!", "Could not add to watchlist.", "error"),
  });

  const handleAddToWatchlist = () => {
    if (!user)
      return Swal.fire("Login Required", "Please log in first.", "info");
    if (isAlreadyInWatchlist)
      return Swal.fire("Info", "Already in your watchlist.", "info");
    addWatchlistMutation.mutate();
  };

  // Buy → go to payment (all buy/order logic happens in PaymentForm)
  const handleBuyProduct = async () => {
    if (!user) {
      Swal.fire("Login Required", "Please log in to buy.", "info");
      return;
    }
    navigate(`/payment/${product._id}`, { state: { product } });
  };

  // Review form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const reviewMutation = useMutation({
    mutationFn: async () =>
      axiosSecure.post(`/reviews/${id}`, {
        userEmail: user.email,
        userName: user.displayName || user.email.split("@")[0],
        rating,
        comment,
      }),
    onSuccess: () => {
      setRating(0);
      setComment("");
      refetchReviews();
      toast.success("Review submitted successfully!");
    },
    onError: () => toast.error("Failed to submit review."),
  });

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) return toast.info("Please log in to post a review.");
    if (!rating || !comment.trim())
      return toast.warn("Please add rating and comment.");
    reviewMutation.mutate();
  };

  if (isLoading) return <LoadingSpinner />;
  if (!product) return <p className="text-center text-red-500">❌ Product not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-base-100 shadow rounded-lg space-y-6 mb-4">
      <h2 className="text-2xl font-bold">🏪 {product.market_name}</h2>
      <img
        src={product.image_url}
        alt={product.item_name}
        className="w-full max-h-80 object-cover rounded"
      />
      <p className="text-gray-600">📅 {product.date}</p>

      <h3 className="text-xl font-semibold">🥕 Item & Price History</h3>
      <ul className="list-disc pl-6">
        {product.prices?.map((p, idx) => (
          <li key={idx}>
            {product.item_name} — ৳{p.price}/kg{" "}
            <span className="text-gray-500">({p.date})</span>
          </li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold">👨‍🌾 Vendor Info</h3>
      <p>
        <strong>{product.vendor_name}</strong>
        <br />
        {product.vendor_email}
      </p>

      {/* ⭐ Reviews Section */}
      <div className="mt-8 border-t pt-4">
        <h3 className="text-xl font-semibold mb-3">💬 Reviews & Comments</h3>

        {/* Review Form */}
        <form onSubmit={handleSubmitReview} className="space-y-3">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <span
                key={num}
                onClick={() => setRating(num)}
                className={`cursor-pointer text-2xl ${
                  num <= rating ? "text-yellow-400" : "text-gray-400"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Share your experience with this product’s price..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={reviewMutation.isPending}
          >
            {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        {/* Display Reviews */}
        <div className="mt-5 space-y-3">
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first to comment!</p>
          ) : (
            reviews
              .slice()
              .reverse()
              .map((r, idx) => (
                <div key={idx} className="p-3 border rounded-lg bg-base-200 flex flex-col gap-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      <strong>{r.userName}</strong> ({r.userEmail})
                    </span>
                    <span>{new Date(r.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-1 text-yellow-400">
                    {"★".repeat(r.rating)}
                    <span className="text-gray-300">
                      {"★".repeat(5 - r.rating)}
                    </span>
                  </div>
                  <p>{r.comment}</p>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-6">
        {!isAlreadyInWatchlist ? (
          <button
            onClick={handleAddToWatchlist}
            disabled={!user}
            className="btn btn-outline flex-1"
          >
            ⭐ Add to Watchlist
          </button>
        ) : (
          <button disabled className="btn btn-outline flex-1 cursor-not-allowed">
            ✅ In Watchlist
          </button>
        )}

        {/* {isAlreadyBought ? (
          <button disabled className="btn btn-primary flex-1 cursor-not-allowed">
            ✅ Already Bought
          </button>
        ) : (
          <button
            onClick={handleBuyProduct}
            disabled={!user}
            className="btn btn-primary flex-1"
          >
            🛒 Buy Product
          </button>
        )} */}
        <button
            onClick={handleBuyProduct}
            disabled={!user}
            className="btn btn-primary flex-1"
          >
            🛒 Buy Product
          </button>
      </div>

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
};

export default ProductDetailsPage;

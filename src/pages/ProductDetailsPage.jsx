import React from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAxiosPublic from "../hooks/useAxiosPublic";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const qc = useQueryClient();

  const userKey = user?.email ? user.email.toLowerCase() : undefined;

  // Fetch product
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axiosPublic.get(`/products/${id}`);
      return res.data;
    },
  });

  // Fetch user watchlist (to check if already exists)
  const { data: watchlist = [] } = useQuery({
    queryKey: ["watchlist", userKey],
    enabled: !!userKey,
    queryFn: async () => {
      const res = await axiosPublic.get(`/watchlist/${userKey}`);
      return res.data || [];
    },
  });

  // Fetch user orders (to check if already bought)
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", userKey],
    enabled: !!userKey,
    queryFn: async () => {
      const res = await axiosPublic.get(`/orders/${userKey}`);
      return res.data || [];
    },
  });

  const isAlreadyInWatchlist = watchlist.some(
    (item) => item.product?._id === product?._id
  );

  const isAlreadyBought = orders.some(
    (order) => order.productId === product?._id
  );

  // Add to Watchlist mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      return axiosPublic.post("/watchlist", {
        productId: product._id,
        userEmail: user.email,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["watchlist", userKey] });
      Swal.fire("Added!", "Product added to your watchlist.", "success");
    },
    onError: () => {
      Swal.fire("Error!", "Could not add to watchlist.", "error");
    },
  });

  const handleAddToWatchlist = () => {
    if (!user) {
      Swal.fire("Login Required", "Please log in to add to watchlist.", "info");
      return;
    }
    if (isAlreadyInWatchlist) {
      Swal.fire("Info", "This product is already in your watchlist.", "info");
      return;
    }
    addMutation.mutate();
  };

  // Buy (Create order)
  const buyMutation = useMutation({
    mutationFn: async () => {
      return axiosPublic.post("/orders", {
        productId: product._id,
        buyerEmail: user.email,
      });
    },
    onSuccess: () => {
      // ✅ Make sure the orders list gets fresh data
      qc.invalidateQueries({ queryKey: ["orders", userKey] });
      toast.success("Order placed! Opening My Orders…", { autoClose: 900 });
      navigate("/dashboard/user/my-order-list"); // immediate navigate; orders page will refetch
    },
    onError: () => {
      Swal.fire("Error!", "Could not place order.", "error");
    },
  });

  const handleBuyProduct = async () => {
    if (!user) {
      Swal.fire("Login Required", "Please log in to place an order.", "info");
      return;
    }
    if (user.role === "admin" || user.role === "vendor") {
      Swal.fire("Not Allowed", "Only customers can place orders.", "warning");
      return;
    }

    const latestPrice = (product.prices || [])
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const priceShown = latestPrice?.price ?? product.price_per_unit;

    const result = await Swal.fire({
      title: "Confirm Purchase",
      html: `
        <div class="text-left">
          <p><b>Item:</b> ${product.item_name}</p>
          <p><b>Market:</b> ${product.market_name}</p>
          <p><b>Price:</b> ৳${Number(priceShown).toFixed(2)}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Place Order",
    });

    if (result.isConfirmed) {
      buyMutation.mutate();
    }
  };

  const handleGoToWatchlist = () => {
    toast.info("Redirecting to your watchlist…", { autoClose: 800 });
    navigate("/watchlist");
  };

  if (isLoading) return <LoadingSpinner />;
  if (!product) return <p className="text-center text-red-500">❌ Product not found</p>;

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

      {/* Price history */}
      <h3 className="text-xl font-semibold mb-2">🥕 Item & Price History</h3>
      <ul className="list-disc pl-6 mb-4">
        {product.prices?.map((p, idx) => (
          <li key={idx}>
            {product.item_name} — ৳{p.price}/kg{" "}
            <span className="text-gray-500">({p.date})</span>
          </li>
        ))}
      </ul>

      {/* Vendor Info */}
      <h3 className="text-xl font-semibold mb-2">👨‍🌾 Vendor Info</h3>
      <p>
        <strong>{product.vendor_name}</strong> <br />
        {product.vendor_email}
      </p>

      {/* Reviews */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">💬 User Reviews</h3>
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
        {!isAlreadyInWatchlist ? (
          <button
            onClick={handleAddToWatchlist}
            disabled={!user || user.role === "admin" || user.role === "vendor"}
            className="btn btn-outline flex-1"
          >
            ⭐ Add to Watchlist
          </button>
        ) : (
          <div className="flex gap-2 w-full">
            <button disabled className="btn btn-outline flex-1 cursor-not-allowed">
              ✅ In Watchlist
            </button>
            <button onClick={handleGoToWatchlist} className="btn btn-success flex-1">
              📋 Go to Watchlist
            </button>
          </div>
        )}

        {isAlreadyBought ? (
          <button disabled className="btn btn-primary flex-1 cursor-not-allowed">
            ✅ Already Bought
          </button>
        ) : (
          <button
            onClick={handleBuyProduct}
            disabled={!user || user.role === "admin" || user.role === "vendor"}
            className="btn btn-primary flex-1"
          >
            🛒 Buy Product
          </button>
        )}
      </div>

      {/* Toasts */}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
};

export default ProductDetailsPage;

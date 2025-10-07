import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAuth from "../../hooks/useAuth";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();
  const qc = useQueryClient();

  // product could be sent via navigate state or fetched by id
  const stateProduct = location.state?.product;

  const { data: fetchedProduct, isLoading: isFetchingProduct } = useQuery({
    queryKey: ["paymentProduct", routeId],
    enabled: !stateProduct && !!routeId,
    queryFn: async () => {
      const res = await axiosPublic.get(`/products/${routeId}`);
      return res.data;
    },
  });

  const product = stateProduct || fetchedProduct;

  // guard: must be logged in
  if (!user) {
    Swal.fire("Login required", "Please log in to continue.", "info");
    navigate("/login");
  }

  // derive latest price safely
  const latestPrice = useMemo(() => {
    if (!product) return 0;
    const arr = (product.prices || [])
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const p = arr[0]?.price ?? product.price_per_unit ?? 0;
    return Number(p) || 0;
  }, [product]);

  const amountInCents = Math.round(latestPrice * 100);

  // Order creation mutation (after Stripe success)
  const userKey = user?.email?.toLowerCase();
  const createOrderMutation = useMutation({
    mutationFn: async ({ paymentIntent }) => {
      // minimal required fields; include more if you like
      return axiosPublic.post("/orders", {
        productId: product._id,
        buyerEmail: user.email,
        pricePaid: latestPrice,
        transactionId: paymentIntent.id,
        paymentStatus: paymentIntent.status,
        purchasedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      // refresh orders cache and go to my orders
      qc.invalidateQueries(["orders", userKey]);
      Swal.fire("Success", "Payment complete and order created!", "success");
      navigate("/dashboard/user/my-order-list");
    },
    onError: () => {
      Swal.fire("Error", "Payment succeeded, but failed to create the order. Please contact support.", "error");
    },
  });

  const [inputError, setInputError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !product) return;

    try {
      setProcessing(true);
      setInputError("");

      // 1) Create Payment Intent
      const piRes = await axiosPublic.post("/create-payment-intent", {
        amountInCents,
        productId: product._id,
      });
      const clientSecret = piRes.data?.clientSecret;
      if (!clientSecret) {
        setProcessing(false);
        return setInputError("Failed to initialize payment.");
      }

      // 2) Confirm card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.displayName || user.email,
            email: user.email,
          },
        },
      });

      if (result.error) {
        setProcessing(false);
        return setInputError(result.error.message || "Payment failed.");
      }

      // 3) If stripe ok → create order
      if (result.paymentIntent?.status === "succeeded") {
        await createOrderMutation.mutateAsync({ paymentIntent: result.paymentIntent });
        // navigate happens in onSuccess of mutation
      } else {
        setInputError("Payment not completed. Please try again.");
        setProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setInputError("Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  if (!product || isFetchingProduct) {
    return <div className="py-10"><LoadingSpinner /></div>;
  }

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Summary Card */}
      <div className="card bg-base-100 shadow-md w-full max-w-md">
        <div className="card-body">
          <h2 className="card-title">Confirm Your Payment</h2>
          <div className="flex gap-3 items-center">
            <img
              src={product.image_url}
              alt={product.item_name}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="text-sm">
              <div><b>Item:</b> {product.item_name}</div>
              <div><b>Market:</b> {product.market_name}</div>
              <div><b>Payable:</b> ৳{latestPrice.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-base-100 p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <CardElement className="p-2 border rounded" />
        <button
          type="submit"
          disabled={!stripe || processing || createOrderMutation.isPending}
          className={`btn btn-primary w-full ${processing ? "btn-disabled" : ""}`}
        >
          {processing ? (
            <span className="loading loading-spinner" />
          ) : (
            <>Pay ৳{latestPrice.toFixed(2)}</>
          )}
        </button>
        {inputError && <p className="text-red-600">{inputError}</p>}
      </form>
    </div>
  );
};

export default PaymentForm;

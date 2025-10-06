import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import useAxiosPublic from "../hooks/useAxiosPublic";
import useAuth from "../hooks/useAuth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LoadingSpinner from "../components/LoadingSpinner";

const AllProducts = () => {
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sort, setSort] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ["allProducts", sort, startDate, endDate],
    queryFn: async () => {
      const params = {};
      if (sort) params.sort = sort;
      if (startDate) params.startDate = startDate.toISOString().split("T")[0];
      if (endDate) params.endDate = endDate.toISOString().split("T")[0];

      const res = await axiosPublic.get("/products-all", { params });
      return res.data;
    },
  });

  const handleViewDetails = (id) => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(`/products/${id}`);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">🛍️ All Products</h2>

      {/* Filters & Sorting */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            refetch();
          }}
          className="select select-bordered"
        >
          <option value="">Sort By</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>

        <div className="flex items-center gap-2">
          <span>📅 From:</span>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            className="input input-bordered"
          />
        </div>

        <div className="flex items-center gap-2">
          <span>To:</span>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            className="input input-bordered"
          />
        </div>

        <button onClick={() => refetch()} className="btn btn-primary btn-sm">
          Apply Filter
        </button>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <p className="text-gray-500">No products found for the selected criteria.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p._id} className="card bg-base-100 shadow">
              <figure className="h-40 overflow-hidden">
                <img
                  src={p.image_url}
                  alt={p.item_name}
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title">{p.item_name}</h3>
                <p>💵 ৳{p.price_per_unit}/kg</p>
                <p>📅 {p.date}</p>
                <p>🏪 {p.market_name}</p>
                <p>👨‍🌾 {p.vendor_name}</p>
                <button
                  onClick={() => handleViewDetails(p._id)}
                  className="btn btn-outline btn-sm mt-2"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllProducts;

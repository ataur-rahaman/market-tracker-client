import React from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";

const ProductSectionCard = ({ product }) => {
  const { image_url, market_name, updated_at, _id, item_name, price_per_unit } = product;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="card bg-base-100 max-w-96 shadow-md hover:shadow-lg border border-gray-100"
    >
      {/* Image */}
      <motion.figure
        className="px-6 pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={image_url}
          alt={item_name || "product"}
          className="rounded-xl object-cover h-48 w-full"
        />
      </motion.figure>

      {/* Content */}
      <div className="card-body items-center text-center">
        <h2 className="card-title text-lg font-bold">{market_name}</h2>
        <p className="text-sm text-gray-500">{updated_at?.split("T")[0]}</p>

        {item_name && (
          <p className="text-gray-600 text-sm mt-1">
            🥦 {item_name} — <span className="font-semibold">৳{price_per_unit}/kg</span>
          </p>
        )}

        <div className="card-actions mt-3">
          <Link to={`/products/${_id}`} className="btn btn-primary btn-sm">
            🔍 View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductSectionCard;

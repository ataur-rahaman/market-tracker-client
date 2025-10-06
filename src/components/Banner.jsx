import React from "react";
import { motion } from "framer-motion";
import banner from "../assets/images/market-banner.webp";

const Banner = () => {
  return (
    <div className="w-10/12 mx-auto px-2 mt-[60px] h-[600px] relative overflow-hidden rounded-xl">
      {/* Banner Image with animation */}
      <motion.img
        src={banner}
        alt="green vegetable banner"
        className="w-full h-full object-cover border border-gray-200 rounded-xl"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
      />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent rounded-xl"></div>

      {/* Text overlay */}
      <div className="absolute bottom-10 left-10 text-white">
        <h1 className="text-4xl font-bold drop-shadow-lg">
          Track Your Local Market
        </h1>
        <p className="mt-2 text-lg text-gray-200 drop-shadow-sm">
          Stay updated with daily product prices and trends 🌾
        </p>
      </div>
    </div>
  );
};

export default Banner;

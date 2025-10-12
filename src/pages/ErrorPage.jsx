import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router";
import { FaHome, FaArrowLeft } from "react-icons/fa";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <>
    <title>Error</title>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-base-200 to-base-300 text-center px-4">
      {/* Animated Emoji */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-7xl md:text-9xl"
      >
        😢
      </motion.div>

      {/* Animated Text */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-4xl md:text-6xl font-extrabold mt-4 text-error"
      >
        404 – Page Not Found
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="text-gray-600 mt-3 max-w-lg"
      >
        Oops! It seems like you’ve wandered off track.  
        The page you’re looking for doesn’t exist or has been moved.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="flex gap-3 mt-8"
      >
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm md:btn-md flex items-center gap-2"
        >
          <FaArrowLeft /> Go Back
        </button>
        <Link
          to="/"
          className="btn btn-primary btn-sm md:btn-md flex items-center gap-2"
        >
          <FaHome /> Back to Home
        </Link>
      </motion.div>

      {/* Floating Numbers Animation */}
      <motion.div
        className="absolute text-[8rem] md:text-[12rem] font-extrabold text-gray-300/40 select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3, y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        404
      </motion.div>
    </div>
    </>
  );
};

export default ErrorPage;

// components/AboutUs.jsx
import React from "react";
import { FaLeaf, FaUsers } from "react-icons/fa";

const AboutUs = () => {
  return (
    <div className="bg-base-200 py-12 px-6 text-center">
      <h2 className="text-3xl font-bold mb-6">🌟 About Us</h2>
      <p className="max-w-3xl mx-auto text-gray-700 mb-6">
        Welcome to <span className="font-semibold">Market Tracker</span> — 
        a platform built to keep you updated with the latest market prices, 
        vendor updates, and valuable insights.  
        We aim to make local shopping transparent, affordable, and data-driven.
      </p>
      <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
        <div className="p-6 bg-white rounded shadow flex flex-col items-center">
          <FaLeaf className="text-green-500 text-4xl mb-2" />
          <h3 className="font-bold">Fresh & Local</h3>
          <p className="text-gray-600 text-sm mt-2">
            We connect you with daily price updates directly from local vendors.
          </p>
        </div>
        <div className="p-6 bg-white rounded shadow flex flex-col items-center">
          <FaUsers className="text-blue-500 text-4xl mb-2" />
          <h3 className="font-bold">Community Driven</h3>
          <p className="text-gray-600 text-sm mt-2">
            Vendors and customers together build a more transparent marketplace.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

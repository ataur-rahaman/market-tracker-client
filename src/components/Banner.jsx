import React from "react";
import banner from "../assets/images/market-banner.webp";

const Banner = () => {
  return (
    <div className="w-10/12 mx-auto px-2 mt-[150px] h-[600px]">
      <img
        className="w-full h-full object-cover rounded-xl border border-gray-300"
        src={banner}
        alt="green vegetable banner"
      />
    </div>
  );
};

export default Banner;

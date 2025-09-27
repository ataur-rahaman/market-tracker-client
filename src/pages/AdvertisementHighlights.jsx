import React from "react";
import Slider from "react-slick";
import { useQuery } from "@tanstack/react-query";
import useAxiosPublic from "../hooks/useAxiosPublic";
import LoadingSpinner from "../components/LoadingSpinner";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";



const AdvertisementHighlights = () => {
  const axiosPublic = useAxiosPublic();

  // fetch advertisements (only approved/active ads)
  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["advertisements"],
    queryFn: async () => {
      const res = await axiosPublic.get("/advertisements");
      // optionally filter here if your backend doesn’t
      return res.data.filter((ad) => ad.status === "active");
    },
  });

  if (isLoading) return <LoadingSpinner />;

  if (!ads.length) {
    return <p className="text-center text-gray-500">No advertisements available.</p>;
  }

  // carousel settings
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
    <div className="max-w-7xl w-11/12 mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">✨ Advertisement Highlights</h2>
      <Slider {...settings}>
        {ads.map((ad) => (
          <div key={ad._id} className="px-2">
            <div className="card bg-base-100 shadow-xl">
              <figure className="h-64 overflow-hidden">
                <img
                  src={ad.image_url}
                  alt={ad.ad_title}
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body text-center">
                <h3 className="card-title">{ad.ad_title}</h3>
                <p className="text-gray-600">{ad.description}</p>
                <p className="text-sm text-gray-400">Vendor: {ad.vendor_name}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default AdvertisementHighlights;

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import axios from "axios";

const VendorAddAdvertisement = () => {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  const imgbbApiKey = import.meta.env.VITE_ImgbbApiKey;

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Upload image to imgbb
      const formData = new FormData();
      formData.append("image", data.image[0]);

      const imgRes = await axios.post(
        `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
        formData
      );

      const imgData = imgRes.data;
      if (!imgData.success) {
        Swal.fire("Error!", "Image upload failed", "error");
        setLoading(false);
        return;
      }

      const imageUrl = imgData.data.display_url;

      // Build advertisement object
      const newAd = {
        vendor_email: user?.email,
        vendor_name: user?.displayName || "Unknown Vendor",
        ad_title: data.ad_title,
        description: data.description,
        image_url: imageUrl,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      // Save to backend
      const res = await axiosPublic.post("/advertisements", newAd);

      if (res.data.insertedId) {
        Swal.fire(
          "Success!",
          "Advertisement submitted successfully",
          "success"
        );
        reset();
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error!", "Failed to add advertisement", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-base-100 shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6">📢 Add Advertisement</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Ad Title */}
        <div>
          <label className="label">📝 Ad Title</label>
          <input
            {...register("ad_title", { required: true })}
            type="text"
            placeholder="Enter advertisement title"
            className="input input-bordered w-full"
          />
        </div>

        {/* Short Description */}
        <div>
          <label className="label">📄 Short Description</label>
          <textarea
            {...register("description", { required: true })}
            placeholder="Write a short description..."
            className="textarea textarea-bordered w-full"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="label">🖼️ Upload Banner Image</label>
          <input
            {...register("image", { required: true })}
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Submit Advertisement"}
        </button>
      </form>
    </div>
  );
};

export default VendorAddAdvertisement;

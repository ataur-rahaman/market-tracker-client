import React from "react";
import useAuth from "../../hooks/useAuth";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { Controller, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const VendorAddProduct = () => {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      date: new Date(),
      market_name: "",
      market_description: "",
      item_name: "",
      image_url: "",
      price_per_unit: "",
      item_description: "",
      vendor_email: user?.email || "",
      vendor_name: user?.displayName || "",
    },
  });

  React.useEffect(() => {
    setValue("vendor_email", user?.email || "");
    setValue("vendor_name", user?.displayName || "");
  }, [user, setValue]);

  const onSubmit = async (data) => {
    console.log(data);
    try {
      const isoDate = data.date instanceof Date ? data.date.toISOString().split("T")[0] : data.date;
      const newProduct = {
        vendor_email: data.vendor_email,
        vendor_name: data.vendor_name || "Anonymous Vendor",
        market_name: data.market_name,
        date: isoDate,
        market_description: data.market_description,
        item_name: data.item_name,
        status: "pending",
        image_url: data.image_url,
        price_per_unit: parseFloat(data.price_per_unit),
        prices: [
          {
            date: isoDate,
            price: parseFloat(data.price_per_unit),
          },
        ],
        item_description: data.item_description,
      };

      const res = await axiosPublic.post("/products", newProduct);

      if (res?.data?.insertedId) {
        Swal.fire("Success!", "Product added successfully", "success");
        reset();
      } else {
        throw new Error("Insert failed");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error!", "Failed to add product", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-base-100 shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6">➕ Add Product</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Hidden registered vendor fields so data contains them */}
        <input {...register("vendor_email")} type="hidden" />
        <input {...register("vendor_name")} type="hidden" />

        {/* Show vendor info (readOnly) for UX */}
        <div>
          <label className="label">📧 Vendor Email</label>
          <input
            type="email"
            value={user?.email || ""}
            readOnly
            className="input input-bordered w-full bg-gray-100"
          />
        </div>

        <div>
          <label className="label">🧑‍🌾 Vendor Name</label>
          <input
            type="text"
            value={user?.displayName || ""}
            readOnly
            className="input input-bordered w-full bg-gray-100"
          />
        </div>

        <div>
          <label className="label">🏪 Market Name</label>
          <input
            {...register("market_name", { required: "Market name is required" })}
            type="text"
            placeholder="Enter market name"
            className="input input-bordered w-full"
          />
          {errors.market_name && <p className="text-sm text-red-500">{errors.market_name.message}</p>}
        </div>

        <div>
          <label className="label">📅 Date</label>
          <Controller
            control={control}
            name="date"
            rules={{ required: "Date is required" }}
            render={({ field }) => (
              <DatePicker
                {...field}
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                className="input input-bordered w-full"
                dateFormat="yyyy-MM-dd"
              />
            )}
          />
          {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
        </div>

        <div>
          <label className="label">📝 Market Description</label>
          <textarea
            {...register("market_description", { required: "Market description is required" })}
            className="textarea textarea-bordered w-full"
            placeholder="Where the market is located, when it was established..."
          />
          {errors.market_description && <p className="text-sm text-red-500">{errors.market_description.message}</p>}
        </div>

        <div>
          <label className="label">🥦 Item Name</label>
          <input
            {...register("item_name", { required: "Item name is required" })}
            type="text"
            placeholder="e.g., Onion"
            className="input input-bordered w-full"
          />
          {errors.item_name && <p className="text-sm text-red-500">{errors.item_name.message}</p>}
        </div>

        <div>
          <label className="label">🖼️ Product Image (URL)</label>
          <input
            {...register("image_url", { required: "Image URL is required" })}
            type="text"
            placeholder="https://example.com/image.jpg"
            className="input input-bordered w-full"
          />
          {errors.image_url && <p className="text-sm text-red-500">{errors.image_url.message}</p>}
        </div>

        <div>
          <label className="label">💵 Price per Unit</label>
          <input
            {...register("price_per_unit", { required: "Price is required" })}
            type="number"
            step="0.01"
            placeholder="৳30"
            className="input input-bordered w-full"
          />
          {errors.price_per_unit && <p className="text-sm text-red-500">{errors.price_per_unit.message}</p>}
        </div>

        <div>
          <label className="label">📝 Item Description</label>
          <textarea
            {...register("item_description", { required: "Item description is required" })}
            className="textarea textarea-bordered w-full"
            placeholder="Fresh onions, locally grown..."
          />
          {errors.item_description && <p className="text-sm text-red-500">{errors.item_description.message}</p>}
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Product"}
        </button>
      </form>
    </div>
  );
};

export default VendorAddProduct;

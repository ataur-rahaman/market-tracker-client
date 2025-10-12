import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useUserRole from "../../hooks/useUserRole";
import LoadingSpinner from "../../components/LoadingSpinner";
import Swal from "sweetalert2";

const VendorUpdateProduct = () => {
  const { id } = useParams(); // product id
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const { role } = useUserRole(); // ✅ get current user role (vendor/admin)
  const location = useLocation();
//   const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});

  // Fetch existing product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosSecure.get(`/products/${id}`);
        // setProduct(res.data);
        setFormData(res.data);
      } catch (error) {
        console.error(error);
        Swal.fire("Error!", "Failed to load product", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, axiosSecure]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosSecure.put(`/products/${id}`, {
        ...formData,
        updated_by: role, // ✅ track who updated
      });

      if (res.data.success) {
        Swal.fire("Updated!", "Product updated successfully", "success");
        navigate(`${location.state ? location.state : "/dashboard/vendor/my-products"}`);
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error!", "Failed to update product", "error");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
    <title>Update-product</title>
    <div className="max-w-3xl mx-auto p-6 bg-base-100 shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6">✏️ Update Product</h2>

      <form onSubmit={handleUpdate} className="space-y-4">
        {/* Market Name */}
        <div>
          <label className="label">🏪 Market Name</label>
          <input
            type="text"
            name="market_name"
            value={formData.market_name || ""}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* Market Description */}
        <div>
          <label className="label">📝 Market Description</label>
          <textarea
            name="market_description"
            value={formData.market_description || ""}
            onChange={handleChange}
            className="textarea textarea-bordered w-full"
            required
          />
        </div>

        {/* Item Name */}
        <div>
          <label className="label">🥦 Item Name</label>
          <input
            type="text"
            name="item_name"
            value={formData.item_name || ""}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* Product Image */}
        <div>
          <label className="label">🖼️ Product Image (URL)</label>
          <input
            type="text"
            name="image_url"
            value={formData.image_url || ""}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
          {formData.image_url && (
            <img
              src={formData.image_url}
              alt="Preview"
              className="w-20 h-20 mt-2 rounded object-cover"
            />
          )}
        </div>

        {/* Price */}
        <div>
          <label className="label">💵 Price per Unit</label>
          <input
            type="number"
            step="0.01"
            name="price_per_unit"
            value={formData.price_per_unit || ""}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* Item Description */}
        <div>
          <label className="label">📝 Item Description</label>
          <textarea
            name="item_description"
            value={formData.item_description || ""}
            onChange={handleChange}
            className="textarea textarea-bordered w-full"
            required
          />
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-primary w-full">
          Update Product
        </button>
      </form>
    </div>
    </>
  );
};

export default VendorUpdateProduct;

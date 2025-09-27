import React, { useEffect, useState } from "react";
import useAxiosPublic from "../hooks/useAxiosPublic";
import ProductSectionCard from "../components/ProductSectionCard";

const ProductSection = () => {
  const axiosPublic = useAxiosPublic();
  const [products, setProducts] = useState([]);
  useEffect(() => {
    axiosPublic.get("/approved-limited-products").then((res) => {
      setProducts(res.data);
    });
  }, [axiosPublic]);
  console.log(products);
  return (
    <div className="py-[50px]">
      <h2 className="text-3xl font-bold text-center">Highlighted Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 justify-between gap-4 max-w-7xl w-11/12 mx-auto my-[50px] bg-green-50 p-3 rounded-[10px]">
        {products.map((product) => (
          <ProductSectionCard
            key={product._id}
            product={product}
          ></ProductSectionCard>
        ))}
      </div>
    </div>
  );
};

export default ProductSection;

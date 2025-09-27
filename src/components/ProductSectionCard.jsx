import React from "react";
import { Link } from "react-router";

const ProductSectionCard = ({ product }) => {
  console.log(product);
  const { image_url, market_name, updated_at, _id } = product;
  return (
    <div className="card bg-base-100 max-w-96 shadow-sm">
      <figure className="px-10 pt-10">
        <img src={image_url} alt="product" className="rounded-xl" />
      </figure>
      <div className="card-body items-center text-center">
        <h2 className="card-title">{market_name}</h2>
        <p>{updated_at.split("T")[0]}</p>
        <div className="card-actions">
          <Link to={`/products/${_id}`} className="btn btn-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductSectionCard;

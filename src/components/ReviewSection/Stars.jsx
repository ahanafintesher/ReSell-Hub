"use client";
import React from "react";
import dynamic from "next/dynamic";
const Rating = dynamic(
  () => import("react-simple-star-rating").then((mod) => mod.Rating),
  { ssr: false }
);

const Stars = ({ rating }) => {
  const starRating = Number(rating?.averageRating ?? rating?.avarageRating ?? (typeof rating === "number" ? rating : 0));
  return (
    <div className="flex items-center gap-2">
      <Rating
        initialValue={starRating}
        readonly
        allowFraction
        size={20}
        SVGstyle={{ display: "inline-block" }}
      />
      <span className="text-sm font-semibold text-gray-700">
        {starRating > 0 ? starRating.toFixed(1) : "No ratings yet"}
      </span>
    </div>
  );
};

export default Stars;

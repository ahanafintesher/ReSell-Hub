"use client";
import React from "react";
import dynamic from "next/dynamic";
const Rating = dynamic(
  () => import("react-simple-star-rating").then((mod) => mod.Rating),
  { ssr: false }
);

const Stars = ({ rating }) => {
  const starRating = rating.avarageRating;
  return (
    <div>
      <p>Overall Rating: {starRating}</p>
      <Rating
        initialValue={starRating}
        readonly
        allowFraction
        size={24}
        SVGstyle={{ display: "inline-block" }}
      />
    </div>
  );
};

export default Stars;

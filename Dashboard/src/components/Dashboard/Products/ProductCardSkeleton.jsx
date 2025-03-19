import React from "react";

const ProductCardSkeleton = () => {
  return (
    <div className="relative border rounded-lg shadow-md hover:shadow-lg transition z-10 bg-white flex flex-col cursor-pointer overflow-visible animate-pulse">
      {/* Skeleton Image */}
      <div className="w-full h-48 bg-gray-300 rounded-t-lg"></div>

      {/* Skeleton Content */}
      <div className="flex flex-col p-4 gap-3">
        <div className="flex justify-between items-center relative">
          {/* Product Name Skeleton */}
          <div className="h-6 w-3/5 bg-gray-300 rounded"></div>

          {/* Three Dot Menu Skeleton */}
          <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
        </div>

        {/* Price Skeleton */}
        <div className="h-4 w-2/5 bg-gray-300 rounded"></div>

        {/* Category Name Skeleton */}
        <div className="h-4 w-1/2 bg-gray-300 rounded"></div>

        {/* Description Skeleton */}
        <div className="h-3 w-full bg-gray-300 rounded"></div>
        <div className="h-3 w-5/6 bg-gray-300 rounded"></div>
        <div className="h-3 w-4/6 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;

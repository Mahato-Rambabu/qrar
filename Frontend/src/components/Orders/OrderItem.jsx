import React from 'react';

const OrderItem = ({ item, updateQuantity, showQuantityOnly = false }) => {
  // Use discounted price if available, otherwise the original price
  const itemPrice = item.discountedPrice ? item.discountedPrice : item.price;

  return (
    <div className="flex items-center p-3 mb-4 bg-white rounded-lg shadow-sm">
      {/* Product Image */}
      <img
        src={item.img}
        alt={item.name}
        className="w-16 h-16 rounded-md object-cover flex-shrink-0"
        loading="lazy"
      />

      {/* Product Info */}
      <div className="flex flex-col ml-4 flex-1 justify-center">
        <h2 className="text-sm font-bold text-gray-800 ">
          {item.name}
        </h2>
      </div>

      {/* Right Section: Price & Quantity */}
      <div className="flex flex-col items-end justify-center">
        {/* Price Display */}
        {item.discountedPrice ? (
          <div className="text-right">
            <span className="text-sm text-gray-400 line-through mr-2">
              ₹{item.price.toFixed(2)}
            </span>
            <span className="font-bold text-gray-800 text-md mb-2">
              ₹{item.discountedPrice.toFixed(2)}
            </span>
          </div>
        ) : (
          <p className="font-bold text-gray-800 text-md mb-2">
            ₹{item.price.toFixed(2)}
          </p>
        )}

        {/* Quantity Controller */}
        {!showQuantityOnly && (
          <div className="flex items-center mt-2 space-x-2">
            <button
              onClick={() => updateQuantity(item._id, 'decrement')}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-base font-bold"
            >
              –
            </button>
            <span className="w-4 text-center text-sm font-semibold text-gray-800">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item._id, 'increment')}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-base font-bold"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderItem;

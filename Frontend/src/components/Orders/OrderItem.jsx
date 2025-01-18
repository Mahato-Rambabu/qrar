import React from 'react';

const OrderItem = ({ item, updateQuantity, showQuantityOnly = false }) => {
  return (
    <div className="flex items-center justify-between p-3 mb-4 bg-white rounded-md shadow-sm">
      {/* Product Image */}
      <img
        src={item.img}
        alt={item.name}
        className="w-16 h-16 rounded-md object-cover"
        loading="lazy"
      />

      {/* Product Details */}
      <div className="flex-1 ml-3">
        <h2 className="font-semibold text-sm">{item.name}</h2>
      </div>

      {/* Quantity Controller */}
      {!showQuantityOnly && (
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => updateQuantity(item._id, 'decrement')}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 text-lg text-pink-500 rounded-l-lg"
          >
            -
          </button>
          <span className="w-8 h-8 flex items-center justify-center bg-white text-sm font-medium">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item._id, 'increment')}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 text-lg text-pink-500 rounded-r-lg"
          >
            +
          </button>
        </div>
      )}

      {/* Price */}
      <div className="ml-4 text-sm font-bold text-gray-800">
        ₹{item.price * item.quantity}
      </div>
    </div>
  );
};

export default OrderItem;

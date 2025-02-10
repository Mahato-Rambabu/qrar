import React, { useState, memo } from 'react';
import { useCart } from '@context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProductGrid = memo(({ products = [] }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const getProductQuantity = (productId) => {
    const product = cartItems.find((item) => item._id === productId);
    return product ? product.quantity : 0;
  };

  const handleOrderClick = (product) => {
    addToCart(product);
  };

  const handleIncrement = (productId) => {
    updateQuantity(productId, 'increment');
  };

  const handleDecrement = (productId) => {
    updateQuantity(productId, 'decrement');
  };

  return (
    <>
      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const quantity = getProductQuantity(product._id);
          return (
            <div
              key={product._id}
              className="flex flex-col rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="relative">
                <img
                  src={product.img || 'https://via.placeholder.com/150'}
                  alt={product.name}
                  className="w-full h-[9.2rem] object-cover rounded-xl"
                  loading="lazy"
                />
                {/* Quantity controls overlay on the product card */}
                <div
                  className="absolute bottom-[-14px] left-1/2 transform -translate-x-1/2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {quantity === 0 ? (
                    <button
                      className="bg-gray-100 px-4 py-[3px] rounded-xl shadow-sm shadow-gray-500 text-black text-sm font-semibold flex items-center justify-center whitespace-nowrap"
                      onClick={() => handleOrderClick(product)}
                    >
                      Add +
                    </button>
                  ) : (
                    <div className="bg-white flex items-center justify-between px-2 py-1 rounded-lg shadow-sm shadow-gray-500 w-auto">
                      <button
                        className="text-black text-lg px-2 leading-none"
                        onClick={() => handleDecrement(product._id)}
                      >
                        −
                      </button>
                      <span className="text-black font-semibold text-sm w-6 text-center">
                        {quantity}
                      </span>
                      <button
                        className="text-black text-lg px-2 leading-none"
                        onClick={() => handleIncrement(product._id)}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 px-2">
                <p className="text-[12px] font-bold line-clamp-2">{product.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{product.description}</p>
                <p className="font-bold text-[12px] py-2">₹{product.price}.00</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              className="bg-gray-100 rounded-t-3xl w-full h-[80vh] flex flex-col relative"
              initial={{ y: '100%' }}
              animate={{ y: '0' }}
              exit={{ y: '100%' }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.3}
              onDragEnd={(event, info) => {
                if (info.offset.y > 100) {
                  setSelectedProduct(null);
                }
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-3 right-3 text-white bg-gray-400 rounded-full w-6 h-6 flex items-center justify-center text-2xl z-10"
                onClick={() => setSelectedProduct(null)}
              >
                ×
              </button>

              <div className="w-full h-[50%]">
                <img
                  src={selectedProduct.img || 'https://via.placeholder.com/150'}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover rounded-t-3xl"
                />
              </div>

              <div className="flex-1 overflow-auto px-3 mt-3 pb-24">
                <h2 className="text-lg font-bold">{selectedProduct.name}</h2>
                <p className=" text-lg mt-2 ">{selectedProduct.description}</p>
              </div>

              {/* Bottom Section: Price & Quantity - Fixed at bottom */}
              <div className="absolute bottom-0 left-0 right-0 px-3 pb-10 flex justify-between items-center border-t bg-gray-100">
                <p className="font-bold text-3xl relative top-4">₹{selectedProduct.price}.00</p>
                {getProductQuantity(selectedProduct._id) === 0 ? (
                  <button
                    className="relative bg-gray-500 px-8 py-3 top-4 rounded-xl shadow-sm text-white font-semibold"
                    onClick={() => handleOrderClick(selectedProduct)}
                  >
                    Add +
                  </button>
                ) : (
                  <div className="relative top-4 bg-white flex items-center justify-between px-4 py-2 rounded-lg shadow-md border border-gray-300">
                    <button
                      className="text-black text-xl flex items-center justify-center w-8 h-8"
                      onClick={() => handleDecrement(selectedProduct._id)}
                    >
                      −
                    </button>
                    <span className="text-black font-semibold text-xl mx-2">
                      {getProductQuantity(selectedProduct._id)}
                    </span>
                    <button
                      className="text-black text-xl flex items-center justify-center w-8 h-8"
                      onClick={() => handleIncrement(selectedProduct._id)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default ProductGrid;


import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';

const OfferModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [targetType, setTargetType] = useState(initialData?.targetType || 'all');
  const [targetId, setTargetId] = useState(initialData?.targetId || '');
  const [discountPercentage, setDiscountPercentage] = useState(initialData?.discountPercentage || '');
  const [activationTime, setActivationTime] = useState(
    initialData?.activationTime ? initialData.activationTime.substring(0, 16) : ''
  );
  const [expirationTime, setExpirationTime] = useState(
    initialData?.expirationTime ? initialData.expirationTime.substring(0, 16) : ''
  );
  const [status, setStatus] = useState(initialData?.status ?? true);
  const [options, setOptions] = useState([]); // Stores fetched products/categories
  const [loading, setLoading] = useState(false);

  // Fetch Products or Categories based on targetType
  const fetchOptions = useCallback(async () => {
    if (targetType === 'all') {
      setOptions([]);
      return;
    }
  
    setLoading(true);
    try {
      const endpoint = targetType === 'product' ? '/products/all' : '/categories';
      const response = await axiosInstance.get(endpoint);
  
      // Extract products array if the target type is 'product'
      if (targetType === 'product' && response.data?.products) {
        setOptions(response.data.products); // Extract products array
      } else if (targetType === 'category' && Array.isArray(response.data)) {
        setOptions(response.data);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error(`Failed to fetch ${targetType}:`, error);
      setOptions([]);
    }
    setLoading(false);
  }, [targetType]);
  

  useEffect(() => {
    fetchOptions();
  }, [targetType, fetchOptions]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      title,
      targetType,
      discountPercentage,
      activationTime,
      expirationTime: expirationTime || null,
      status,
    };
    if (targetType !== 'all') {
      data.targetId = targetId;
    }
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 w-full max-w-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {initialData ? 'Edit Offer' : 'Add New Offer'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              required
            />
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-sm font-medium">Target Type</label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              <option value="all">All Products</option>
              <option value="product">Product</option>
              <option value="category">Category</option>
            </select>
          </div>

          {/* Target Selection */}
          {targetType !== 'all' && (
            <div>
              <label className="block text-sm font-medium">
                Select {targetType === 'product' ? 'Product' : 'Category'}
              </label>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : (
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select an option</option>
                  {options.length > 0 ? (
                    options.map((item) => (
                      <option key={item._id} value={item._id}>
                         {targetType === 'category' ? item.catName : item.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No options available</option>
                  )}
                </select>
              )}
            </div>
          )}

          {/* Discount Percentage */}
          <div>
            <label className="block text-sm font-medium">Discount Percentage</label>
            <input
              type="number"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              required
            />
          </div>

          {/* Activation Time */}
          <div>
            <label className="block text-sm font-medium">Activation Time</label>
            <input
              type="datetime-local"
              value={activationTime}
              onChange={(e) => setActivationTime(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              required
            />
          </div>

          {/* Expiration Time */}
          <div>
            <label className="block text-sm font-medium">Expiration Time</label>
            <input
              type="datetime-local"
              value={expirationTime}
              onChange={(e) => setExpirationTime(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          {/* Status Toggle */}
          <div className="flex items-center">
            <label className="mr-2 text-sm font-medium">Status:</label>
            <input
              type="checkbox"
              checked={status}
              onChange={() => setStatus(!status)}
              className="mr-2"
            />
            <span className="text-sm">{status ? 'Active' : 'Inactive'}</span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {initialData ? 'Update Offer' : 'Create Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferModal;

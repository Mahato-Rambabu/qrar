// OfferModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setTargetType(initialData.targetType || 'all');
      setTargetId(initialData.targetId || '');
      setDiscountPercentage(initialData.discountPercentage || '');
      setActivationTime(
        initialData.activationTime ? initialData.activationTime.substring(0, 16) : ''
      );
      setExpirationTime(
        initialData.expirationTime ? initialData.expirationTime.substring(0, 16) : ''
      );
      setStatus(initialData.status ?? true);
    } else {
      setTitle('');
      setTargetType('all');
      setTargetId('');
      setDiscountPercentage('');
      setActivationTime('');
      setExpirationTime('');
      setStatus(true);
    }
  }, [initialData, isOpen]);

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
    // Only include targetId if not an "all" offer.
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
          {/* Target ID (only if product or category) */}
          {targetType !== 'all' && (
            <div>
              <label className="block text-sm font-medium">Target ID</label>
              <input
                type="text"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
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
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
              <input
                type="checkbox"
                checked={status}
                onChange={() => setStatus(!status)}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
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

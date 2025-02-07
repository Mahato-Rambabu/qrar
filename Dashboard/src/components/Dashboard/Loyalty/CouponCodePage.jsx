import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';

const CouponCodesPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state and form fields for add/edit coupon
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [couponType, setCouponType] = useState(''); // "limited-users" or "time-limited"
  const [limit, setLimit] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [discountType, setDiscountType] = useState(''); // "product" or "total-order"
  const [discountValue, setDiscountValue] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/coupon/all');
      setCoupons(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch coupons.');
    } finally {
      setLoading(false);
    }
  };

  const openModalForNew = () => {
    setEditingCoupon(null);
    setName('');
    setCode('');
    setCouponType('');
    setLimit('');
    setExpiryDate('');
    setDiscountType('');
    setDiscountValue('');
    setModalOpen(true);
  };

  const openModalForEdit = (coupon) => {
    setEditingCoupon(coupon);
    setName(coupon.name);
    setCode(coupon.code);
    setCouponType(coupon.type);
    setLimit(coupon.limit || '');
    // Format expiryDate to YYYY-MM-DD if it exists
    setExpiryDate(coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '');
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Build payload; note that if type is 'limited-users', limit is required; if time-limited, expiryDate is required.
    const payload = {
      name,
      code,
      type: couponType,
      limit: couponType === 'limited-users' ? limit : null,
      expiryDate: couponType === 'time-limited' ? expiryDate : null,
      discountType,
      discountValue: Number(discountValue)
    };

    try {
      if (editingCoupon) {
        // Update coupon
        await axiosInstance.put(`/coupon/${editingCoupon._id}`, payload);
      } else {
        // Create new coupon
        await axiosInstance.post('/coupon', payload);
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      setError('Failed to submit coupon.');
    }
  };

  const handleToggle = async (id) => {
    try {
      await axiosInstance.put(`/coupon/toggle/${id}`);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      setError('Failed to toggle coupon.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/coupon/${id}`);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      setError('Failed to delete coupon.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Coupon Codes</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button 
        onClick={openModalForNew}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add New Coupon
      </button>
      {loading ? (
        <p>Loading coupons...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="border rounded p-4 shadow-sm">
              <h2 className="text-xl font-semibold">{coupon.name}</h2>
              <p><strong>Code:</strong> {coupon.code}</p>
              <p><strong>Type:</strong> {coupon.type}</p>
              {coupon.type === 'limited-users' && <p><strong>Usage Limit:</strong> {coupon.limit}</p>}
              {coupon.type === 'time-limited' && (
                <p>
                  <strong>Expiry Date:</strong> {new Date(coupon.expiryDate).toLocaleDateString()}
                </p>
              )}
              <p><strong>Discount Type:</strong> {coupon.discountType}</p>
              <p><strong>Discount Value:</strong> {coupon.discountValue}</p>
              <p><strong>Status:</strong> {coupon.isActive ? 'Active' : 'Inactive'}</p>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => openModalForEdit(coupon)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleToggle(coupon._id)}
                  className={`px-3 py-1 rounded ${coupon.isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'}`}
                >
                  {coupon.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  onClick={() => handleDelete(coupon._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for adding/editing a coupon */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setModalOpen(false)}
          ></div>
          {/* Modal Content */}
          <div className="relative bg-white p-6 rounded shadow-md z-10 w-11/12 max-w-lg">
            <h2 className="text-2xl font-bold mb-4">
              {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full border rounded px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Code</label>
                <input 
                  type="text" 
                  className="w-full border rounded px-3 py-2"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Type</label>
                <select 
                  className="w-full border rounded px-3 py-2"
                  value={couponType}
                  onChange={(e) => setCouponType(e.target.value)}
                  required
                >
                  <option value="">Select type</option>
                  <option value="limited-users">Limited Users</option>
                  <option value="time-limited">Time Limited</option>
                </select>
              </div>
              {couponType === 'limited-users' && (
                <div className="mb-4">
                  <label className="block mb-1">Usage Limit</label>
                  <input 
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    required
                  />
                </div>
              )}
              {couponType === 'time-limited' && (
                <div className="mb-4">
                  <label className="block mb-1">Expiry Date</label>
                  <input 
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block mb-1">Discount Type</label>
                <select 
                  className="w-full border rounded px-3 py-2"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  required
                >
                  <option value="">Select discount type</option>
                  <option value="product">Product</option>
                  <option value="total-order">Total Order</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Discount Value</label>
                <input 
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="mr-2 px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  {editingCoupon ? 'Update Coupon' : 'Add Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponCodesPage;

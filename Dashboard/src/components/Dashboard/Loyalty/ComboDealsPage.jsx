import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';

const ComboDealsPage = () => {
  const [comboDeals, setComboDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state and form fields for add/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [title, setTitle] = useState('');
  const [dealType, setDealType] = useState('');
  // Fields for product-product type
  const [product1, setProduct1] = useState('');
  const [product2, setProduct2] = useState('');
  // Fields for category-category type
  const [category1, setCategory1] = useState('');
  const [category2, setCategory2] = useState('');
  // Fields for product-category type
  const [product, setProduct] = useState('');
  const [category, setCategory] = useState('');
  // Combo offer fields (offer details)
  const [offerType, setOfferType] = useState(''); // e.g., "free", "discount", "fixed-price"
  const [offerValue, setOfferValue] = useState(''); // number value
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchComboDeals();
  }, []);

  const fetchComboDeals = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/combo-deals/all');
      setComboDeals(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching combo deals:', err);
      setError('Failed to fetch combo deals.');
    } finally {
      setLoading(false);
    }
  };

  const openModalForNew = () => {
    setEditingDeal(null);
    setTitle('');
    setDealType('');
    setProduct1('');
    setProduct2('');
    setCategory1('');
    setCategory2('');
    setProduct('');
    setCategory('');
    setOfferType('');
    setOfferValue('');
    setImageFile(null);
    setModalOpen(true);
  };

  const openModalForEdit = (deal) => {
    setEditingDeal(deal);
    setTitle(deal.title);
    setDealType(deal.dealType);
    // Pre-fill fields based on deal type.
    if (deal.dealType === 'product-product') {
      setProduct1(deal.product1 || '');
      setProduct2(deal.product2 || '');
    } else if (deal.dealType === 'category-category') {
      setCategory1(deal.category1 || '');
      setCategory2(deal.category2 || '');
    } else if (deal.dealType === 'product-category') {
      setProduct(deal.product || '');
      setCategory(deal.category || '');
    }
    // Assuming comboOffer is stored as an object with fields type and value.
    setOfferType(deal.comboOffer?.type || '');
    setOfferValue(deal.comboOffer?.value || '');
    // Image editing: file input cannot be pre-filled. You might show the current image instead.
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Build comboOffer object and stringify it
    const comboOffer = JSON.stringify({
      type: offerType,
      value: Number(offerValue)
    });

    const formData = new FormData();
    formData.append('title', title);
    formData.append('dealType', dealType);
    formData.append('comboOffer', comboOffer);
    // Append image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }
    // Based on dealType, append appropriate fields
    if (dealType === 'product-product') {
      formData.append('product1', product1);
      formData.append('product2', product2);
    } else if (dealType === 'category-category') {
      formData.append('category1', category1);
      formData.append('category2', category2);
    } else if (dealType === 'product-category') {
      formData.append('product', product);
      formData.append('category', category);
    }

    try {
      if (editingDeal) {
        // Update existing combo deal
        await axiosInstance.put(`/combo-deals/${editingDeal._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create new combo deal
        await axiosInstance.post('/combo-deals', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setModalOpen(false);
      fetchComboDeals();
    } catch (err) {
      console.error('Error submitting combo deal:', err);
      setError('Failed to submit combo deal.');
    }
  };

  const handleToggle = async (id) => {
    try {
      await axiosInstance.put(`/combo-deals/toggle/${id}`);
      fetchComboDeals();
    } catch (err) {
      console.error('Error toggling combo deal:', err);
      setError('Failed to toggle combo deal.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/combo-deals/${id}`);
      fetchComboDeals();
    } catch (err) {
      console.error('Error deleting combo deal:', err);
      setError('Failed to delete combo deal.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Combo Deals Management</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={openModalForNew}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add New Combo Deal
      </button>

      {loading ? (
        <p>Loading combo deals...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {comboDeals.map((deal) => (
            <div key={deal._id} className="border rounded p-4 shadow-sm">
              <h2 className="text-xl font-semibold">{deal.title}</h2>
              {deal.image && (
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full object-cover rounded mb-2"
                  style={{ aspectRatio: '16/9' }}
                />
              )}
              <p><strong>Deal Type:</strong> {deal.dealType}</p>
              <p>
                <strong>Offer:</strong> {deal.comboOffer && `Type: ${deal.comboOffer.type}, Value: ${deal.comboOffer.value}`}
              </p>
              {/* Optionally display fields based on dealType */}
              {deal.dealType === 'product-product' && (
                <p>
                  <strong>Products:</strong> {deal.product1} &amp; {deal.product2}
                </p>
              )}
              {deal.dealType === 'category-category' && (
                <p>
                  <strong>Categories:</strong> {deal.category1} &amp; {deal.category2}
                </p>
              )}
              {deal.dealType === 'product-category' && (
                <p>
                  <strong>Product:</strong> {deal.product} <strong>Category:</strong> {deal.category}
                </p>
              )}
              <p><strong>Status:</strong> {deal.isActive ? 'Active' : 'Inactive'}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => openModalForEdit(deal)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggle(deal._id)}
                  className={`px-3 py-1 rounded ${deal.isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'}`}
                >
                  {deal.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(deal._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for adding/editing a combo deal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Modal Backdrop */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setModalOpen(false)}
          ></div>
          {/* Modal Content */}
          <div className="relative bg-white p-6 rounded shadow-md z-10 w-11/12 max-w-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4">
              {editingDeal ? 'Edit Combo Deal' : 'Add New Combo Deal'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Title</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Deal Type</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={dealType}
                  onChange={(e) => setDealType(e.target.value)}
                  required
                >
                  <option value="">Select deal type</option>
                  <option value="product-product">Product - Product</option>
                  <option value="category-category">Category - Category</option>
                  <option value="product-category">Product - Category</option>
                </select>
              </div>
              {/* Conditionally render fields based on dealType */}
              {dealType === 'product-product' && (
                <>
                  <div className="mb-4">
                    <label className="block mb-1">Product 1</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={product1}
                      onChange={(e) => setProduct1(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1">Product 2</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={product2}
                      onChange={(e) => setProduct2(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              {dealType === 'category-category' && (
                <>
                  <div className="mb-4">
                    <label className="block mb-1">Category 1</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={category1}
                      onChange={(e) => setCategory1(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1">Category 2</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={category2}
                      onChange={(e) => setCategory2(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              {dealType === 'product-category' && (
                <>
                  <div className="mb-4">
                    <label className="block mb-1">Product</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1">Category</label>
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              <div className="mb-4">
                <label className="block mb-1">Combo Offer Type</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={offerType}
                  onChange={(e) => setOfferType(e.target.value)}
                  required
                >
                  <option value="">Select offer type</option>
                  <option value="free">Free</option>
                  <option value="discount">Discount</option>
                  <option value="fixed-price">Fixed Price</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Combo Offer Value</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={offerValue}
                  onChange={(e) => setOfferValue(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  // required only for new deals (editingDeal is null)
                  required={!editingDeal}
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
                  {editingDeal ? 'Update Deal' : 'Add Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboDealsPage;

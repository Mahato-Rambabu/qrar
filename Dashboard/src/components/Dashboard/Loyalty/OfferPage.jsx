import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state and form fields
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imgFile, setImgFile] = useState(null);
  const [applicableDays, setApplicableDays] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [minBillAmount, setMinBillAmount] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [linkedProducts, setLinkedProducts] = useState('');
  const [linkedCategories, setLinkedCategories] = useState('');
  const [priority, setPriority] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/offer/all');
      setOffers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError('Failed to fetch offers.');
    } finally {
      setLoading(false);
    }
  };

  const openModalForNew = () => {
    setEditingOffer(null);
    setTitle('');
    setDescription('');
    setImgFile(null);
    setApplicableDays('');
    setStartTime('');
    setEndTime('');
    setMinBillAmount('');
    setDiscountPercentage('');
    setLinkedProducts('');
    setLinkedCategories('');
    setPriority(0);
    setIsActive(true);
    setModalOpen(true);
  };

  const openModalForEdit = (offer) => {
    setEditingOffer(offer);
    setTitle(offer.title);
    setDescription(offer.description || '');
    // Note: File inputs cannot be pre-filled; we assume image editing is optional.
    setApplicableDays(offer.applicableDays ? offer.applicableDays.join(', ') : '');
    setStartTime(offer.startTime);
    setEndTime(offer.endTime);
    setMinBillAmount(offer.discountCondition?.minBillAmount || '');
    setDiscountPercentage(offer.discountCondition?.discountPercentage || '');
    setLinkedProducts(offer.linkedProducts ? offer.linkedProducts.join(', ') : '');
    setLinkedCategories(offer.linkedCategories ? offer.linkedCategories.join(', ') : '');
    setPriority(offer.priority || 0);
    setIsActive(offer.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Build form data for image upload and other fields
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (imgFile) {
      formData.append('img', imgFile);
    }
    // For applicableDays, send the string; the backend will wrap it in an array if needed
    formData.append('applicableDays', applicableDays);
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);
    // Build discountCondition object and stringify it
    const discountObj = {
      minBillAmount: Number(minBillAmount),
      discountPercentage: Number(discountPercentage)
    };
    formData.append('discountCondition', JSON.stringify(discountObj));
    // For linked products/categories, if provided as comma-separated string, send each entry
    if (linkedProducts.trim() !== '') {
      linkedProducts.split(',').forEach(prod => formData.append('linkedProducts', prod.trim()));
    }
    if (linkedCategories.trim() !== '') {
      linkedCategories.split(',').forEach(cat => formData.append('linkedCategories', cat.trim()));
    }
    formData.append('priority', priority);
    formData.append('isActive', isActive);

    try {
      if (editingOffer) {
        // Update existing offer
        await axiosInstance.put(`/offer/${editingOffer._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create new offer
        await axiosInstance.post('/offer', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setModalOpen(false);
      fetchOffers();
    } catch (err) {
      console.error('Error submitting offer:', err);
      setError('Failed to submit offer.');
    }
  };

  const handleToggleOffer = async (offerId) => {
    try {
      await axiosInstance.put(`/offer/toggle/${offerId}`);
      fetchOffers();
    } catch (err) {
      console.error('Error toggling offer:', err);
    }
  };

  const handleDeleteOffer = async (offerId) => {
    try {
      await axiosInstance.delete(`/offer/${offerId}`);
      fetchOffers();
    } catch (err) {
      console.error('Error deleting offer:', err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Offers Management</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button 
        onClick={openModalForNew}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add New Offer
      </button>
      {loading ? (
        <p>Loading offers...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {offers.map((offer) => (
            <div key={offer._id} className="border rounded p-4 shadow-sm">
              <img 
                src={offer.img} 
                alt={offer.title} 
                className="w-full object-cover rounded mb-2" 
                style={{ aspectRatio: '16/9' }}
              />
              <h2 className="text-xl font-semibold">{offer.title}</h2>
              {offer.description && <p>{offer.description}</p>}
              <p><strong>Active Days:</strong> {offer.applicableDays.join(', ')}</p>
              <p><strong>Time:</strong> {offer.startTime} - {offer.endTime}</p>
              <p>
                <strong>Discount:</strong> If bill &gt; {offer.discountCondition.minBillAmount} then {offer.discountCondition.discountPercentage}% off
              </p>
              <p><strong>Priority:</strong> {offer.priority}</p>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => openModalForEdit(offer)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleToggleOffer(offer._id)}
                  className={`px-3 py-1 rounded ${offer.isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'}`}
                >
                  {offer.isActive ? 'Active' : 'Activate'}
                </button>
                <button 
                  onClick={() => handleDeleteOffer(offer._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Adding/Editing Offer */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black opacity-50" 
            onClick={() => setModalOpen(false)}
          ></div>
          <div className="relative bg-white p-6 rounded shadow-md z-10 w-11/12 max-w-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4">
              {editingOffer ? 'Edit Offer' : 'Add New Offer'}
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
                <label className="block mb-1">Description</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Image</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImgFile(e.target.files[0])}
                  required={!editingOffer}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Applicable Days (comma separated)</label>
                <input 
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={applicableDays}
                  onChange={(e) => setApplicableDays(e.target.value)}
                />
              </div>
              <div className="mb-4 flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1">Start Time</label>
                  <input 
                    type="time"
                    className="w-full border rounded px-3 py-2"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1">End Time</label>
                  <input 
                    type="time"
                    className="w-full border rounded px-3 py-2"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-4 flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1">Min Bill Amount</label>
                  <input 
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={minBillAmount}
                    onChange={(e) => setMinBillAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1">Discount Percentage</label>
                  <input 
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Linked Products (comma separated IDs)</label>
                <input 
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={linkedProducts}
                  onChange={(e) => setLinkedProducts(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Linked Categories (comma separated IDs)</label>
                <input 
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={linkedCategories}
                  onChange={(e) => setLinkedCategories(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Priority</label>
                <input 
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
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
                  {editingOffer ? 'Update Offer' : 'Add Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersPage;

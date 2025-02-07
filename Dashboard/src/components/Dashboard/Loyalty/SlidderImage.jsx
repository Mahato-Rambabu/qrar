import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';

const SliderImagePage = () => {
  const [loyaltyEntries, setLoyaltyEntries] = useState([]);
  const [offers, setOffers] = useState([]); // State to hold available offers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state and form fields
  const [modalOpen, setModalOpen] = useState(false);
  const [offer, setOffer] = useState('');         // Selected Offer ObjectId
  const [imageFile, setImageFile] = useState(null);

  // Fetch loyalty program entries and offers on component mount
  useEffect(() => {
    fetchLoyaltyEntries();
    fetchOffers();
  }, []);

  const fetchLoyaltyEntries = async () => {
    try {
      setLoading(true);
      // This endpoint uses your authMiddleware to inject restaurantId.
      const response = await axiosInstance.get('/updatedImageSlider/all');
      setLoyaltyEntries(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching loyalty entries:', err);
      setError('Failed to fetch loyalty program entries.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await axiosInstance.get('/offer/all');
      setOffers(response.data);
    } catch (err) {
      console.error('Error fetching offers:', err);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!imageFile || !offer) return; // Ensure required fields are present
    const formData = new FormData();
    formData.append('img', imageFile);
    formData.append('offer', offer);

    try {
      await axiosInstance.post('/updatedImageSlider', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setModalOpen(false);
      setOffer('');
      setImageFile(null);
      fetchLoyaltyEntries();
    } catch (err) {
      console.error('Error adding loyalty entry:', err);
      setError('Failed to add loyalty entry.');
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await axiosInstance.delete(`/updatedImageSlider/${id}`);
      fetchLoyaltyEntries();
    } catch (err) {
      console.error('Error deleting loyalty entry:', err);
      setError('Failed to delete loyalty entry.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Loyalty Program</h1>
      <p className="mb-4 text-gray-600">
        Manage your loyalty program entries. Each entry attaches an offer.
      </p>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={() => setModalOpen(true)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Add New Loyalty Entry
      </button>

      {loading ? (
        <p>Loading entries...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {loyaltyEntries.map((entry) => (
            <div
              key={entry._id}
              className="border rounded p-4 shadow-sm flex flex-col items-center"
            >
              <img
                src={entry.img}
                alt="Loyalty Program"
                className="w-full object-cover rounded mb-2"
                style={{ aspectRatio: '16/9' }}  // Adjust aspect ratio as needed
              />
              <p className="mb-2">
                <strong>Offer:</strong> {entry.offer}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteEntry(entry._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
                {/* Optionally, add an edit button here */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for adding a new loyalty program entry */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Modal Backdrop */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setModalOpen(false)}
          ></div>
          {/* Modal Content */}
          <div className="relative bg-white p-6 rounded shadow-md z-10 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Loyalty Entry</h2>
            <form onSubmit={handleAddEntry}>
              <div className="mb-4">
                <label className="block mb-1">Offer</label>
                <select
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select an Offer</option>
                  {offers.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.title} ({o.startTime} - {o.endTime})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
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
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SliderImagePage;

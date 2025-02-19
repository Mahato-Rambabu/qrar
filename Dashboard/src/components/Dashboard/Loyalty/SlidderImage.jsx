import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import { Plus, Trash2 } from 'lucide-react';
import { CircularProgress } from '@mui/material';

const SliderImagePage = ({ loadingState }) => {
  const [loyaltyEntries, setLoyaltyEntries] = useState([]);
  const [offers, setOffers] = useState([]); // State to hold available offers
  const [loading, setLoading] = useState(true); // For fetching entries
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false); // For submission loading

  // Modal state and form fields
  const [modalOpen, setModalOpen] = useState(false);
  const [offer, setOffer] = useState(''); // Selected Offer ObjectId (optional)
  const [imageFile, setImageFile] = useState(null);

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
    if (!imageFile) return; // Only image is required now
    const formData = new FormData();
    formData.append('img', imageFile);
    // Append the offer only if provided
    if (offer) {
      formData.append('offer', offer);
    }

    try {
      setSubmitting(true);
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
    } finally {
      setSubmitting(false);
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
      {/* Header */}
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Slider Images</h1>
          <p className="mb-4 text-gray-600">
            Manage your Slider Image
          </p>
          {error && <p className="text-red-500 mb-4">{error}</p>}
        </div>
        <div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-400 text-white px-4 py-2 rounded-full hover:bg-blue-700 flex flex-row items-center gap-2"
          >
            <Plus size={16} />
            Add Image
          </button>
        </div>
      </div>

      {/* Loading and Entries */}
      {loading ? (
        <div className="flex justify-center py-6">
          <CircularProgress />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-flow-col auto-cols-max gap-4 px-2 pb-4">
            {loyaltyEntries.map((entry) => {
              // Look up the offer title using the offer ID attached in the entry
              const attachedOffer = offers.find((o) => o._id === entry.offer);
              const offerTitle = attachedOffer ? attachedOffer.title : "No offer attached";

              return (
                <div
                  key={entry._id}
                  className="shrink-0 border bg-white rounded-lg shadow-lg flex flex-col items-center snap-start max-w-[300px] w-full"
                >
                  <div className="rounded-t-lg overflow-hidden mb-2 w-full">
                    <img
                      src={entry.img}
                      alt="Loyalty Program"
                      className="w-full h-48 object-contain bg-gray-100"
                    />
                  </div>
                  <div className="w-full px-3 py-2 text-center flex justify-between">
                    <p className="text-sm font-medium truncate">
                      <strong>Offer:</strong> {offerTitle}
                    </p>
                    <button
                      onClick={() => handleDeleteEntry(entry._id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      disabled={loadingState[entry._id]}
                    >
                      {loadingState[entry._id] ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
          <div className="relative bg-white p-6 rounded shadow-lg z-10 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Slidder Image</h2>
            <form onSubmit={handleAddEntry}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Offer (Optional)
                </label>
                <select
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">No offer attached</option>
                  {offers.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.title} ({o.startTime} - {o.endTime})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Image</label>
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
                  className="px-4 py-2 bg-blue-400 text-white rounded flex items-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Add Entry"
                  )}
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

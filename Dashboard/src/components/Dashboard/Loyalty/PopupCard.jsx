import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import { Plus } from 'lucide-react';
import PopCard from './PopupCardUI';
import { CircularProgress } from '@mui/material';

const PopCardsPage = () => {
  const [popCards, setPopCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStates, setLoadingStates] = useState({}); // Loading state per card

  useEffect(() => {
    fetchPopCards();
  }, []);

  const fetchPopCards = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/popups');
      setPopCards(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching pop cards:', err);
      setError('Failed to fetch pop cards.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (cardId, isActive) => {
    setLoadingStates((prev) => ({ ...prev, [cardId]: true }));
    try {
      await axiosInstance.put(`/popups/toggle/${cardId}`);
      setPopCards((prevCards) =>
        prevCards.map((card) =>
          card._id === cardId ? { ...card, isActive: !isActive } : card
        )
      );
    } catch (err) {
      console.error('Error toggling active state:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [cardId]: false }));
    }
  };

  const handleDelete = async (cardId) => {
    setLoadingStates((prev) => ({ ...prev, [cardId]: true }));
    try {
      await axiosInstance.delete(`/popups/${cardId}`);
      setPopCards((prevCards) => prevCards.filter((card) => card._id !== cardId));
    } catch (err) {
      console.error('Error deleting pop card:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [cardId]: false }));
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newTitle || !newImage) return;
    const formData = new FormData();
    formData.append('name', newTitle);
    formData.append('img', newImage);
    try {
      await axiosInstance.post('/popups', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setModalOpen(false);
      setNewTitle('');
      setNewImage(null);
      fetchPopCards();
    } catch (err) {
      console.error('Error adding pop card:', err);
      setError('Failed to add pop card.');
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Pop Up Cards</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 flex items-center gap-2"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={16} />
          Add Pop up
        </button>
      </div>

      {/* Pop Cards Section */}
      {loading ? (
        <div className="flex justify-center py-6">
          <CircularProgress />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="flex gap-6 min-h-[100%] overflow-x-auto pb-4 scrollbar-hide px-2 snap-x snap-mandatory">
          {popCards.map((card) => (
            <PopCard
              key={card._id}
              card={card}
              onToggle={handleToggleActive}
              onDelete={handleDelete}
              loadingState={loadingStates}
            />
          ))}
        </div>
      )}

      {/* Modal for Adding a New Pop Card */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setModalOpen(false)}></div>
          <div className="relative bg-white p-6 rounded shadow-md z-10 w-11/12 max-w-sm">
            <h2 className="text-xl font-bold mb-4">Add New Pop Card</h2>
            <form onSubmit={handleAddCard}>
              <div className="mb-4">
                <label className="block mb-1 text-sm">Title</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImage(e.target.files[0])}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="mr-2 px-4 py-2 border rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded text-sm"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopCardsPage;

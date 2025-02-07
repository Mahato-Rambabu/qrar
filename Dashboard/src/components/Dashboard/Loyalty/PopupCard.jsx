import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import SliderImagePage from './SlidderImage';

const PopCardsPage = () => {
  const [popCards, setPopCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch all pop cards when the component mounts
  useEffect(() => {
    fetchPopCards();
  }, []);

  const fetchPopCards = async () => {
    try {
      setLoading(true);
      // Use the /popups route as registered in your backend.
      const response = await axiosInstance.get('/popups');
      setPopCards(response.data);
    } catch (err) {
      console.error('Error fetching pop cards:', err);
      setError('Failed to fetch pop cards.');
    } finally {
      setLoading(false);
    }
  };

  // When toggling a card active, only allow activating if it's not already active.
  // The backend will deactivate any other active card.
  const handleToggleActive = async (cardId, isActive) => {
    if (!isActive) {
      try {
        await axiosInstance.put(`/popups/toggle/${cardId}`);
        fetchPopCards();
      } catch (err) {
        console.error('Error toggling active state:', err);
      }
    }
  };

  // Delete a pop card
  const handleDelete = async (cardId) => {
    try {
      await axiosInstance.delete(`/popups/${cardId}`);
      fetchPopCards();
    } catch (err) {
      console.error('Error deleting pop card:', err);
    }
  };

  // Add a new pop card using a modal form
  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newTitle || !newImage) return;
    const formData = new FormData();
    formData.append('name', newTitle);
    formData.append('img', newImage);
    try {
      await axiosInstance.post('/popups', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pop Cards</h1>
      <p className="mb-4 text-gray-600">
        These cards will be displayed on mobile devices. Please upload images that look great on vertical screens.
      </p>
      <button 
         className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
         onClick={() => setModalOpen(true)}
      >
         Add New Pop Card
      </button>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {popCards.map((card) => (
            <div 
              key={card._id} 
              className="border rounded p-4 flex flex-col items-center shadow-sm"
            >
              <img 
                src={card.img} 
                alt={card.name} 
                className="w-full object-cover rounded mb-2"
                style={{ aspectRatio: '9/16' }}  // Ensures the image is vertically oriented
              />
              <h2 className="text-lg font-medium mb-2">{card.name}</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => handleToggleActive(card._id, card.isActive)}
                  className={`px-4 py-2 rounded transition-all duration-300 ${
                    card.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 text-black hover:bg-gray-400'
                  }`}
                >
                  {card.isActive ? 'Active' : 'Make Active'}
                </button>
                <button
                  onClick={() => handleDelete(card._id)}
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for adding a new pop card */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white p-6 rounded shadow-md z-10 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Pop Card</h2>
            <form onSubmit={handleAddCard}>
              <div className="mb-4">
                <label className="block mb-1">Title</label>
                <input 
                  type="text" 
                  className="w-full border rounded px-3 py-2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Image</label>
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
                  className="mr-2 px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div>
        <SliderImagePage />
      </div>
    </div>
  );
};

export default PopCardsPage;

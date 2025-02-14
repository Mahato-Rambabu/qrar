import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import { Plus } from 'lucide-react';
import { CircularProgress } from '@mui/material';
import PopCard from './PopupCardUI';

const PopCardsPage = () => {
  const [popCards, setPopCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStates, setLoadingStates] = useState({}); // Tracks loading state per card

  // EDIT modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCardId, setEditCardId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editImage, setEditImage] = useState(null);

  useEffect(() => {
    fetchPopCards();
  }, []);

  // Fetch all pop cards
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

  // Toggle card active state
  const handleToggleActive = async (cardId, isActive) => {
    setLoadingStates((prev) => ({ ...prev, [cardId]: true }));
    try {
      await axiosInstance.put(`/popups/toggle/${cardId}`);

      // If we are activating a card, un-toggle all others in local state
      if (!isActive) {
        setPopCards((prevCards) =>
          prevCards.map((card) =>
            card._id === cardId
              ? { ...card, isActive: true }
              : { ...card, isActive: false }
          )
        );
      } else {
        // If we are deactivating a card
        setPopCards((prevCards) =>
          prevCards.map((card) =>
            card._id === cardId
              ? { ...card, isActive: false }
              : card
          )
        );
      }
    } catch (err) {
      console.error('Error toggling active state:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [cardId]: false }));
    }
  };

  // Delete card
  const handleDelete = async (cardId) => {
    setLoadingStates((prev) => ({ ...prev, [cardId]: true }));
    try {
      await axiosInstance.delete(`/popups/${cardId}`);
      // Remove card from local state
      setPopCards((prevCards) => prevCards.filter((card) => card._id !== cardId));
    } catch (err) {
      console.error('Error deleting pop card:', err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [cardId]: false }));
    }
  };

  // Add a new pop card
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

  // =====================
  // EDIT LOGIC
  // =====================
  const openEditModal = (card) => {
    setEditCardId(card._id);
    setEditTitle(card.name);
    setEditImage(null); // No default image
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editCardId) return;

    setLoadingStates((prev) => ({ ...prev, [editCardId]: true }));

    try {
      const formData = new FormData();
      formData.append('name', editTitle);
      if (editImage) {
        formData.append('img', editImage);
      }
      // PUT /popups/:id
      await axiosInstance.put(`/popups/${editCardId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Update local state
      setPopCards((prevCards) =>
        prevCards.map((c) =>
          c._id === editCardId
            ? { ...c, name: editTitle, img: editImage ? URL.createObjectURL(editImage) : c.img }
            : c
        )
      );
      setEditModalOpen(false);
    } catch (err) {
      console.error('Error editing pop card:', err);
      setError('Failed to edit pop card.');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [editCardId]: false }));
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Deals You Can't Miss</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 flex items-center gap-2"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={16} />
          Add Pop Up
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <CircularProgress />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        // Horizontal scrolling container
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-2">
          {popCards.map((card) => (
            <PopCard
              key={card._id}
              card={card}
              onToggle={handleToggleActive}
              onDelete={handleDelete}
              loadingState={loadingStates}
              onEditOpen={openEditModal} // pass the function
            />
          ))}
        </div>
      )}

      {/* Modal for Adding a New Pop Card */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setModalOpen(false)}
          />
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

      {/* Modal for Editing an Existing Pop Card */}
      {editModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setEditModalOpen(false)}
          />
          <div className="relative bg-white p-6 rounded shadow-md z-10 w-11/12 max-w-sm">
            <h2 className="text-xl font-bold mb-4">Edit Pop Card</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block mb-1 text-sm">Title</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm">New Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files[0])}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="mr-2 px-4 py-2 border rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded text-sm"
                >
                  Save Changes
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

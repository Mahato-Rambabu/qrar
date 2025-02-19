// PopCardsPage.js
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import { Plus } from 'lucide-react';
import { CircularProgress } from '@mui/material';
import PopCard from './PopupCardUI';
import SliderImagePage from './SlidderImage';

const PopCardsPage = () => {
  const [popCards, setPopCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});

  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCardId, setEditCardId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editImage, setEditImage] = useState(null);

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
          card._id === cardId
            ? { ...card, isActive: !card.isActive }
            : isActive ? card : { ...card, isActive: false }
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

  const openEditModal = (card) => {
    setEditCardId(card._id);
    setEditTitle(card.name);
    setEditImage(null);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editCardId) return;

    setLoadingStates((prev) => ({ ...prev, [editCardId]: true }));

    try {
      const formData = new FormData();
      formData.append('name', editTitle);
      if (editImage) formData.append('img', editImage);

      await axiosInstance.put(`/popups/${editCardId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPopCards((prevCards) =>
        prevCards.map((c) =>
          c._id === editCardId
            ? {
                ...c,
                name: editTitle,
                img: editImage ? URL.createObjectURL(editImage) : c.img
              }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Popup Cards </h1>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-700 flex items-center gap-2"
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
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory px-2">
          {popCards.map((card) => (
            <PopCard
              key={card._id}
              card={card}
              onToggle={handleToggleActive}
              onDelete={handleDelete}
              loadingState={loadingStates}
              onEditOpen={openEditModal}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white p-6 rounded-lg shadow-xl z-10 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Pop Card</h2>
            <form onSubmit={handleAddCard}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Image</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewImage(e.target.files[0])}
                    className="hidden"
                    id="fileInput"
                    required
                  />
                  <label htmlFor="fileInput" className="cursor-pointer text-blue-600 hover:text-blue-700">
                    Choose File
                  </label>
                  {newImage && (
                    <div className="mt-4">
                      <img
                        src={URL.createObjectURL(newImage)}
                        alt="Preview"
                        className="max-h-40 object-contain rounded-lg"
                      />

                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setEditModalOpen(false)} />
          <div className="relative bg-white p-6 rounded-lg shadow-xl z-10 w-11/12 max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Pop Card</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Title</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Image</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditImage(e.target.files[0])}
                    className="hidden"
                    id="editFileInput"
                  />
                  <label htmlFor="editFileInput" className="cursor-pointer text-blue-600 hover:text-blue-700">
                    Change Image
                  </label>
                  
                  <div className="mt-4 text-center">
                    {editImage ? (
                      <>
                        <img
                          src={URL.createObjectURL(editImage)}
                          alt="New Preview"
                          className="max-h-40 object-contain rounded-lg mx-auto"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          {editImage.name}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                        <img
                          src={popCards.find(c => c._id === editCardId)?.img}
                          alt="Current"
                          className="max-h-40 object-contain rounded-lg mx-auto"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          {popCards.find(c => c._id === editCardId)?.img?.split('/').pop()}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div>
        <SliderImagePage loadingState={loadingStates}/>
      </div>
    </div>
  );
};

export default PopCardsPage;
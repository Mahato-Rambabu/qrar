// Offers.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import OfferModal from './OfferModal';
import { Edit, Trash, Plus } from 'lucide-react';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  // Fetch offers from backend and auto-disable expired ones
  const fetchOffers = async () => {
    try {
      const response = await axiosInstance.get('/offer/all');
      const updatedOffers = response.data.map((offer) => {
        const now = new Date();
        if (offer.expirationTime && new Date(offer.expirationTime) < now) {
          return { ...offer, status: false }; // Auto-deactivate expired offers
        }
        return offer;
      });
      setOffers(updatedOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleAddOffer = () => {
    setEditingOffer(null);
    setIsModalOpen(true);
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setIsModalOpen(true);
  };

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await axiosInstance.delete(`/offer/${offerId}`);
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  const handleToggleStatus = async (offer) => {
    const now = new Date();
    const isExpired = offer.expirationTime && new Date(offer.expirationTime) < now;

    if (!offer.status && isExpired) {
      const newExpiration = prompt(
        'This offer has expired. Please enter a new expiration date (YYYY-MM-DD HH:MM:SS):'
      );
      if (!newExpiration) return;

      try {
        await axiosInstance.put(`/offer/${offer._id}`, {
          expirationTime: newExpiration,
          status: true, // Reactivate after updating expiration
        });
        fetchOffers();
      } catch (error) {
        console.error('Error updating expiration date:', error);
      }
    } else {
      try {
        await axiosInstance.put(`/offer/toggle/${offer._id}`);
        fetchOffers();
      } catch (error) {
        console.error('Error toggling status:', error);
      }
    }
  };

  const handleModalSubmit = async (data) => {
    try {
      if (editingOffer) {
        // Update existing offer
        await axiosInstance.put(`/offer/${editingOffer._id}`, data);
      } else {
        // Create new offer
        await axiosInstance.post('/offer', data);
      }
      setIsModalOpen(false);
      fetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Offers</h1>
        <button
          onClick={handleAddOffer}
          className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded transition duration-200"
        >
          <Plus size={18} />
          <span>Add Offer</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-6 text-left text-gray-700">Title</th>
              <th className="py-3 px-6 text-left text-gray-700">Target Type</th>
              <th className="py-3 px-6 text-left text-gray-700">Discount %</th>
              <th className="py-3 px-6 text-left text-gray-700">Activation</th>
              <th className="py-3 px-6 text-left text-gray-700">Expiration</th>
              <th className="py-3 px-6 text-center text-gray-700">Status</th>
              <th className="py-3 px-6 text-center text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {offers.map((offer) => {
              const isExpired = offer.expirationTime && new Date(offer.expirationTime) < new Date();

              return (
                <tr key={offer._id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-800">{offer.title}</td>
                  <td className="py-4 px-6 text-gray-800">{offer.targetType}</td>
                  <td className="py-4 px-6 text-gray-800">{offer.discountPercentage}%</td>
                  <td className="py-4 px-6 text-gray-800">
                    {new Date(offer.activationTime).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-gray-800">
                    {offer.expirationTime
                      ? new Date(offer.expirationTime).toLocaleString()
                      : 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleToggleStatus(offer)}
                      className={`${
                        isExpired
                          ? 'bg-red-500 cursor-not-allowed'
                          : offer.status
                          ? 'bg-green-500'
                          : 'bg-gray-500'
                      } text-white px-4 py-1 rounded-full text-sm transition duration-200`}
                      disabled={isExpired}
                    >
                      {isExpired ? 'Expired' : offer.status ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => handleEditOffer(offer)}
                        className="text-blue-500 hover:text-blue-700 transition duration-200"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer._id)}
                        className="text-red-500 hover:text-red-700 transition duration-200"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <OfferModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          initialData={editingOffer}
        />
      )}
    </div>
  );
};

export default OffersPage;

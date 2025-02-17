// OfferCard.js
import React from 'react';

const OfferCard = ({ offer, onEdit, onToggle, onDelete }) => {
  return (
    <div className="border rounded p-4 shadow-sm">
      <h2 className="text-xl font-semibold">{offer.title}</h2>
      {offer.description && <p className="mt-2">{offer.description}</p>}
      
      <div className="mt-2 space-y-1">
        <p><strong>Active Days:</strong> {offer.applicableDays.join(', ')}</p>
        <p><strong>Time:</strong> {offer.startTime} - {offer.endTime}</p>
        <p>
          <strong>Discount:</strong> If bill &gt; {offer.discountCondition.minBillAmount} then {offer.discountCondition.discountPercentage}% off
        </p>
        <p><strong>Priority:</strong> {offer.priority}</p>
      </div>

      <div className="flex gap-2 mt-3">
        <button 
          onClick={onEdit}
          className="px-3 py-1 bg-yellow-500 text-white rounded"
        >
          Edit
        </button>
        <button 
          onClick={() => onToggle(offer._id)}
          className={`px-3 py-1 rounded ${offer.isActive ? 
            'bg-green-500 text-white' : 'bg-gray-300 text-black'}`}
        >
          {offer.isActive ? 'Active' : 'Activate'}
        </button>
        <button 
          onClick={() => onDelete(offer._id)}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default OfferCard;
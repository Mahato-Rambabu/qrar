// PopCard.js
import React from 'react';
import { Switch, CircularProgress } from '@mui/material';
import { Trash2, Edit3 } from 'lucide-react';

const PopCard = ({ card, onToggle, onDelete, onEditOpen, loadingState }) => {
  return (
    <div className="shrink-0 border bg-white rounded-lg shadow-lg flex flex-col items-center snap-start max-w-[300px] w-full">
      <div className="rounded-t-lg overflow-hidden mb-2 w-full">
        <img
          src={card.img}
          alt={card.name}
          className="w-full h-48 object-contain bg-gray-100"
        />
      </div>

      <div className="w-full px-3 py-2 text-center">
        <h2 className="text-sm font-medium truncate">{card.name}</h2>
      </div>

      <div className="flex w-full items-center justify-between px-3 pb-2">
        <Switch
          checked={card.isActive}
          onChange={() => onToggle(card._id, card.isActive)}
          color="primary"
          disabled={loadingState[card._id]}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditOpen(card)}
            className="text-blue-500 hover:text-blue-700 p-1"
            disabled={loadingState[card._id]}
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(card._id)}
            className="text-red-500 hover:text-red-700 p-1"
            disabled={loadingState[card._id]}
          >
            {loadingState[card._id] ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopCard;
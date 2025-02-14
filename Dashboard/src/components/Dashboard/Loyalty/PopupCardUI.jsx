import React from 'react';
import { Switch, CircularProgress } from '@mui/material';
import { Trash2 } from 'lucide-react';

const PopCard = ({ card, onToggle, onDelete, loadingState }) => {
  return (
    <div
      className="shrink-0 w-[50%] sm:w-[40%] md:w-[25%] border bg-white rounded-lg shadow-lg flex flex-col items-center snap-start"
    >
<<<<<<< Updated upstream
      {/* Image container with fixed 9:16 aspect ratio */}

      <div className="w-full aspect-[9/9] rounded-t-lg overflow-hidden mb-2">

=======
      {/* 9:16 aspect ratio container for the image */}
      <div className="w-full aspect-[9/9] rounded-t-lg overflow-hidden">
>>>>>>> Stashed changes
        <img
          src={card.img}
          alt={card.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Card Content */}
      <div className="w-full px-3 py-2">
        <h2 className="text-sm font-medium truncate text-center">{card.name}</h2>
      </div>

      {/* Action Row: Toggle Switch & Delete Button */}
      <div className="flex w-full items-center justify-between px-3 pb-2">
        {/* Toggle Switch (MUI) */}
        <Switch
          checked={card.isActive}
          onChange={() => onToggle(card._id, card.isActive)}
          color="primary"
          disabled={loadingState[card._id]}
        />

        {/* Delete Button (with loading) */}
        <button
          onClick={() => onDelete(card._id)}
          className="text-red-500 hover:text-red-700 p-1"
          disabled={loadingState[card._id]}
        >
          {loadingState[card._id] ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <Trash2 className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PopCard;

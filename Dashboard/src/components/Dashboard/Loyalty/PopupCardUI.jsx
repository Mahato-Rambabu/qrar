import React from 'react';
import { Switch, CircularProgress } from '@mui/material';
import { Trash2 } from 'lucide-react';

const PopCard = ({ card, onToggle, onDelete, loadingState }) => {
  return (
    <div
      className="sm:min-w-[40%] lg:min-w-[20%] sm:w-56 border bg-white rounded-lg shadow-lg  flex flex-col items-center  sm:shrink-0"
    >
      {/* Image container with fixed 9:16 aspect ratio */}
      <div className="w-full aspect-[9/9] rounded-t-lg overflow-hidden mb-2">
        <img
          src={card.img}
          alt={card.name}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Card Content */}
      <div className="w-full px-4">
        <h2 className="text-sm font-medium truncate ">{card.name}</h2>
 
      </div>
      {/* Actions: Toggle Switch and Delete Button */}
      <div className="mt-2 mb-2 flex w-full items-center justify-between px-2">
        <Switch
          checked={card.isActive}
          onChange={() => onToggle(card._id, card.isActive)}
          color="primary"
          disabled={loadingState[card._id]}
        />
        <button
          onClick={() => onDelete(card._id)}
          className="text-red-500 hover:text-red-700 p-2"
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

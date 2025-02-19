<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes
        <Switch
          checked={card.isActive}
          onChange={() => onToggle(card._id, card.isActive)}
          color="primary"
          disabled={loadingState[card._id]}
        />
<<<<<<< Updated upstream
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
=======
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
>>>>>>> Stashed changes
      </div>
    </div>
  );
};

<<<<<<< Updated upstream
export default PopCard;
=======
export default PopCard;
>>>>>>> Stashed changes

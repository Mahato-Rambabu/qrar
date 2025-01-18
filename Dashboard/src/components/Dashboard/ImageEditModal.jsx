import React, { useState } from 'react';

const ImageEditModal = ({ imageSrc, onSave, onClose }) => {
  const [image, setImage] = useState(imageSrc);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    onSave(image);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Edit Image</h2>
        <div className="mb-4">
          {image ? (
            <img src={image} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </div>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="mr-2 px-4 py-2 bg-gray-500 text-white rounded-md">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditModal;

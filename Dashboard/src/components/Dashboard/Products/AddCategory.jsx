import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaImage, FaTag, FaRupeeSign } from 'react-icons/fa';
import axiosInstance from '../../../utils/axiosInstance';
import Cookies from 'js-cookie'; // Import js-cookie

const AddCategory = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    catName: '',
    price: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRestaurantIdFromToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error('Authentication token missing');

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.restaurantId;
    } catch (error) {
      throw new Error('Invalid token format');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const validFileTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const fileSize = file?.size / 1024 / 1024;

    if (file && !validFileTypes.includes(file.type)) {
      toast.error('Please upload a valid image (PNG, JPG, or GIF).');
      setImageFile(null);
      return;
    }

    if (file && fileSize > 5) {
      toast.error('File size exceeds the 5MB limit.');
      setImageFile(null);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!imageFile) {
      toast.error('Please upload a category image.');
      setIsSubmitting(false);
      return;
    }

    try {
      const restaurantId = getRestaurantIdFromToken();
      const data = new FormData();
      data.append('catName', formData.catName);
      data.append('img', imageFile);
      data.append('price', formData.price);
      data.append('restaurant', restaurantId);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axiosInstance.post('/categories', data, config);

      toast.success('Category added successfully!');
      setFormData({ catName: '', price: '' });
      setImageFile(null);
      setImagePreview(null);
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add category.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="my-6 bg-gray-100">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Add New Category</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaTag className="inline-block text-gray-500 mr-2" /> Category Name
              </label>
              <input
                type="text"
                name="catName"
                value={formData.catName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm"
                placeholder="Enter category name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaRupeeSign className="inline-block text-gray-500 mr-2" /> Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm"
                placeholder="Enter price"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaImage className="inline-block text-gray-500 mr-2" /> Category Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload-cat"
                className={`flex flex-col items-center justify-center w-full h-64 ${
                  imagePreview
                    ? 'border-none'
                    : 'border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-gray-50'
                } rounded-lg cursor-pointer`}
                style={{
                  backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {!imagePreview && (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaImage className="text-3xl text-gray-400 mb-2" />
                    <p className="mb-2 text-sm text-gray-500">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIFS (max 2MB)</p>
                  </div>
                )}
                <input
                  id="file-upload-cat"
                  type="file"
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-400 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Add Category'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;

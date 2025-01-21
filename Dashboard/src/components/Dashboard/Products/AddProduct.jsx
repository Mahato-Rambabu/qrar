import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axiosInstance from '../../../utils/axiosInstance';
import {
  faTag,
  faFolderOpen,
  faTags,
  faImage,
  faAlignLeft,
  faIndianRupeeSign,
} from '@fortawesome/free-solid-svg-icons';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../../utils/imageUtils';
import Modal from 'react-modal'
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import SliderImageManager from './SliderImageManager';

Modal.setAppElement('#root');

const AddProductPage = ({onSuccess}) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    tags: '',
    img: null,
  });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for image cropping
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 50, y: 50 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Token is missing. Please log in.');

        const response = await axiosInstance.get('/categories', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
  
    if (files && files[0]) {
      const file = files[0];
  
      // Check file size limit
      if (file.size > 5242880) {
        setError('File size exceeds 5MB limit.');
        return;
      }
  
      // Set the file directly into the form data for upload
      setFormData((prevState) => ({
        ...prevState,
        [name]: file, // Store the file object
      }));
  
      // Set the image preview source for cropping or display
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setImageSrc(fileReader.result); // Preview the image
        setIsModalOpen(true); // Open cropping modal if required
      };
      fileReader.readAsDataURL(file); // Read the file for preview
    } else {
      // Update formData for non-file inputs
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  }; 

  const handleCropComplete = async () => {
    try {
      // Get the cropped Blob
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
  
      // Convert the Blob to an object URL for preview
      const croppedPreview = URL.createObjectURL(croppedBlob);
  
      // Update the state
      setCroppedImage(croppedPreview); // Set cropped image preview
      setFormData((prevState) => ({
        ...prevState,
        img: croppedBlob, // Save the cropped Blob in formData
      }));
  
      // Close the cropping modal
      setIsModalOpen(false);
      setImageSrc(null);
    } catch (err) {
      console.error('Error cropping the image:', err);
    }
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
  
    if (!formData.name || !formData.price || !formData.category || !formData.img) {
      setError('All fields are required.');
      setIsSubmitting(false);
      return;
    }
  
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Token is missing. Please log in.');
  
      const data = new FormData();
  
      // Append all form data fields
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
  
      const response = await axiosInstance.post('/products', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      toast.success('Product added successfully!');
      setFormData({
        name: '',
        price: '',
        description: '',
        category: '',
        tags: '',
        img: null,
      });
      setCroppedImage(null);

      if (onSuccess) onSuccess(response.data) // Trigger callback if provided
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setImageSrc(null); // Clear the image source to prevent re-registering the modal
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-gray-600">Fill out the form below to create a new product.</p>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form className="bg-white p-6 rounded shadow" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold mb-4">Product Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faTag} className="mr-2 text-gray-500" /> Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm"
              placeholder="Product Name"
              required
            />
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faIndianRupeeSign} className="mr-2 text-gray-500" /> Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm"
              placeholder="₹0.00"
              required
            />
          </div>

          {/* Category Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faFolderOpen} className="mr-2 text-gray-500" /> Category
            </label>
            {loadingCategories ? (
              <p className="text-gray-500">Loading categories...</p>
            ) : (
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm"
                required
              >
                <option value="" disabled>Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.catName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faTags} className="mr-2 text-gray-500" /> Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm"
              placeholder="Comma-separated tags"
            />
          </div>

          {/* Image Upload and Cropping */}
          <div className="mb-6 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FontAwesomeIcon icon={faImage} className="mr-2 text-gray-500" /> Product Image
            </label>

            {croppedImage ? (
              <div className="relative">
                <img
                  src={croppedImage}
                  alt="Cropped Product"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => {setCroppedImage(null)
                    setFormData((prevState) => ({ ...prevState, img: null }));
                  }} // Reset to upload a new image
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md text-gray-700 hover:bg-gray-100"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition duration-200"
                >
                  <div className="flex flex-col items-center justify-center pt-6 pb-8">
                    <FontAwesomeIcon icon={faImage} className="text-4xl text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500">Click or drag to upload</p>
                    <p className="text-xs text-gray-500">PNG, JPG (max 2MB)</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    name="img"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Modal for cropping */}
            {isModalOpen && (
              <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Crop Image Modal"
                ariaHideApp={false} // If you haven't set the app root element
                className="fixed inset-0 flex items-center justify-center z-50"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50"
              >
                <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-2xl">
                  <h2 className="text-lg font-semibold mb-4">Crop Your Image</h2>
                  <div className="relative h-72 w-full bg-gray-100 rounded-md overflow-hidden">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={4 / 3}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={(croppedArea, croppedAreaPixels) =>
                        setCroppedAreaPixels(croppedAreaPixels)
                      }
                      minZoom={0.5}
                      maxZoom={3}
                      restrictPosition={false}
                    />
                  </div>
                  <div className="mt-4 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="bg-gray-300 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-400 transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCropComplete}
                      className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
                    >
                      Crop and Save
                    </button>
                  </div>
                </div>
                
              </Modal>
            )}
          </div>
        </div>

        {/* Description Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FontAwesomeIcon icon={faAlignLeft} className="mr-2 text-gray-500" /> Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm"
            placeholder="Describe the product here..."
            rows="4"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Add Product'}
        </button>
      </form>

      <SliderImageManager />
    </div>
  );
};

export default AddProductPage;

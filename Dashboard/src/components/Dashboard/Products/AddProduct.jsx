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
import { CircularProgress } from '@mui/material';

Modal.setAppElement('#root');

const AddProductPage = ({ onSuccess }) => {
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
  const [restaurantTaxType, setRestaurantTaxType] = useState(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        // Use AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await axiosInstance.get('/restaurants/profile', {
          signal: controller.signal,
          timeout: 10000,
        });
        
        clearTimeout(timeoutId);
        setRestaurantTaxType(response.data.taxType || null);
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
        if (error.name === 'AbortError') {
          toast.error('Restaurant details request timed out. Please refresh the page.');
        } else {
          toast.error('Failed to load restaurant details. Please try again.');
        }
      }
    };
  
    fetchRestaurantDetails();
  }, []);
  
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        // Use AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await axiosInstance.get('/categories', {
          signal: controller.signal,
          timeout: 10000,
        });
        
        clearTimeout(timeoutId);
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (error.name === 'AbortError') {
          setError('Categories request timed out. Please refresh the page.');
        } else {
          setError('Failed to load categories. Please try again later.');
        }
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

    if (restaurantTaxType === 'inclusive' && (!formData.taxRate || isNaN(formData.taxRate))) {
      setError('Tax rate is required for inclusive tax products.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Optimize image before upload
      let optimizedImage = formData.img;
      
      // If the image is a File object, optimize it
      if (formData.img instanceof File) {
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        // Create a promise to handle image loading
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(formData.img);
        });
        
        // Calculate dimensions while maintaining aspect ratio
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with reduced quality
        const blob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/jpeg', 0.7);
        });
        
        // Create a new File object with the optimized image
        optimizedImage = new File([blob], formData.img.name, { type: 'image/jpeg' });
      }

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'img') {
          data.append(key, optimizedImage);
        } else {
          data.append(key, formData[key]);
        }
      });

      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await axiosInstance.post('/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: controller.signal,
        // Add timeout to the request
        timeout: 30000,
      });
      
      clearTimeout(timeoutId);

      toast.success('Product added successfully!');
      setFormData({
        name: '',
        price: '',
        description: '',
        category: '',
        tags: '',
        img: null,
        taxRate: '',
      });

      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else if (error.response && error.response.status === 413) {
        setError('Image file is too large. Please use a smaller image.');
      } else {
        setError('Failed to add product. Please try again.');
      }
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

          {restaurantTaxType === 'inclusive' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faTags} className="mr-2 text-gray-500" /> Tax Rate (%)
              </label>
              <input
                type="number"
                name="taxRate"
                value={formData.taxRate || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded shadow-sm"
                placeholder="Enter GST percentage"
                required
              />
            </div>
          )}

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
                  onClick={() => {
                    setCroppedImage(null)
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
                ariaHideApp={false}
                className="fixed inset-0 flex items-center justify-center z-[9999]"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
                style={{
                  content: {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    transform: 'translate(-50%, -50%)',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    zIndex: 9999
                  },
                  overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9998
                  }
                }}
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
                      className="bg-blue-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
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
          className="bg-blue-500 text-white px-4 py-2 w-40 h-10 flex justify-center items-center rounded-lg shadow hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={20} className='text-white' /> : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;

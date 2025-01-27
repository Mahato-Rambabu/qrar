import React, { useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import imageCompression from 'browser-image-compression';
import { toast } from 'react-hot-toast';

const SliderImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  // Compress and upload the image
  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error('Please select an image to upload.');
      return;
    }

    setIsUploading(true);

    try {
      // Compress the image
      const compressedImage = await imageCompression(selectedImage, {
        maxSizeMB: 1, // Set max size to 1MB
        maxWidthOrHeight: 1920, // Maintain image quality with a maximum resolution
        useWebWorker: true, // Optimize using web workers
      });

      const formData = new FormData();
      formData.append('img', compressedImage);

      // Upload the compressed image
      await axiosInstance.post('/imageSlider', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSelectedImage(null);
      setPreviewImage(null);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload the image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Slider Image</h1>

      <div className="mb-6">
        <input
          type="file"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />
        {previewImage && (
          <img
            src={previewImage}
            alt="Preview"
            className="w-32 h-32 mt-2 rounded-md object-cover"
          />
        )}
        <button
          onClick={handleUpload}
          className={`mt-4 px-4 py-2 rounded-md ${
            isUploading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
};

export default SliderImageUploader;

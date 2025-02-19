import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import { FaPen } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const EditProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [productData, setProductData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null); // For the selected image file
  const [imagePreview, setImagePreview] = useState(null); // For image preview

  useEffect(() => {
    const fetchData = async () => {
      try {      
        const [productResponse, categoriesResponse] = await Promise.all([
          axiosInstance.get(`/products/edit/${productId}`),
          axiosInstance.get('/categories'),
        ]);
    
        const product = productResponse.data;
    
        setProductData({
          ...product,
          category: product.category?._id || "", // Store only the category ID
        });
        setCategories(categoriesResponse.data);
        setImagePreview(product.img); // Set initial image preview
      } catch (err) {
        setError('Failed to fetch product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({ 
      ...prevData, 
      [name]: value 
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Save the selected file
      setImagePreview(URL.createObjectURL(file)); // Update image preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {  
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('price', productData.price);
      formData.append('description', productData.description);
      formData.append('category', productData.category);
  
      if (imageFile) {
        formData.append('img', imageFile);
      }
  
      await axiosInstance.put(`/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      toast.success('Product updated successfully!');
      navigate('/products');
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error('Failed to update product. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }
  
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
  
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <nav className="text-sm text-gray-500">
          <span className="cursor-pointer hover:underline" onClick={() => navigate('/dashboard')}>
            Dashboard
          </span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate('/categories')}>
            Categories
          </span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate('/products')}>
            Products
          </span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:underline">Edit Product</span>
        </nav>
      </div>
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-700 mb-6">Edit Product</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600">Name</label>
            <input
              type="text"
              name="name"
              value={productData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-600">Price</label>
            <input
              type="number"
              name="price"
              value={productData.price}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-600">Category</label>
            <select
              name="category"
              value={productData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.catName}
                </option>
              ))}
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-600">Image</label>
            <div className="relative w-96 h-96">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Product Preview"
                  className="w-full h-full object-cover my-4 rounded-md border border-gray-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md border border-gray-300">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              <label
                htmlFor="imageInput"
                className="absolute top-2 right-2 bg-transparent text-white p-2 rounded-full cursor-pointer hover:bg-blue-500 hover:text-white"
              >
                <FaPen />
              </label>
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-600">Description</label>
            <textarea
              name="description"
              value={productData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>
  
          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-6 py-2 bg-white text-black rounded-lg border shadow hover:bg-gray-200 focus:ring-2 focus:ring-blue-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500  text-white rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;

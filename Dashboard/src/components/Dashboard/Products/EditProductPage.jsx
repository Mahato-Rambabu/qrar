import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import { FaPen } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const EditProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [productData, setProductData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Hold the selected file
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
          const token = localStorage.getItem('authToken');
          if (!token) throw new Error('Authentication token is missing.');
      
          const [productResponse, categoriesResponse] = await Promise.all([
            axios.get(`http://localhost:5001/products/${productId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get('http://localhost:5001/categories', {
              headers: { Authorization: `Bearer ${token}` },
            }),
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
  
    // For dropdowns, ensure we send the category ID, not the entire object
    if (name === "category") {
      setProductData((prevData) => ({ ...prevData, category: value }));
    } else {
      setProductData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Set the selected file
      setImagePreview(URL.createObjectURL(file)); // Preview the file
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication token is missing.');
  
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('price', productData.price);
      formData.append('description', productData.description);
      formData.append('category', productData.category); // Should be a string
  
      if (imageFile) {
        formData.append('img', imageFile); // Append the file only if it exists
      }
  
      console.log('FormData before submission:', Array.from(formData.entries()));
  
      await axiosInstance.put(`/products/${productId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
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
  
  if (loading) return <div className="flex justify-center items-center h-screen"><p className="text-lg">Loading...</p></div>;
  if (error) return <p className="text-red-500">{error}</p>;

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
          <span className="cursor-pointer hover:underline">
            Edit Product
          </span>
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
              value={productData.name || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Price</label>
            <input
              type="number"
              name="price"
              value={productData.price || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Category</label>
            <select
              name="category"
              value={productData.category || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.catName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Image</label>
            <div className="relative w-64 h-64">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Product Preview"
                  className="w-full h-full object-cover rounded-md border border-gray-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md border border-gray-300">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              <label
                htmlFor="imageInput"
                className="absolute top-2 right-2 bg-transparent text-black p-2 rounded-full cursor-pointer hover:bg-blue-700 hover:text-white"
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
              value={productData.description || ''}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;

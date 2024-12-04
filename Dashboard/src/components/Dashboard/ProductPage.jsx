import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const ProductPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedForm, setSelectedForm] = useState('category');
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch categories for the logged-in user
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/categories'); // Backend endpoint for fetching categories
        setCategories(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching categories');
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const endpoint = selectedForm === 'category' ? '/categories' : '/products';
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }

      const response = await axiosInstance.post(endpoint, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(response.data.message || 'Success');
      setFormData({}); // Clear form after successful submission

      if (selectedForm === 'category') {
        // Update category list when a new category is added
        setCategories([...categories, response.data.category]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting form');
    }
  };

  return (
    <div className="pt-[10vh]">
      <h1 className="text-2xl font-bold text-center mb-6">Manage Categories and Products</h1>

      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded ${
            selectedForm === 'category' ? 'bg-green-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setSelectedForm('category')}
        >
          Add Category
        </button>
        <button
          className={`px-4 py-2 rounded ${
            selectedForm === 'product' ? 'bg-green-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setSelectedForm('product')}
        >
          Add Product
        </button>
      </div>

      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        {selectedForm === 'category' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Category Name</label>
              <input
                type="text"
                name="catName"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-green-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Image</label>
              <input
                type="file"
                name="img"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price</label>
              <input
                type="number"
                name="price"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-green-200"
                required
              />
            </div>
          </>
        )}

        {selectedForm === 'product' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-green-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Image</label>
              <input
                type="file"
                name="img"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price</label>
              <input
                type="number"
                name="price"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-green-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-green-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                name="category"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-green-200"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.catName}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ProductPage;

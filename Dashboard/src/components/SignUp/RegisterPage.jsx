import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    number: '',
    address: '',
    taxType: 'none', 
    taxPercentage: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset taxPercentage when "none" or "inclusive" is selected
    if (name === "taxType") {
      setFormData((prevData) => ({
        ...prevData,
        taxType: value,
        taxPercentage: value === "exclusive" ? prevData.taxPercentage : '' // Clear if "none" or "inclusive"
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Ensure taxType is always stored correctly
      let requestData = { ...formData };

      if (formData.taxType !== "exclusive") {
        delete requestData.taxPercentage;
      }

      await axiosInstance.post('/restaurants/register', requestData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during registration.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 shadow-lg rounded-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Register Your Restaurant</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Restaurant Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Enter restaurant name" />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Enter email" />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Enter password" />
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
            <input type="text" name="number" value={formData.number} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Enter phone number" />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Enter address" />
          </div>

          {/* Tax Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Tax Type</label>
            <select name="taxType" value={formData.taxType} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="none">None</option>
              <option value="inclusive">Inclusive</option>
              <option value="exclusive">Exclusive</option>
            </select>
          </div>

          {/* Tax Percentage - Only show if Exclusive is selected */}
          {formData.taxType === "exclusive" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">Tax Percentage</label>
              <input type="number" name="taxPercentage" value={formData.taxPercentage} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Enter tax percentage" />
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition">Register</button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-green-500 hover:underline">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

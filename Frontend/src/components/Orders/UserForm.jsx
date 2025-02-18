import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from 'react-hot-toast';

const UserForm = ({ onFormSubmit }) => {
  const { restaurantId } = useParams();
  const [userDetails, setUserDetails] = useState({
    name: "",
    phone: "",
    age: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post(
        `/users/${restaurantId}`,
        userDetails
      );

      // Accept both 201 (new user) and 200 (existing user) as successful
      if (response.status === 201 || response.status === 200) {
        localStorage.setItem("customerIdentifier", response.data.customerIdentifier);
        onFormSubmit();
        toast.success("User details saved successfully! You can now place orders.");
      }
    } catch (err) {
      console.error("Error saving user details:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to save user details.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      style={{
        backgroundImage: `url('/form-bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
        <button
          onClick={onFormSubmit}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Enter Your Details
        </h2>
        {error && (
          <p className="text-sm text-red-500 text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={userDetails.name}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={userDetails.phone}
              onChange={handleChange}
              required
              pattern="^[0-9]{10}$"
              title="Enter a valid 10-digit phone number"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={userDetails.age}
              onChange={handleChange}
              required
              min="10"
              max="100"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-pink-500 text-white font-bold rounded-md hover:bg-pink-600 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;

import React, { useEffect, useState } from "react";
import { Edit3 } from "lucide-react";
import axios from "axios";
import ImageEditModal from "./ImageEditModal"; // Import the modal component
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showModal, setShowModal] = useState(false); // Modal state
  const [currentImage, setCurrentImage] = useState("");
  const [currentImageType, setCurrentImageType] = useState(""); // To differentiate between profile and banner

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Authentication token is missing.");

        const response = await axios.get("http://localhost:5001/restaurants/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(response.data);
        setFormData(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSave = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token is missing.");

      const response = await axios.put(
        "http://localhost:5001/restaurants/profile",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the profile state with the updated data
      setProfile((prev) => ({
        ...prev,
        ...response.data,
      }));

      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile. Please try again.");
    }
  };


  const handleEditImage = (imageType) => {
    setCurrentImageType(imageType);
    setCurrentImage(profile[imageType]);
    setShowModal(true);
  };

  const handleSaveImage = async (blobUrl) => {
    try {
      // Convert blob URL to a Blob object
      const responseBlob = await fetch(blobUrl);
      const blob = await responseBlob.blob();

      // Create a File object from the Blob
      const file = new File([blob], `${currentImageType}.jpg`, { type: blob.type });

      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token is missing.");

      const formData = new FormData();
      formData.append(currentImageType, file);
      console.log("FormData before submission:", Array.from(formData.entries()));

      const response = await axios.post(
        `http://localhost:5001/restaurants/${currentImageType}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile((prev) => ({
        ...prev,
        [currentImageType]: response.data[currentImageType],
      }));
      toast.success("Image updated successfully!");
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error("Failed to upload image. Please try again.");
    }
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      {showModal && (
        <ImageEditModal
          imageSrc={currentImage}
          onSave={handleSaveImage}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Banner Section */}
      <div className="relative sm:h-64 sm:w-full bg-gradient-to-r from-blue-500 to-purple-500">
        <img
          src={profile.bannerImage || ""}
          alt="Banner"
          className="sm:w-full sm:h-full h-45 w-full object-cover sm:object-cover"
        />
        <button
          onClick={() => handleEditImage("bannerImage")}
          className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-200"
        >
          <Edit3 size={20} />
        </button>

        <div className="absolute bottom-0 sm:right-8 right-1  transform -translate-x-1/2 translate-y-1/2 w-32 h-32">
          <img
            src={profile.profileImage || ""}
            alt="Profile"
            className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
          />
          <button
            onClick={() => handleEditImage("profileImage")}
            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-200"
          >
            <Edit3 size={20} />
          </button>
        </div>
      </div>

      {/* Profile Details Section */}
      <div className="mt-20 max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 flex justify-center">Profile Details</h1>
        <div className="space-y-4 w-full flex flex-col justify-around ">
          {/* Name */}
          <div className="flex items-center justify-between">
            <label className="text-gray-600 font-medium">Name:</label>
            {editing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            ) : (
              <span className="text-gray-800">{profile.name}</span>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center justify-between">
            <label className="text-gray-600 font-medium">Email:</label>
            <span className="text-gray-800">{profile.email}</span>
          </div>

          {/* Phone Number */}
          <div className="flex items-center justify-between">
            <label className="text-gray-600 font-medium">Phone Number:</label>
            {editing ? (
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            ) : (
              <span className="text-gray-800">{profile.number}</span>
            )}
          </div>

          {/* Address */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <label className="text-gray-600 font-medium sm:mr-4">Address:</label>
            {editing ? (
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-auto text-right"
              />
            ) : (
              <span className="text-gray-800 text-right block w-full sm:w-auto">
                {profile.address}
              </span>
            )}
          </div>

        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-4">
          {editing ? (
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>

  );
};

export default ProfilePage;

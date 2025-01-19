import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from '../../../utils/axiosInstance';
import { FaPen } from "react-icons/fa";
import { toast } from 'react-hot-toast';

const EditCategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [categoryData, setCategoryData] = useState({
    catName: "",
    price: "",
    img: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Authentication token is missing.");

        const response = await axiosInstance.get(
          `/categories/${categoryId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setCategoryData({
          catName: response.data.catName,
          price: response.data.price,
        });
        setImagePreview(response.data.img); // Set the current image as preview
      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Failed to load category details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Preview the uploaded image
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token is missing.");

      const formData = new FormData();
      formData.append("catName", categoryData.catName);
      formData.append("price", categoryData.price);
      if (imageFile) {
        formData.append("img", imageFile); // Append the new image if it exists
      }

      await axiosInstance.put(
        `/categories/${categoryId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Category updated successfully!");
      navigate("/categories");
    } catch (err) {
      console.error("Error updating category:", err);
      setError("Failed to update category. Please try again.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
                 <nav className="text-sm text-gray-500 mb-4">
          <span className="cursor-pointer hover:underline" onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate('/categories')}>Categories</span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:underline" >Edit Category</span>
        </nav>
      <div className="max-w-lg mx-auto bg-white px-6 py-4 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Edit Category</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Category Name
            </label>
            <input
              type="text"
              name="catName"
              value={categoryData.catName}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={categoryData.price}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Image
            </label>
            <div className="relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Category"
                  className="w-full h-40 object-cover rounded"
                />
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-gray-200 border border-gray-300 rounded">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <input
                type="file"
                id="imageInput"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <label
                htmlFor="imageInput"
                 className="absolute top-2 right-2 bg-transparent text-black p-2 rounded-full cursor-pointer hover:bg-blue-700 hover:text-white"
              >
                <FaPen />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded shadow hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryPage;

import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance'; // Adjust the path if needed

const PopUp = ({ restaurantId }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchPopUp = async () => {
      // Prevent fetching if pop-up has already been shown in this session
      if (sessionStorage.getItem("popupShown")) {
        console.log("Pop-up already shown in this session.");
        return;
      }

      try {
        console.log("Fetching pop-up for restaurantId:", restaurantId);
        
        const response = await axiosInstance.get(`/popups/${restaurantId}/active`);
        
        console.log("Pop-up response:", response.data);

        if (response.data?.img) {
          setImageUrl(response.data.img);
          setIsVisible(true);
          sessionStorage.setItem("popupShown", "true"); // Set session flag
        } else {
          console.warn("No active pop-up found for this restaurant.");
        }
      } catch (error) {
        console.error("Error fetching pop-up:", error.response?.data || error.message);
      }
    };

    fetchPopUp();
  }, [restaurantId]);

  if (!isVisible || !imageUrl) return null; // Do not render if no image

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white p-4 rounded-lg shadow-lg">
        <button 
          className="absolute top-2 right-2 text-gray-600 hover:text-black" 
          onClick={() => setIsVisible(false)}
        >
          ✖
        </button>
        <img src={imageUrl} alt="Popup" className="max-w-full h-auto" />
      </div>
    </div>
  );
};

export default PopUp;

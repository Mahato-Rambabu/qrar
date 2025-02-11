import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance"; // Import axiosInstance

const PopUp = ({ restaurantId }) => {
  const [popUp, setPopUp] = useState(null);
  const [isVisible, setIsVisible] = useState(false); // Initially hidden

  useEffect(() => {
    if (!restaurantId) return;

    const fetchPopUp = async () => {
      try {
        const response = await axiosInstance.get(`/popups/active/${restaurantId}`);
        if (response.data && response.data.imageUrl) {
          setPopUp(response.data);
          setIsVisible(true); // Show pop-up only if data exists
        }
      } catch (error) {
        console.error("No active pop-up found or error fetching pop-up", error);
      }
    };

    fetchPopUp();
  }, [restaurantId]);

  if (!popUp || !isVisible) return null; // Hide if no pop-up or user closed it

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-lg max-w-sm relative">
        <button
          className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full"
          onClick={() => setIsVisible(false)}
        >
          {"✕"}
        </button>
        <img
          src={popUp.imageUrl}
          alt="Pop-up"
          className="w-full h-auto rounded-lg"
        />
      </div>
    </div>
  );
};

export default PopUp;

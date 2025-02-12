import React, { useState, useEffect } from "react";
import axios from "axios";

const PopUp = ({ restaurantId }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const popupShown = sessionStorage.getItem("popupShown");

    // If the pop-up has been shown before in this session, do nothing
    if (popupShown) return;

    // Fetch the pop-up image
    const fetchPopUp = async () => {
      try {
        const response = await axios.get(
          `https://qrar.onrender.com/api/popups/${restaurantId}/active`
        );
        if (response.data?.imageUrl) {
          setImageUrl(response.data.imageUrl);
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Error fetching pop-up:", error);
      }
    };

    fetchPopUp();
  }, [restaurantId]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("popupShown", "true"); // Prevent showing again in the same session
  };

  if (!isVisible || !imageUrl) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-md">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={handleClose}
        >
          ✖
        </button>
        <img src={imageUrl} alt="Offer Pop-up" className="w-full rounded-lg" />
      </div>
    </div>
  );
};

export default PopUp;

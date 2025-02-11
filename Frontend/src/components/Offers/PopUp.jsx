// src/components/PopUp.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const PopUp = ({ restaurantId }) => {
  const [popUp, setPopUp] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;

    // If the pop-up has already been shown in this session, do nothing.
    if (sessionStorage.getItem("popupShown")) {
      return;
    }

    const fetchPopUp = async () => {
      try {
        const response = await axiosInstance.get(`/popups/${restaurantId}/active`);
        if (response.data && response.data.imageUrl) {
          setPopUp(response.data);
          setIsVisible(true);
        }
      } catch (error) {
        console.error("No active pop-up found or error fetching pop-up", error);
      }
    };

    fetchPopUp();
  }, [restaurantId]);

  const handleClose = () => {
    setIsVisible(false);
    // Set the flag so that the pop-up is not shown again during this session.
    sessionStorage.setItem("popupShown", "true");
  };

  if (!popUp || !isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-lg max-w-sm relative">
        <button
          className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full"
          onClick={handleClose}
        >
          {"\u00D7"}
        </button>
        <img src={popUp.imageUrl} alt="Pop-up" className="w-full h-auto rounded-lg" />
      </div>
    </div>
  );
};

export default PopUp;

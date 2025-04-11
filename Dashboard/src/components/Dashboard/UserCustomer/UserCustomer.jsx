import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import UserTable from "./UserTable";
import UserCards from "./UserCards";

const UserCustomer = () => {
  const [users, setUsers] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [activeOffer, setActiveOffer] = useState(null);
  const [birthdayNotifications, setBirthdayNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Helper function to format date in DD/MM/YYYY format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Helper function to format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Never";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  };

  // Helper functions for local storage to persist sent wishes
  const getSentWishes = () => {
    const wishes = localStorage.getItem("birthdayWishesSent");
    return wishes ? JSON.parse(wishes) : {};
  };

  const updateSentWishes = (userId) => {
    const wishes = getSentWishes();
    // Store today's date for the user to indicate that a wish has been sent today
    wishes[userId] = new Date().toISOString().slice(0, 10);
    localStorage.setItem("birthdayWishesSent", JSON.stringify(wishes));
  };

  const hasWishBeenSentToday = (userId) => {
    const wishes = getSentWishes();
    const today = new Date().toISOString().slice(0, 10);
    return wishes[userId] === today;
  };

  // Fetch restaurant data, active offers, and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resRestaurant = await axiosInstance.get("/restaurants/profile");
        console.log("Restaurant data:", resRestaurant.data);
        setRestaurant(resRestaurant.data);
      } catch (err) {
        console.error("Error fetching restaurant data:", err.message);
      }
      try {
        const resOffers = await axiosInstance.get("/offer/active");
        console.log("Active offers:", resOffers.data);
        if (Array.isArray(resOffers.data) && resOffers.data.length > 0) {
          setActiveOffer(resOffers.data[0]);
        }
      } catch (err) {
        console.error("Error fetching active offers:", err.message);
      }
      try {
        const resUsers = await axiosInstance.get("/users");
        const userData = resUsers.data || [];
        console.log("Users data:", userData);
        setUsers(userData);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err.message);
        setError("Failed to fetch user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fallback defaults using optional chaining and nullish coalescing operator
  const rName = restaurant?.name ?? "Restaurant";
  const rAddress = restaurant?.address ?? "our address";
  const offerText = activeOffer
    ? `${activeOffer.title} - ${activeOffer.discountPercentage}% off`
    : "No active offers available";

  // Check if today is the user's birthday (compare MM-DD parts)
  const isBirthdayToday = (dob) => {
    if (!dob) return false;
    const today = new Date().toISOString().slice(5, 10);
    const userBirthday = new Date(dob).toISOString().slice(5, 10);
    return today === userBirthday;
  };

  // Generate a dynamic message using fallback defaults if needed
  const generateDynamicMessage = (user) => {
    if (isBirthdayToday(user.dob)) {
      return `🎂 *Hey ${user.name}!* Wishing you a *spectacular birthday* filled with joy and surprises! *${rName}* is thrilled to celebrate your special day by offering you an *exclusive treat* at *${rAddress}*. Enjoy every moment and have a fantastic day! 🎉`;
    } else {
      return `Hello *${user.name}* 👋! Don't miss our *latest exciting offer*: *${offerText}*! Visit us at *${rAddress}* to experience the magic of *${rName}* and let our culinary delights brighten your day. See you soon! 🍽️🎉`;
    }
  };
  
  // Build the WhatsApp URL using the dynamically generated message
  const generateWhatsAppLink = (user) => {
    const message = generateDynamicMessage(user);
    return `https://api.whatsapp.com/send?phone=${user.phone}&text=${encodeURIComponent(message)}`;
  };

  // Automatically compute birthday notifications once users are loaded
  useEffect(() => {
    if (users.length > 0) {
      const birthdayMsgs = users
        .filter((user) => isBirthdayToday(user.dob) && !hasWishBeenSentToday(user._id))
        .map((user) => ({
          user,
          messageText: generateDynamicMessage(user),
        }));
      setBirthdayNotifications(birthdayMsgs);
    }
  }, [users, rName, rAddress, offerText]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto p-6">
      {/* Navigation */}
      <div className="mb-4">
        <nav className="text-sm text-gray-500">
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/")}>
            Dashboard
          </span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/customers")}>
            Customers
          </span>
        </nav>
      </div>

      {/* Birthday Notification Section */}
      {birthdayNotifications.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500">
          <h2 className="text-lg font-semibold text-yellow-800">Birthday Notifications</h2>
          <ul>
            {birthdayNotifications.map((msg) => (
              <li key={msg.user._id} className="mt-2 flex items-center">
                <span className="mr-2">
                  🎉 {msg.user.name} has a birthday today!
                </span>
                <a
                  href={`https://api.whatsapp.com/send?phone=${msg.user.phone}&text=${encodeURIComponent(msg.messageText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-700 flex items-center"
                  onClick={() => {
                    // Update local storage to mark wish as sent
                    updateSentWishes(msg.user._id);
                    // Remove the notification for this user after sending the wish
                    setBirthdayNotifications((prev) =>
                      prev.filter((n) => n.user._id !== msg.user._id)
                    );
                  }}
                >
                  <FaWhatsapp size={24} /> Send Wish
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Restaurant Visitors</h1>
      </div>
      {error && <div className="text-red-500 text-center my-4">{error}</div>}
      
      {/* Use the separated components for table and cards views */}
      <UserTable 
        users={users}
        isBirthdayToday={isBirthdayToday}
        formatDate={formatDate}
        formatRelativeTime={formatRelativeTime}
        generateWhatsAppLink={generateWhatsAppLink}
      />
      
      <UserCards 
        users={users}
        isBirthdayToday={isBirthdayToday}
        formatDate={formatDate}
        formatRelativeTime={formatRelativeTime}
        generateWhatsAppLink={generateWhatsAppLink}
      />
    </div>
  );
};

export default UserCustomer;

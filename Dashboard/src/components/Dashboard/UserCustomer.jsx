import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

const UserCustomer = () => {
  const [users, setUsers] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [activeOffer, setActiveOffer] = useState(null);
  const [birthdayNotifications, setBirthdayNotifications] = useState([]); // For birthday notifications
  const [sentStatus, setSentStatus] = useState({}); // Tracks if a birthday wish has been sent per user ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch restaurant data, active offers, and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurant details
        const resRestaurant = await axiosInstance.get("/restaurants/profile");
        console.log("Restaurant data:", resRestaurant.data);
        setRestaurant(resRestaurant.data);
      } catch (err) {
        console.error("Error fetching restaurant data:", err.message);
      }
      try {
        // Fetch active offers
        const resOffers = await axiosInstance.get("/offer/active");
        console.log("Active offers:", resOffers.data);
        if (Array.isArray(resOffers.data) && resOffers.data.length > 0) {
          setActiveOffer(resOffers.data[0]);
        }
      } catch (err) {
        console.error("Error fetching active offers:", err.message);
      }
      try {
        // Fetch users
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

  console.log("rName:", rName, "rAddress:", rAddress, "offerText:", offerText);

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
      return `🎂 Hey ${user.name}, Happy Birthday! ${rName} celebrates you with a special treat at ${rAddress}.`;
    } else {
      return `Hello ${user.name}, check out our latest offer at ${rName}! ${offerText}. Visit us at ${rAddress}.`;
    }
  };

  // Build the WhatsApp URL using the dynamically generated message
  const generateWhatsAppLink = (user) => {
    const message = generateDynamicMessage(user);
    return `https://api.whatsapp.com/send?phone=${user.phone}&text=${encodeURIComponent(message)}`;
  };

  // For birthday notifications, remove the notification after sending
  const handleSendWish = (user) => {
    // Mark as sent
    setSentStatus((prev) => ({ ...prev, [user._id]: true }));
    // Remove the notification for this user
    setBirthdayNotifications((prev) => prev.filter((msg) => msg.user._id !== user._id));
  };

  // Automatically compute birthday notifications once users are loaded
  useEffect(() => {
    if (users.length > 0) {
      const birthdayMsgs = users
        .filter((user) => isBirthdayToday(user.dob))
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
                  onClick={() => handleSendWish(msg.user)}
                >
                  <FaWhatsapp size={24} /> {sentStatus[msg.user._id] ? "Sent" : "Send Wish"}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* User Table */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Restaurant Visitors</h1>
      </div>
      {error && <div className="text-red-500 text-center my-4">{error}</div>}
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="py-3 px-6 text-left">Name</th>
            <th className="py-3 px-6 text-left">Phone</th>
            <th className="py-3 px-6 text-left">Date of Birth</th>
            <th className="py-3 px-6 text-left">Send</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <tr
                key={user._id}
                className={
                  isBirthdayToday(user.dob)
                    ? "border-b bg-yellow-100 border-gray-200 hover:bg-yellow-200"
                    : "border-b bg-gray-100 border-gray-200 hover:bg-gray-100"
                }
              >
                <td className="py-3 px-6">
                  {isBirthdayToday(user.dob) && <span className="mr-1">🎉</span>}
                  {user.name}
                </td>
                <td className="py-3 px-6">{user.phone}</td>
                <td className="py-3 px-6">
                  {user.dob ? new Date(user.dob).toLocaleDateString() : "N/A"}
                </td>
                <td className="py-3 px-6">
                  <a
                    href={generateWhatsAppLink(user)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:text-green-700 flex items-center"
                  >
                    <FaWhatsapp size={28} />
                  </a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="py-4 text-center bg-gray-100 text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserCustomer;

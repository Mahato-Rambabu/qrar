import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const UserCards = ({ users, isBirthdayToday, formatDate, formatRelativeTime, generateWhatsAppLink }) => {
  return (
    <div className="md:hidden space-y-4">
      {Array.isArray(users) && users.length > 0 ? (
        users.map((user) => {
          const birthdayToday = isBirthdayToday(user.dob);
          return (
            <div 
              key={user._id} 
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                birthdayToday ? "border-l-4 border-yellow-400" : ""
              }`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${birthdayToday ? "bg-yellow-400" : "bg-green-400"}`}></div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {birthdayToday ? `${user.name} 🥳` : user.name}
                    </h3>
                  </div>
                  <a
                    href={generateWhatsAppLink(user)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:text-green-700"
                  >
                    <FaWhatsapp size={24} />
                  </a>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium">{user.phone}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Date of Birth</span>
                    <span className="font-medium">{formatDate(user.dob)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Visits</span>
                    <span className="font-medium">{user.visitCount || 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Last Visit</span>
                    <span className="font-medium">{formatRelativeTime(user.lastVisit)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
          No users found
        </div>
      )}
    </div>
  );
};

export default UserCards; 
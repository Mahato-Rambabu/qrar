import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const UserTable = ({ users, isBirthdayToday, formatDate, formatRelativeTime, generateWhatsAppLink }) => {
  return (
    <div className="hidden md:block">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <th className="py-4 px-6 text-left font-semibold">Name</th>
            <th className="py-4 px-6 text-left font-semibold">Phone</th>
            <th className="py-4 px-6 text-left font-semibold">Date of Birth</th>
            <th className="py-4 px-6 text-left font-semibold">Visits</th>
            <th className="py-4 px-6 text-left font-semibold">Last Visit</th>
            <th className="py-4 px-6 text-left font-semibold">Send</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => {
              const birthdayToday = isBirthdayToday(user.dob);
              return (
                <tr
                  key={user._id}
                  className={`border-b hover:bg-gray-50 transition-colors duration-200 ${
                    birthdayToday ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${birthdayToday ? "bg-yellow-400" : "bg-green-400"}`}></div>
                      {birthdayToday ? ` ${user.name} 🥳` : user.name}
                    </div>
                  </td>
                  <td className="py-4 px-6">{user.phone}</td>
                  <td className="py-4 px-6">
                    {formatDate(user.dob)}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {user.visitCount || 0}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {formatRelativeTime(user.lastVisit)}
                  </td>
                  <td className="py-4 px-6">
                    <a
                      href={generateWhatsAppLink(user)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-500 hover:text-green-700 flex items-center transition-colors duration-200"
                    >
                      <FaWhatsapp size={28} />
                    </a>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="py-8 text-center bg-gray-50 text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable; 
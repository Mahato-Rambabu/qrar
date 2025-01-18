import React from 'react';

const SummaryCard = ({ title, value, subtitle, color, percentage, onClick }) => {
  return (
    <div
      className={`p-4 rounded-lg border-2 border-dashed ${color} cursor-pointer `}
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
        <div className="w-full md:w-auto">
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        {percentage && (
          <div
            className="flex items-center justify-center w-12 h-12 md:w-10 md:h-10 rounded-full bg-green-100 text-green-600 mt-2 md:mt-0"
          >
            <span className="text-sm font-medium">{percentage}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;

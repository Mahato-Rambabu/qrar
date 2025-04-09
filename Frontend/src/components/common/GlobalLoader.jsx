import React from 'react';

const GlobalLoader = ({ message = "Loading...", subMessage = "Just a moment" }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="relative">
            {/* Animated plate with food */}
            <div className="w-16 h-16 relative">
              {/* Plate base */}
              <div className="absolute inset-0 rounded-full border-4 border-gray-300 animate-pulse"></div>
              {/* Animated steam effect */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-1">
                  <div className="w-1 h-3 bg-gray-400 rounded-full animate-steam" 
                       style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-3 bg-gray-400 rounded-full animate-steam" 
                       style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-3 bg-gray-400 rounded-full animate-steam" 
                       style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
              {/* Food items */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" 
                       style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" 
                       style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" 
                       style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium">{message}</p>
            <p className="text-sm text-gray-500 mt-1">{subMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add the steam animation styles
const styles = `
  @keyframes steam {
    0% {
      transform: translateY(0) scaleX(1);
      opacity: 0;
    }
    50% {
      transform: translateY(-8px) scaleX(1.2);
      opacity: 0.7;
    }
    100% {
      transform: translateY(-12px) scaleX(1);
      opacity: 0;
    }
  }

  .animate-steam {
    animation: steam 1.5s infinite;
  }
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default GlobalLoader; 
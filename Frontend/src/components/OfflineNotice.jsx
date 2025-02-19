import React, { useEffect, useState } from 'react';

const OfflineNotice = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-red-600 text-white text-center p-2 fixed top-0 w-full z-50">
      No internet connection. Please check your connection.
    </div>
  );
};

export default OfflineNotice;

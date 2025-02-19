// QR Code Generator Component
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const QRCodeGenerator = () => {
    const [qrCodeImage, setQrCodeImage] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [error, setError] = useState('');
  
    useEffect(() => {
      const fetchQRCode = async () => {

  
        try {
          const response = await axiosInstance.get('/generate-qr');
          setQrCodeImage(response.data.qrCodeImage);
          setQrCodeUrl(response.data.qrCodeUrl);
        } catch (err) {
          console.error('Error fetching QR Code:', err.message);
          setError('Failed to fetch QR Code. Please try again later.');
        }
      };
  
      fetchQRCode();
    }, []);
  
    const handleDownload = () => {
      const link = document.createElement('a');
      link.href = qrCodeImage;
      link.download = 'qr-code.png';
      link.click();
    };
  
    if (error) return <p className="text-red-500">{error}</p>;
  
    return (
      <div className="qr-code-generator pt-[10%] text-center">
        <h2 className="text-2xl font-semibold mb-4">QR Code for Restaurant</h2>
        {qrCodeImage ? (
          <div>
            <img src={qrCodeImage} alt="QR Code" className="mx-auto mb-4" />
            <p className="mb-4">URL: <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{qrCodeUrl}</a></p>
            <button 
              onClick={handleDownload} 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg">
              Download QR Code
            </button>
          </div>
        ) : (
          <p>Loading QR Code...</p>
        )}
      </div>
    );
  };
  
  export default QRCodeGenerator;
  
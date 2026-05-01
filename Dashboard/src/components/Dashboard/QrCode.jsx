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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

        .qr-wrapper {
          min-height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #f8fafc;
        }

        .qr-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 24px rgba(15,23,42,0.06), 0 1px 4px rgba(37,99,235,0.04);
          text-align: center;
          animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .qr-icon-wrap {
          width: 52px; height: 52px;
          background: #eff6ff;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.25rem;
        }

        .qr-icon-wrap svg { width: 26px; height: 26px; color: #2563eb; }

        .qr-tag {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #2563eb;
          margin-bottom: 0.4rem;
        }

        .qr-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.55rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin-bottom: 0.4rem;
        }

        .qr-subtitle {
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 400;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        /* QR Image container */
        .qr-image-box {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qr-image-box img {
          width: 100%;
          max-width: 200px;
          border-radius: 8px;
        }

        /* URL chip */
        .qr-url-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 10px;
          padding: 0.65rem 1rem;
          margin-bottom: 1.5rem;
          text-align: left;
        }

        .qr-url-icon {
          flex-shrink: 0;
          width: 18px; height: 18px;
          color: #2563eb;
        }

        .qr-url-link {
          font-size: 0.75rem;
          color: #1d4ed8;
          font-weight: 500;
          text-decoration: none;
          word-break: break-all;
          flex: 1;
        }
        .qr-url-link:hover { text-decoration: underline; }

        /* Download button */
        .qr-btn {
          width: 100%;
          padding: 0.88rem 1.5rem;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.86rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        }

        .qr-btn:hover {
          opacity: 0.92;
          box-shadow: 0 8px 22px rgba(37,99,235,0.38);
          transform: translateY(-1px);
        }

        .qr-btn:active { transform: translateY(0); }

        .qr-btn svg { width: 16px; height: 16px; }

        /* Loading state */
        .qr-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem 0;
        }

        .qr-spinner-ring {
          width: 40px; height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .qr-loading-text {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
        }

        /* Error state */
        .qr-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 0.85rem 1rem;
          font-size: 0.8rem;
          color: #b91c1c;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .qr-error svg { width: 16px; height: 16px; flex-shrink: 0; }
      `}</style>

      <div className="qr-wrapper">
        <div className="qr-card">
          <div className="qr-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
            </svg>
          </div>

          <p className="qr-tag">Table Access</p>
          <h2 className="qr-title">Restaurant QR Code</h2>
          <p className="qr-subtitle">Share this QR code with customers to give them instant access to your digital menu.</p>

          {error ? (
            <div className="qr-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          ) : qrCodeImage ? (
            <>
              <div className="qr-image-box">
                <img src={qrCodeImage} alt="Restaurant QR Code" />
              </div>

              {qrCodeUrl && (
                <div className="qr-url-row">
                  <svg className="qr-url-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                  </svg>
                  <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer" className="qr-url-link">
                    {qrCodeUrl}
                  </a>
                </div>
              )}

              <button onClick={handleDownload} className="qr-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download QR Code
              </button>
            </>
          ) : (
            <div className="qr-loading">
              <div className="qr-spinner-ring" />
              <p className="qr-loading-text">Generating your QR code...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QRCodeGenerator;
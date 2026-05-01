import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', number: '', address: '', taxType: 'none', taxPercentage: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'taxType') {
      setFormData((prev) => ({ ...prev, taxType: value, taxPercentage: value === 'exclusive' ? prev.taxPercentage : '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      let requestData = { ...formData };
      if (formData.taxType !== 'exclusive') delete requestData.taxPercentage;
      await axiosInstance.post('/restaurants/register', requestData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const filled = Object.values(formData).filter(Boolean).length;
  const total = 6 + (formData.taxType === 'exclusive' ? 1 : 0);
  const progress = Math.min(100, Math.round((filled / total) * 100));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=Sora:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .r-root {
          min-height: 100vh;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          background: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          overflow: hidden;
        }

        /* ── Left Visual Panel ── */
        .r-visual {
          position: relative;
          background: linear-gradient(160deg, #eff6ff 0%, #dbeafe 60%, #bfdbfe 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          overflow: hidden;
        }

        .r-visual::before {
          content: '';
          position: absolute;
          top: -60px; left: -60px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(37,99,235,0.08);
          pointer-events: none;
        }

        .r-visual::after {
          content: '';
          position: absolute;
          bottom: -100px; right: -100px;
          width: 400px; height: 400px;
          border-radius: 50%;
          border: 1.5px solid rgba(37,99,235,0.15);
          pointer-events: none;
        }

        .r-visual-texture {
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 30px,
            rgba(37,99,235,0.025) 30px,
            rgba(37,99,235,0.025) 31px
          );
          pointer-events: none;
        }

        .r-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          position: relative;
          z-index: 1;
        }

        .r-brand-logo {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(37,99,235,0.3);
        }
        .r-brand-logo svg { width: 18px; height: 18px; fill: #fff; }

        .r-brand-name {
          font-family: 'Sora', sans-serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .r-visual-hero {
          position: relative;
          z-index: 1;
        }

        .r-visual-tag {
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #2563eb;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .r-visual-tag::before { content: ''; width: 22px; height: 2px; background: #2563eb; border-radius: 2px; }

        .r-visual-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(2rem, 3.5vw, 2.9rem);
          font-weight: 700;
          color: #0f172a;
          line-height: 1.1;
          margin-bottom: 1.2rem;
          letter-spacing: -0.03em;
        }
        .r-visual-title em { font-style: italic; color: #2563eb; font-weight: 600; }

        .r-visual-desc {
          font-size: 0.78rem;
          color: #475569;
          font-weight: 400;
          line-height: 1.75;
          max-width: 280px;
        }

        .r-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        .r-chip {
          background: rgba(37,99,235,0.08);
          border: 1px solid rgba(37,99,235,0.18);
          color: #1d4ed8;
          font-size: 0.67rem;
          font-weight: 500;
          padding: 0.35rem 0.75rem;
          border-radius: 100px;
          letter-spacing: 0.04em;
        }

        .r-visual-footer {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 2rem;
        }

        .r-stat-num {
          font-family: 'Sora', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #2563eb;
          display: block;
          letter-spacing: -0.03em;
        }

        .r-stat-label {
          font-size: 0.6rem;
          color: #64748b;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* ── Right: Form Panel ── */
        .r-form-side {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2.5rem 4rem;
          overflow-y: auto;
          background: #ffffff;
          position: relative;
        }

        .r-form-side::before {
          content: '';
          position: absolute;
          bottom: -80px; right: -80px;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .r-card {
          width: 100%;
          max-width: 460px;
          padding: 3rem 0;
          animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
          position: relative;
          z-index: 1;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .r-card-tag {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #2563eb;
          margin-bottom: 0.5rem;
        }

        .r-card-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          font-weight: 700;
          color: #0f172a;
          line-height: 1.12;
          margin-bottom: 0.4rem;
          letter-spacing: -0.025em;
        }
        .r-card-title em { font-style: italic; color: #2563eb; font-weight: 600; }

        .r-card-sub {
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 400;
          margin-bottom: 1.5rem;
        }

        /* Progress */
        .r-progress-wrap { margin-bottom: 2rem; }

        .r-progress-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.45rem;
        }

        .r-progress-label {
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 500;
        }

        .r-progress-pct {
          font-size: 0.62rem;
          color: #2563eb;
          font-weight: 600;
        }

        .r-progress-track {
          height: 3px;
          background: #e2e8f0;
          border-radius: 2px;
          overflow: hidden;
        }

        .r-progress-fill {
          height: 100%;
          background: linear-gradient(to right, #2563eb, #60a5fa);
          border-radius: 2px;
          transition: width 0.4s ease;
        }

        /* Section heads */
        .r-section {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #2563eb;
          margin: 1.75rem 0 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .r-section::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }

        /* Alerts */
        .r-alert {
          padding: 0.7rem 1rem;
          border-radius: 8px;
          font-size: 0.78rem;
          margin-bottom: 1.5rem;
          border-left: 3px solid;
          font-weight: 500;
        }
        .r-alert-error { background: #fef2f2; border-color: #ef4444; color: #b91c1c; }
        .r-alert-success { background: #f0fdf4; border-color: #22c55e; color: #15803d; }

        /* Form */
        .r-grid { display: grid; gap: 1rem; }
        .r-grid-2 { grid-template-columns: 1fr 1fr; }

        .r-group { display: flex; flex-direction: column; }

        .r-label {
          font-size: 0.67rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #475569;
          margin-bottom: 0.45rem;
        }

        .r-input-wrap { position: relative; }

        .r-input, .r-select, .r-textarea {
          width: 100%;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.78rem 1rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.85rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          font-weight: 400;
          appearance: none;
          -webkit-appearance: none;
        }

        .r-input::placeholder, .r-textarea::placeholder { color: #94a3b8; }

        .r-input:focus, .r-select:focus, .r-textarea:focus {
          background: #ffffff;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }

        .r-textarea { resize: none; min-height: 78px; }

        .r-select-wrap { position: relative; }
        .r-select-wrap::after {
          content: '';
          position: absolute;
          right: 0.9rem; top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid #2563eb;
          pointer-events: none;
        }

        .r-select { padding-right: 2.5rem; cursor: pointer; }
        .r-select option { background: #fff; color: #0f172a; }

        .r-eye-btn {
          position: absolute;
          right: 0.9rem; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; color: #94a3b8;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .r-eye-btn:hover { color: #2563eb; }

        /* Submit */
        .r-btn {
          width: 100%;
          padding: 0.92rem;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.86rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          margin-top: 1.75rem;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35);
        }
        .r-btn:hover:not(:disabled) {
          opacity: 0.92;
          box-shadow: 0 8px 22px rgba(37,99,235,0.4);
          transform: translateY(-1px);
        }
        .r-btn:active:not(:disabled) { transform: translateY(0); }
        .r-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .r-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .r-footer {
          text-align: center;
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 400;
          margin-top: 1.5rem;
        }
        .r-footer a { color: #2563eb; font-weight: 600; text-decoration: none; }
        .r-footer a:hover { text-decoration: underline; }

        /* Responsive */
        @media (max-width: 900px) {
          .r-root { grid-template-columns: 1fr; }
          .r-visual { display: none; }
          .r-form-side { padding: 2rem 1.5rem; }
          .r-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="r-root">
        {/* ── Left: Visual ── */}
        <div className="r-visual">
          <div className="r-visual-texture" />

          <div className="r-brand">
            <div className="r-brand-logo">
              <svg viewBox="0 0 24 24"><path d="M12 2C8 2 5 5 5 9c0 2.4 1.1 4.5 2.8 5.9L7 20h10l-.8-5.1C17.9 13.5 19 11.4 19 9c0-4-3-7-7-7zm0 2c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5zm-2 14l.5-3.2c.5.1 1 .2 1.5.2s1-.1 1.5-.2L13.5 18h-3.5z"/></svg>
            </div>
            <span className="r-brand-name">NexaDine</span>
          </div>

          <div className="r-visual-hero">
            <div className="r-visual-tag">Get started</div>
            <h1 className="r-visual-title">Your table<br />is <em>ready.</em></h1>
            <p className="r-visual-desc">
             Build your own ordering system, reduce commission, and grow your restaurant with NexaDine.
            </p>
            <div className="r-chips">
              {['Order Tracking', 'Menu Builder', 'Tax Config', 'Analytics', 'QR Menus', 'Add Offers', 'Push Notification', 'User Management '].map(c => (
                <span className="r-chip" key={c}>{c}</span>
              ))}
            </div>
          </div>

          <div className="r-visual-footer">
            {[['2+', 'Restaurants'], ['99.9%', 'Uptime'], ['4.9★', 'Rating']].map(([num, label]) => (
              <div key={label}>
                <span className="r-stat-num">{num}</span>
                <span className="r-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div className="r-form-side">
          <div className="r-card">
            <p className="r-card-tag">New restaurant</p>
            <h2 className="r-card-title">Create your <em>account</em></h2>
            <p className="r-card-sub">Set up your restaurant in under 2 minutes.</p>

            {/* Progress */}
            <div className="r-progress-wrap">
              <div className="r-progress-meta">
                <span className="r-progress-label">Profile completion</span>
                <span className="r-progress-pct">{progress}%</span>
              </div>
              <div className="r-progress-track">
                <div className="r-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {error && <div className="r-alert r-alert-error">{error}</div>}
            {success && <div className="r-alert r-alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              {/* Account */}
              <div className="r-section">Account</div>
              <div className="r-grid">
                <div className="r-group">
                  <label className="r-label">Restaurant Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="r-input" placeholder="The Golden Fork" />
                </div>
                <div className="r-group">
                  <label className="r-label">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="r-input" placeholder="hello@restaurant.com" />
                </div>
                <div className="r-group">
                  <label className="r-label">Password</label>
                  <div className="r-input-wrap">
                    <input
                      type={showPass ? 'text' : 'password'}
                      name="password" value={formData.password}
                      onChange={handleChange} required className="r-input"
                      placeholder="••••••••"
                      style={{ paddingRight: '2.8rem' }}
                    />
                    <button type="button" className="r-eye-btn" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                      {showPass ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="r-section">Contact</div>
              <div className="r-grid">
                <div className="r-group">
                  <label className="r-label">Phone Number</label>
                  <input type="text" name="number" value={formData.number} onChange={handleChange} required className="r-input" placeholder="+91 98765 43210" />
                </div>
                <div className="r-group">
                  <label className="r-label">Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} required className="r-textarea" placeholder="123 Main Street, City" />
                </div>
              </div>

              {/* Tax */}
              <div className="r-section">Tax Configuration</div>
              <div className={`r-grid ${formData.taxType === 'exclusive' ? 'r-grid-2' : ''}`}>
                <div className="r-group">
                  <label className="r-label">Tax Type</label>
                  <div className="r-select-wrap">
                    <select name="taxType" value={formData.taxType} onChange={handleChange} required className="r-select">
                      <option value="none">None</option>
                      <option value="inclusive">Inclusive</option>
                      <option value="exclusive">Exclusive</option>
                    </select>
                  </div>
                </div>
                {formData.taxType === 'exclusive' && (
                  <div className="r-group">
                    <label className="r-label">Tax Percentage (%)</label>
                    <input type="number" name="taxPercentage" value={formData.taxPercentage} onChange={handleChange} required className="r-input" placeholder="18" min="0" max="100" />
                  </div>
                )}
              </div>

              <button type="submit" className="r-btn" disabled={loading}>
                {loading ? <><span className="r-spinner" /> Creating account...</> : 'Create Account'}
              </button>
            </form>

            <p className="r-footer">
              Already have an account? <a href="/login">Sign in here</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
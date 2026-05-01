import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await axiosInstance.post('/restaurants/login', formData, { withCredentials: true });
      setSuccess('Login successful! Redirecting...');
      localStorage.setItem('authToken', response.data.token);
      setTimeout(() => navigate('/'));
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=Sora:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .l-root {
          min-height: 100vh;
          width: 100%;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          background: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          overflow: hidden;
        }

        /* ── Left: Form side ── */
        .l-form-side {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 4rem 5rem;
          background: #ffffff;
          position: relative;
          z-index: 1;
        }

        .l-form-side::before {
          content: '';
          position: absolute;
          top: -100px; left: -100px;
          width: 350px; height: 350px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .l-form-side::after {
          content: '';
          position: absolute;
          bottom: -60px; right: 80px;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,179,237,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .l-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 3.5rem;
          position: relative;
          z-index: 1;
        }

        .l-brand-logo {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(37,99,235,0.3);
        }

        .l-brand-logo svg { width: 18px; height: 18px; fill: #fff; }

        .l-brand-name {
          font-family: 'Sora', sans-serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .l-card {
          position: relative;
          z-index: 1;
          animation: slideIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .l-greeting {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #2563eb;
          margin-bottom: 0.6rem;
        }

        .l-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(2rem, 3.5vw, 2.7rem);
          font-weight: 700;
          color: #0f172a;
          line-height: 1.12;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .l-title span {
          color: #2563eb;
        }

        .l-subtitle {
          font-size: 0.83rem;
          color: #64748b;
          font-weight: 400;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        /* Alerts */
        .l-alert {
          padding: 0.7rem 1rem;
          border-radius: 8px;
          font-size: 0.78rem;
          margin-bottom: 1.5rem;
          font-weight: 500;
          border-left: 3px solid;
        }
        .l-alert-error { background: #fef2f2; border-color: #ef4444; color: #b91c1c; }
        .l-alert-success { background: #f0fdf4; border-color: #22c55e; color: #15803d; }

        /* Form */
        .l-form-group { margin-bottom: 1.25rem; }

        .l-label {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #475569;
          margin-bottom: 0.5rem;
        }

        .l-input-wrap { position: relative; }

        .l-input {
          width: 100%;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.82rem 1rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.88rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          font-weight: 400;
        }

        .l-input::placeholder { color: #94a3b8; }

        .l-input:focus {
          background: #ffffff;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }

        .l-eye-btn {
          position: absolute;
          right: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 0.2rem;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .l-eye-btn:hover { color: #2563eb; }

        /* Forgot */
        .l-forgot {
          text-align: right;
          margin-top: -0.5rem;
          margin-bottom: 1.5rem;
        }
        .l-forgot a {
          font-size: 0.72rem;
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }
        .l-forgot a:hover { text-decoration: underline; }

        /* Submit */
        .l-btn {
          width: 100%;
          padding: 0.9rem;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.86rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35);
        }

        .l-btn:hover:not(:disabled) {
          opacity: 0.92;
          box-shadow: 0 8px 22px rgba(37,99,235,0.4);
          transform: translateY(-1px);
        }
        .l-btn:active:not(:disabled) { transform: translateY(0); }
        .l-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .l-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .l-divider {
          display: flex; align-items: center; gap: 1rem;
          margin: 1.5rem 0;
        }
        .l-divider::before, .l-divider::after {
          content: ''; flex: 1; height: 1px; background: #e2e8f0;
        }
        .l-divider span {
          font-size: 0.68rem; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase;
        }

        .l-footer {
          text-align: center;
          font-size: 0.78rem;
          color: #64748b;
          font-weight: 400;
        }
        .l-footer a {
          color: #2563eb; font-weight: 600; text-decoration: none;
        }
        .l-footer a:hover { text-decoration: underline; }

        /* ── Right: Visual side ── */
        .l-visual-side {
          position: relative;
          background: linear-gradient(145deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 3rem;
        }

        /* Geometric background art */
        .l-geo {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .l-geo-circle1 {
          position: absolute;
          top: -80px; right: -80px;
          width: 340px; height: 340px;
          border-radius: 50%;
          border: 1.5px solid rgba(37,99,235,0.15);
        }
        .l-geo-circle2 {
          position: absolute;
          top: -40px; right: -40px;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: rgba(37,99,235,0.08);
        }
        .l-geo-circle3 {
          position: absolute;
          bottom: -100px; left: -100px;
          width: 380px; height: 380px;
          border-radius: 50%;
          border: 1.5px solid rgba(37,99,235,0.12);
        }
        .l-geo-rect {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%) rotate(15deg);
          width: 280px; height: 280px;
          border: 1px solid rgba(37,99,235,0.08);
          border-radius: 28px;
        }
        .l-geo-dot1, .l-geo-dot2, .l-geo-dot3 {
          position: absolute;
          border-radius: 50%;
          background: rgba(37,99,235,0.15);
        }
        .l-geo-dot1 { width: 10px; height: 10px; top: 30%; left: 20%; }
        .l-geo-dot2 { width: 6px; height: 6px; top: 65%; right: 25%; }
        .l-geo-dot3 { width: 14px; height: 14px; bottom: 20%; left: 35%; }

        /* Floating card */
        .l-visual-card {
          position: relative;
          z-index: 1;
          background: #ffffff;
          border-radius: 20px;
          padding: 2.5rem;
          width: 100%;
          max-width: 320px;
          box-shadow: 0 20px 60px rgba(15,23,42,0.10), 0 4px 16px rgba(37,99,235,0.08);
          animation: floatCard 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both;
          border: 1px solid rgba(226,232,240,0.8);
        }

        @keyframes floatCard {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .l-vc-label {
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #2563eb;
          margin-bottom: 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .l-vc-label::before {
          content: '';
          width: 20px; height: 2px;
          background: #2563eb;
          border-radius: 2px;
        }

        .l-vc-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.65rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
          margin-bottom: 1.2rem;
          letter-spacing: -0.02em;
        }
        .l-vc-title em { font-style: italic; color: #2563eb; font-weight: 600; }

        .l-vc-features {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.8rem;
        }

        .l-vc-feature {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.75rem;
          color: #475569;
          font-weight: 400;
        }

        .l-vc-feat-icon {
          width: 26px; height: 26px;
          background: #eff6ff;
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .l-vc-feat-icon svg { width: 13px; height: 13px; }

        .l-vc-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid #f1f5f9;
        }

        .l-vc-stat {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .l-vc-stat-num {
          font-family: 'Sora', sans-serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: #2563eb;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .l-vc-stat-label {
          font-size: 0.6rem;
          color: #94a3b8;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* Responsive */
        @media (max-width: 860px) {
          .l-root { grid-template-columns: 1fr; }
          .l-visual-side { display: none; }
          .l-form-side { padding: 3rem 2rem; }
        }
      `}</style>

      <div className="l-root">
        {/* ── Left: Form ── */}
        <div className="l-form-side">
          <div className="l-brand">
            <div className="l-brand-logo">
              <svg viewBox="0 0 24 24"><path d="M12 2C8 2 5 5 5 9c0 2.4 1.1 4.5 2.8 5.9L7 20h10l-.8-5.1C17.9 13.5 19 11.4 19 9c0-4-3-7-7-7zm0 2c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5zm-2 14l.5-3.2c.5.1 1 .2 1.5.2s1-.1 1.5-.2L13.5 18h-3.5z"/></svg>
            </div>
            <span className="l-brand-name">NexaDine</span>
          </div>

          <div className="l-card">
            <p className="l-greeting">Welcome back</p>
            <h1 className="l-title">Sign in to your <span>kitchen</span></h1>
            <p className="l-subtitle">Manage your restaurant from one beautiful dashboard.</p>

            {error && <div className="l-alert l-alert-error">{error}</div>}
            {success && <div className="l-alert l-alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="l-form-group">
                <label className="l-label">Email Address</label>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} required className="l-input"
                  placeholder="you@restaurant.com"
                />
              </div>

              <div className="l-form-group">
                <label className="l-label">Password</label>
                <div className="l-input-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    name="password" value={formData.password}
                    onChange={handleChange} required className="l-input"
                    placeholder="••••••••"
                    style={{ paddingRight: '2.8rem' }}
                  />
                  <button type="button" className="l-eye-btn" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="l-forgot"><a href="#">Forgot password?</a></div>

              <button type="submit" className="l-btn" disabled={loading}>
                {loading ? <><span className="l-spinner" /> Signing in...</> : 'Sign In'}
              </button>
            </form>

            <div className="l-divider"><span>or</span></div>
            <p className="l-footer">
              New to NexaDine? <a href="/register">Create an account</a>
            </p>
          </div>
        </div>

        {/* ── Right: Visual ── */}
        <div className="l-visual-side">
          <div className="l-geo">
            <div className="l-geo-circle1" />
            <div className="l-geo-circle2" />
            <div className="l-geo-circle3" />
            <div className="l-geo-rect" />
            <div className="l-geo-dot1" />
            <div className="l-geo-dot2" />
            <div className="l-geo-dot3" />
          </div>

          <div className="l-visual-card">
            <div className="l-vc-label">Restaurant OS</div>
            <h2 className="l-vc-title">Run your kitchen <em>effortlessly</em></h2>

            <div className="l-vc-features">
              {[
                { icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>, label: 'Live order tracking dashboard' },
                { icon: <path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>, label: 'Menu & inventory management' },
                { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, label: 'Secure & reliable platform' },
              ].map(({ icon, label }) => (
                <div className="l-vc-feature" key={label}>
                  <span className="l-vc-feat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                  </span>
                  {label}
                </div>
              ))}
            </div>

            <div className="l-vc-stats">
              {[['2+', 'Restaurants'], ['99.9%', 'Uptime'], ['14s', 'Avg. Order'], ['4.9★', 'Rating']].map(([num, label]) => (
                <div className="l-vc-stat" key={label}>
                  <span className="l-vc-stat-num">{num}</span>
                  <span className="l-vc-stat-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
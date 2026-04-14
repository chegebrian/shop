import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../../utils/api';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm_password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email) { toast.error('Please fill in your name and email'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) { toast.error('Please enter a valid email address'); return; }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/register-merchant', { full_name: form.full_name, email: form.email, password: form.password });
      toast.success('Account created! Check your email for a welcome message 🎉');
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.error || 'Signup failed';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const res = await api.post('/auth/google-login', { token: tokenResponse.access_token });
        const { access_token, user: userData, message } = res.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success(message || 'Account created with Google ✅');
        navigate('/merchant/dashboard');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Google signup failed');
      } finally { setGoogleLoading(false); }
    },
    onError: () => toast.error('Google signup cancelled'),
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: "'Segoe UI', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Background circles */}
      {[
        { w: 500, h: 500, top: '-150px', left: '-150px', color: 'rgba(102,126,234,0.15)' },
        { w: 350, h: 350, bottom: '-100px', right: '-100px', color: 'rgba(240,147,251,0.12)' },
        { w: 200, h: 200, top: '40%', right: '10%', color: 'rgba(253,160,133,0.1)' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', width: b.w, height: b.h, borderRadius: '50%',
          background: b.color, top: b.top, left: b.left, bottom: b.bottom, right: b.right,
          filter: 'blur(40px)'
        }} />
      ))}

      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        .signup-card { animation: slideUp 0.5s ease forwards; }
        .google-btn:hover { transform:translateY(-2px); box-shadow:0 8px 25px rgba(0,0,0,0.2) !important; }
        .next-btn:hover { transform:translateY(-2px); }
        .input-glow:focus { border-color:#a78bfa !important; box-shadow:0 0 0 3px rgba(167,139,250,0.2) !important; outline:none; }
        .step-pill { transition: all 0.3s; }
      `}</style>

      <div className="signup-card" style={{
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px)',
        borderRadius: '28px', padding: '48px 40px',
        width: '100%', maxWidth: '460px',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)'
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '72px', height: '72px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #a78bfa, #f093fb)',
            borderRadius: '20px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '32px',
            boxShadow: '0 8px 32px rgba(167,139,250,0.4)'
          }}>📦</div>
          <h1 style={{
            margin: 0, fontSize: '26px', fontWeight: '800', color: '#fff',
          }}>Create Account</h1>
          <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
            Join StockManager Pro today
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
          {[1, 2].map(s => (
            <div key={s} className="step-pill" style={{
              height: '4px', borderRadius: '2px', transition: 'all 0.3s',
              width: step >= s ? '40px' : '20px',
              background: step >= s ? 'linear-gradient(90deg, #a78bfa, #f093fb)' : 'rgba(255,255,255,0.2)'
            }} />
          ))}
        </div>

        {/* Google Button */}
        <button className="google-btn" type="button" onClick={() => handleGoogleSignup()} disabled={googleLoading}
          style={{
            width: '100%', padding: '13px', background: 'rgba(255,255,255,0.95)',
            border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
            color: '#374151', cursor: googleLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', marginBottom: '20px', transition: 'all 0.2s',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {googleLoading ? 'Connecting...' : 'Sign up with Google'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={handleNext}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>
                Full Name *
              </label>
              <input className="input-glow" type="text" name="full_name" placeholder="John Doe"
                value={form.full_name} onChange={handleChange} required
                style={{
                  width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.08)',
                  border: '2px solid rgba(255,255,255,0.15)', borderRadius: '10px',
                  fontSize: '14px', color: '#fff', boxSizing: 'border-box', transition: 'all 0.2s'
                }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>
                Email Address *
              </label>
              <input className="input-glow" type="email" name="email" placeholder="you@gmail.com or any email"
                value={form.email} onChange={handleChange} required
                style={{
                  width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.08)',
                  border: '2px solid rgba(255,255,255,0.15)', borderRadius: '10px',
                  fontSize: '14px', color: '#fff', boxSizing: 'border-box', transition: 'all 0.2s'
                }} />
              <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                ✓ Gmail ✓ Yahoo ✓ Outlook ✓ Any email provider
              </p>
            </div>
            <button className="next-btn" type="submit"
              style={{
                width: '100%', padding: '13px',
                background: 'linear-gradient(135deg, #a78bfa, #f093fb)',
                color: '#fff', border: 'none', borderRadius: '12px',
                fontSize: '15px', fontWeight: '700', cursor: 'pointer',
                transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(167,139,250,0.4)'
              }}>
              Next Step →
            </button>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div style={{
              padding: '12px 14px', background: 'rgba(167,139,250,0.15)',
              border: '1px solid rgba(167,139,250,0.3)', borderRadius: '10px',
              marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>👤</span>
              <div>
                <p style={{ margin: 0, color: '#fff', fontSize: '14px', fontWeight: '600' }}>{form.full_name}</p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{form.email}</p>
              </div>
              <button type="button" onClick={() => setStep(1)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px' }}>
                Edit
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>
                Password *
              </label>
              <input className="input-glow" type="password" name="password" placeholder="Min 6 characters"
                value={form.password} onChange={handleChange} required
                style={{
                  width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.08)',
                  border: '2px solid rgba(255,255,255,0.15)', borderRadius: '10px',
                  fontSize: '14px', color: '#fff', boxSizing: 'border-box', transition: 'all 0.2s'
                }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>
                Confirm Password *
              </label>
              <input className="input-glow" type="password" name="confirm_password" placeholder="Repeat password"
                value={form.confirm_password} onChange={handleChange} required
                style={{
                  width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.08)',
                  border: '2px solid rgba(255,255,255,0.15)', borderRadius: '10px',
                  fontSize: '14px', color: '#fff', boxSizing: 'border-box', transition: 'all 0.2s'
                }} />
            </div>
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? 'rgba(167,139,250,0.5)' : 'linear-gradient(135deg, #a78bfa, #f093fb)',
                color: '#fff', border: 'none', borderRadius: '12px',
                fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 20px rgba(167,139,250,0.4)'
              }}>
              {loading ? 'Creating account...' : 'Create Account 🎉'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '20px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a78bfa', fontWeight: '600', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

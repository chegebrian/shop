import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../../utils/api';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (user) redirectByRole(user.role); }, [user]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const redirectByRole = (role) => {
    if (role === 'merchant') navigate('/merchant/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/clerk/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back! 👋`);
      redirectByRole(result.payload.user.role);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      try {
        const res = await api.post('/auth/google-login', { token: tokenResponse.access_token });
        const { access_token, user: userData, message } = res.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        dispatch({ type: 'auth/login/fulfilled', payload: { token: access_token, user: userData } });
        toast.success(message || 'Logged in with Google ✅');
        redirectByRole(userData.role);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Google login failed');
      } finally { setGoogleLoading(false); }
    },
    onError: () => { toast.error('Google login cancelled'); setGoogleLoading(false); }
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #fda085 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)', top: '-100px', left: '-100px',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)', bottom: '-80px', right: '-80px',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200%} 100%{background-position:200%} }
        .login-card { animation: slideUp 0.6s ease forwards; }
        .google-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important; }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(102,126,234,0.5) !important; }
        .input-field:focus { border-color: #667eea !important; box-shadow: 0 0 0 3px rgba(102,126,234,0.15) !important; outline: none; }
      `}</style>

      <div className="login-card" style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px', padding: '48px 40px',
        width: '100%', maxWidth: '440px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.6)'
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '72px', height: '72px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '20px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '32px',
            boxShadow: '0 8px 24px rgba(102,126,234,0.4)'
          }}>📦</div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#1a1a2e',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            StockManager Pro
          </h1>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '14px' }}>
            Sign in to your account
          </p>
        </div>

        {/* Google Button */}
        <button className="google-btn" onClick={() => handleGoogleLogin()} disabled={googleLoading}
          style={{
            width: '100%', padding: '13px', background: '#fff',
            border: '2px solid #e2e8f0', borderRadius: '12px',
            fontSize: '15px', fontWeight: '600', color: '#374151',
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', marginBottom: '20px', transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #e2e8f0)' }} />
          <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #e2e8f0)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Email Address
            </label>
            <input className="input-field" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              style={{
                width: '100%', padding: '11px 14px', border: '2px solid #e2e8f0',
                borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box',
                transition: 'all 0.2s', background: '#f8fafc'
              }} />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                style={{
                  width: '100%', padding: '11px 44px 11px 14px', border: '2px solid #e2e8f0',
                  borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box',
                  transition: 'all 0.2s', background: '#f8fafc'
                }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <Link to="/forgot-password" style={{ fontSize: '13px', color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
              Forgot password?
            </Link>
            <Link to="/signup" style={{ fontSize: '13px', color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
              Create account
            </Link>
          </div>

          <button className="submit-btn" type="submit" disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#fff', border: 'none', borderRadius: '12px',
              fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 15px rgba(102,126,234,0.35)'
            }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '20px' }}>
          Admin or Clerk? Use your <strong>invite link</strong> to register.
        </p>
      </div>
    </div>
  );
};

export default Login;

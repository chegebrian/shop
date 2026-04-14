import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const GoogleLoginButton = ({ label = 'Continue with Google' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const redirectByRole = (role) => {
    if (role === 'merchant') navigate('/merchant/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'clerk') navigate('/clerk/dashboard');
    else navigate('/login');
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Get user info from Google using the access token
        const userInfoRes = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        const userInfo = await userInfoRes.json();

        // Send to our backend
        const res = await api.post('/auth/google', {
          token: tokenResponse.access_token,
          email: userInfo.email,
          name: userInfo.name,
          google_id: userInfo.sub,
        });

        const { access_token, user } = res.data;

        // Save to localStorage
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));

        toast.success(`Welcome, ${user.full_name}! 👋`);
        redirectByRole(user.role);

      } catch (error) {
        toast.error(
          error.response?.data?.error || 'Google login failed. Try again.'
        );
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error('Google login was cancelled or failed.');
      setLoading(false);
    },
  });

  return (
    <button
      onClick={() => handleGoogleLogin()}
      disabled={loading}
      style={{
        width: '100%',
        padding: '11px 16px',
        background: loading ? '#f1f5f9' : '#ffffff',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        if (!loading) e.currentTarget.style.background = '#f8fafc';
      }}
      onMouseLeave={e => {
        if (!loading) e.currentTarget.style.background = '#ffffff';
      }}
    >
      {/* Google icon SVG */}
      {loading ? (
        <div style={{
          width: '18px', height: '18px', border: '2px solid #d1d5db',
          borderTopColor: '#2563eb', borderRadius: '50', animation: 'spin 0.8s linear infinite'
        }} />
      ) : (
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
      )}
      {loading ? 'Signing in...' : label}
    </button>
  );
};

export default GoogleLoginButton;
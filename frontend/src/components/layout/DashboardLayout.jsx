import React from 'react';
import Sidebar from './Sidebar';
import { useSelector } from 'react-redux';

const DashboardLayout = ({ children, title }) => {
  const { user } = useSelector(s => s.auth);

  const roleGradients = {
    merchant: 'linear-gradient(135deg, #667eea, #764ba2)',
    admin: 'linear-gradient(135deg, #11998e, #38ef7d)',
    clerk: 'linear-gradient(135deg, #4facfe, #00f2fe)',
  };

  const gradient = roleGradients[user?.role] || roleGradients.clerk;

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#f0f2f5',
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <Sidebar />

      {/* Main content — offset by sidebar width */}
      <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s' }}>

        {/* Top header bar */}
        {title && (
          <div style={{
            background: gradient,
            padding: '20px 32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <div>
              <h1 style={{
                margin: 0, color: '#fff', fontSize: '22px', fontWeight: '800',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>{title}</h1>
              <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '8px 16px', borderRadius: '20px',
              color: '#fff', fontSize: '13px', fontWeight: '600',
              backdropFilter: 'blur(10px)'
            }}>
              👋 {user?.full_name?.split(' ')[0] || 'User'}
            </div>
          </div>
        )}

        {/* Page content */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

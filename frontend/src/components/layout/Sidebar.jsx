import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  const roleConfig = {
    merchant: {
      color: '#a78bfa',
      gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
      bg: 'rgba(167,139,250,0.15)',
      label: '👑 Merchant',
      links: [
        { to: '/merchant/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/merchant/stores', icon: '🏪', label: 'Stores' },
        { to: '/merchant/users', icon: '👥', label: 'Manage Users' },
        { to: '/merchant/admins', icon: '👔', label: 'Admins' },
        { to: '/merchant/reports', icon: '📈', label: 'Reports' },
      ]
    },
    admin: {
      color: '#34d399',
      gradient: 'linear-gradient(135deg, #34d399, #059669)',
      bg: 'rgba(52,211,153,0.15)',
      label: '👔 Admin',
      links: [
        { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/admin/products', icon: '📦', label: 'Products' },
        { to: '/admin/inventory', icon: '📋', label: 'Inventory' },
        { to: '/admin/supply-requests', icon: '🚚', label: 'Supply Requests' },
        { to: '/admin/clerks', icon: '📝', label: 'Clerks' },
      ]
    },
    clerk: {
      color: '#60a5fa',
      gradient: 'linear-gradient(135deg, #60a5fa, #2563eb)',
      bg: 'rgba(96,165,250,0.15)',
      label: '📝 Clerk',
      links: [
        { to: '/clerk/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/clerk/record-entry', icon: '➕', label: 'Record Entry' },
        { to: '/clerk/my-entries', icon: '📋', label: 'My Entries' },
        { to: '/clerk/supply-requests', icon: '🚚', label: 'Supply Requests' },
      ]
    }
  };

  const config = roleConfig[user?.role] || roleConfig.clerk;
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <>
      <style>{`
        .nav-link { transition: all 0.2s !important; }
        .nav-link:hover { transform: translateX(4px); }
        .nav-link.active { transform: translateX(4px); }
        .logout-btn:hover { background: rgba(239,68,68,0.2) !important; color: #f87171 !important; }
        .collapse-btn:hover { background: rgba(255,255,255,0.1) !important; }
      `}</style>

      <div style={{
        height: '100vh', width: collapsed ? '72px' : '260px',
        background: 'linear-gradient(180deg, #0f0c29 0%, #1a1a3e 50%, #0f0c29 100%)',
        color: '#fff', display: 'flex', flexDirection: 'column',
        position: 'fixed', left: 0, top: 0, zIndex: 100,
        transition: 'width 0.3s ease', overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
        borderRight: '1px solid rgba(255,255,255,0.06)'
      }}>

        {/* Header */}
        <div style={{
          padding: collapsed ? '20px 16px' : '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: config.gradient, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                boxShadow: `0 4px 12px ${config.color}40`
              }}>📦</div>
              <div>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#fff' }}>StockManager</p>
                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Pro Edition</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: config.gradient, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '18px', margin: '0 auto'
            }}>📦</div>
          )}
          {!collapsed && (
            <button className="collapse-btn" onClick={() => setCollapsed(true)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '16px', padding: '4px', borderRadius: '6px' }}>
              ◀
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button className="collapse-btn" onClick={() => setCollapsed(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '16px', padding: '12px', borderRadius: '6px', margin: '8px auto' }}>
            ▶
          </button>
        )}

        {/* User info */}
        <div style={{
          padding: collapsed ? '12px 16px' : '16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
            background: config.gradient, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: '700', fontSize: '14px',
            boxShadow: `0 4px 12px ${config.color}40`
          }}>{initials}</div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.full_name || 'User'}
              </p>
              <span style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                background: config.bg, color: config.color, fontWeight: '600'
              }}>
                {config.label}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '12px', overflowY: 'auto' }}>
          {!collapsed && (
            <p style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '8px 8px 4px', margin: 0 }}>
              NAVIGATION
            </p>
          )}
          {config.links.map((link) => (
            <NavLink key={link.to} to={link.to} className="nav-link"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: collapsed ? '10px' : '10px 12px',
                borderRadius: '10px', marginBottom: '2px',
                textDecoration: 'none', fontSize: '13px', fontWeight: '500',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive ? config.bg : 'transparent',
                color: isActive ? config.color : 'rgba(255,255,255,0.55)',
                borderLeft: isActive ? `3px solid ${config.color}` : '3px solid transparent',
              })}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{link.icon}</span>
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: collapsed ? '12px 8px' : '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button className="logout-btn" onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: '10px', padding: collapsed ? '10px' : '10px 12px',
              borderRadius: '10px', background: 'transparent',
              border: 'none', color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer', fontSize: '13px', fontWeight: '500',
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s'
            }}>
            <span style={{ fontSize: '16px' }}>🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

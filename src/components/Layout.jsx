import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Layout.css';
import ConfirmModal from './ConfirmModel';
import {
  LayoutDashboard,
  ClipboardList,
  Rocket,
  BarChart3,
  LogOut,
  Layers, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

const navItems = [
  { path: '/builder', icon: <LayoutDashboard size={18} />, label: 'Builder' },
  { path: '/assessments', icon: <ClipboardList size={18} />, label: 'Assessments' },
  { path: '/launchpad', icon: <Rocket size={18} />, label: 'Launch Pad' },
  { path: '/reports', icon: <BarChart3 size={18} />, label: 'Reports' },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // ✅ new state


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">
  <Layers size={22} className="logo-icon" />
  {sidebarOpen && <span className="logo-text">AssessFlow</span>}
</div>

<button
  className="toggle-btn"
  onClick={() => setSidebarOpen(!sidebarOpen)}
>
  {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
</button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
             <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
         <div
  className="user-info"
  onClick={() => navigate('/profile')}
  style={{ cursor: 'pointer' }}
>
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            {sidebarOpen && (
              <div className="user-details">
                <div className="user-name">{user?.name}</div>
                <div className="user-email">{user?.email}</div>
              </div>
            )}
          </div>
           <button
  className="logout-btn"
  onClick={() => setShowLogoutConfirm(true)}
  title="Logout"
>
  <LogOut size={18} />
  {sidebarOpen && <span>Logout</span>}
</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-inner">
          <Outlet />
        </div>
      </main>
      <ConfirmModal
  open={showLogoutConfirm}
  title="Leaving So Soon?"
message="You're about to log out of your account. Make sure you've saved your work before continuing."
  icon={<LogOut size={36} color="var(--red)" />}
  confirmLabel="Logout"
  confirmClass="btn-danger"
  onConfirm={handleLogout}
  onCancel={() => setShowLogoutConfirm(false)}
/>
    </div>
  );
};

export default Layout;

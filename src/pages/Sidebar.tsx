import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Sidebar.css';
import logoImg from '../assets/logo-lighthouse.png';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login', { replace: true });
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-logo">
        <img src={logoImg} alt="Project Alerto Logo" />
        <h2>Project Alerto</h2>
        <p>Marikeños Readiness Hub</p>
      </div>

    <nav className="nav-menu">
        <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
            Dashboard
        </NavLink>

        <NavLink
            to="/hotlines"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
            Emergency Hotlines
        </NavLink>

        <NavLink
            to="/map"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
            Evacuation Map
        </NavLink>

        <NavLink
            to="/residence"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
            Residence Card
        </NavLink>

        <NavLink
            to="/notifications"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
            Notifications
        </NavLink>
    </nav>


      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </aside>
  );
};

export default Sidebar;
import React from 'react';
import './Sidebar.css';
import logoImg from '../assets/logo-lighthouse.png';

interface SidebarProps {
  isOpen: boolean;
  activePage?: string; // to highlight the current page
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activePage = 'dashboard' }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-logo">
        <img src={logoImg} alt="Project Alerto Logo" />
        <h2>Project Alerto</h2>
        <p>Marikeños Readiness Hub</p>
      </div>

      <nav className="nav-menu">
        <button className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}>
          Dashboard
        </button>
        <button className={`nav-item ${activePage === 'hotlines' ? 'active' : ''}`}>
          Emergency Hotlines
        </button>
        <button className={`nav-item ${activePage === 'map' ? 'active' : ''}`}>
          Evacuation Map
        </button>
        <button className={`nav-item ${activePage === 'residence' ? 'active' : ''}`}>
          Residence Card
        </button>
        <button className={`nav-item ${activePage === 'notifications' ? 'active' : ''}`}>
          Notifications
        </button>
      </nav>

      <button className="logout-btn">Logout</button>
    </aside>
  );
};

export default Sidebar;
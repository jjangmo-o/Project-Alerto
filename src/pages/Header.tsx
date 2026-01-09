import React from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';

import menuIcon from '../assets/icon-menu.png';

interface HeaderProps {
  onMenuClick: () => void;
  username?: string;
}


const routeTitles:  Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/hotlines': 'Emergency Hotlines',
  '/map': 'Evacuation Map',
  '/residence': 'Residence Card',
  '/notifications': 'Notifications',
  '/community-status': 'Community Status',
};

const Header: React.FC<HeaderProps> = ({ onMenuClick, username }) => {
  const location = useLocation();

  const title =
    routeTitles[location.pathname] || 'Project Alerto';

  return (
    <header className="top-header">
        <div className="header-title">
            <button
                onClick={onMenuClick}
                aria-label="Toggle sidebar"
                className="menu-btn"
                >
                <img src={menuIcon} alt="Menu" />
            </button>

            {title}
        </div>

        <div className="user-profile">
            <div className="avatar-circle"></div>
            <span>Hello, {username || 'User'}!</span>
        </div>
    </header>
  );
};

export default Header;
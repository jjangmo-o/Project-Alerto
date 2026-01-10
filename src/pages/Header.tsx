import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

import menuIcon from '../assets/icon-menu.png';
import notificationsIcon from '../assets/icon-notification-bell.svg';


interface HeaderProps {
  onMenuClick: () => void;
  username?: string;
}

const routeTitles:  Record<string, string> = {
  '/dashboard': 'Home',
  '/hotlines': 'Emergency Hotlines',
  '/map': 'Evacuation Map',
  '/residence': 'Residence Card',
  '/notifications': 'Notifications',
};

const Header: React.FC<HeaderProps> = ({ onMenuClick, username = 'User' }) => {
  const location = useLocation();
  const navigate = useNavigate();


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
            <button
                onClick={() => navigate('/notifications')}
                className="notifications-btn"
                >
                <img src={notificationsIcon} alt="Notifications" />
            </button>

          <div className="avatar-circle"></div>
          <span>Hello, {username || 'User'}!</span>
        </div>
    </header>
  );
};

export default Header;

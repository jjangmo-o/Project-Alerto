import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import './Header.css';

import menuIcon from '../assets/icon-menu.svg';
import notificationsIcon from '../assets/icon-notification-bell.svg';

interface HeaderProps {
  onMenuClick: () => void;
  username?: string;
  role?: 'user' | 'admin';
}

const FALLBACK_IMAGE = 'https://ui-avatars.com/api/?size=128&background=E5E7EB&color=374151&name=User';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Home',
  '/hotlines': 'Emergency Hotlines',
  '/map': 'Evacuation Map',
  '/residence': 'Residence Card',
  '/notifications': 'Notifications',
  '/community-status': 'Community Status',
};

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  username = 'User',
  role = 'user',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(FALLBACK_IMAGE);

  const title =
    role == 'admin'
      ? 'Admin Dashboard'
      : routeTitles[location.pathname] || 'Project Alerto';

  useEffect(() => {
    if (!profile?.profile_image_url) return;

    supabase.storage
      .from('profile-images')
      .createSignedUrl(profile.profile_image_url, 3600)
      .then(({ data }) => {
        if (data?.signedUrl) {
          setAvatarUrl(data.signedUrl);
        }
      });
  }, [profile]);

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
        {role !== 'admin' && (
          <button
            onClick={() => navigate('/notifications')}
            className="notifications-btn"
            aria-label="Notifications"
          >
            <img src={notificationsIcon} alt="Notifications" />
          </button>
        )}

        <img
          src={avatarUrl}
          alt="User Avatar"
          className="avatar-circle"
          onClick={() => navigate('/residence')}
        />
        <span>
          {role === 'admin' ? 'Admin' : `Hello, ${username || 'User'}!`}
        </span>
      </div>
    </header>
  );
};

export default Header;
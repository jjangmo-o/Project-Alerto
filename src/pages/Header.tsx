import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import './Header.css';

import menuIcon from '../assets/icon-menu.png';

interface HeaderProps {
  onMenuClick: () => void;
  username?: string;
}

const FALLBACK_IMAGE =
  'https://ui-avatars.com/api/?size=128&background=E5E7EB&color=374151&name=User';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/hotlines': 'Emergency Hotlines',
  '/map': 'Evacuation Map',
  '/residence': 'Residence Card',
  '/notifications': 'Notifications',
  '/community-status': 'Community Status',
};

const Header: React.FC<HeaderProps> = ({ onMenuClick, username }) => {
  const location = useLocation();
  const { profile } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(FALLBACK_IMAGE);

  const title =
    routeTitles[location.pathname] || 'Project Alerto';

  /* ================= LOAD PROFILE IMAGE ================= */
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
        <img
          src={avatarUrl}
          alt="User Avatar"
          className="avatar-circle"
        />
        <span>Hello, {username || 'User'}!</span>
      </div>
    </header>
  );
};

export default Header;

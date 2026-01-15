import { useEffect, useMemo, useState } from 'react';
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

const FALLBACK_IMAGE =
  'https://ui-avatars.com/api/?size=128&background=E5E7EB&color=374151&name=User';

const SIGNED_URL_TTL_SECONDS = 60 * 60;

const routeTitles: Record<string, string> = {
  '/dashboard': 'Home',
  '/hotlines': 'Emergency Hotlines',
  '/map': 'Evacuation Map',
  '/residence': 'Residence Card',
  '/notifications': 'Notifications',
  '/community-status': 'Community Status',
};

/**
 * 🔥 Synchronously read cached avatar BEFORE render
 */
const getCachedAvatar = (path?: string) => {
  if (!path) return FALLBACK_IMAGE;

  try {
    const cached = localStorage.getItem(`avatar:${path}`);
    if (!cached) return FALLBACK_IMAGE;

    const parsed = JSON.parse(cached) as {
      url: string;
      expiresAt: number;
    };

    if (Date.now() < parsed.expiresAt) {
      return parsed.url; // 🚀 INSTANT
    }
  } catch {
    /* ignore */
  }

  return FALLBACK_IMAGE;
};

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  username = 'User',
  role = 'user',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();


  const [avatarUrl, setAvatarUrl] = useState(() =>
    getCachedAvatar(profile?.profile_image_url ?? undefined)
  );

  const title = useMemo(() => {
    return role === 'admin'
      ? 'Admin Dashboard'
      : routeTitles[location.pathname] || 'Project Alerto';
  }, [location.pathname, role]);


  useEffect(() => {
    if (!profile?.profile_image_url) return;

    const cacheKey = `avatar:${profile.profile_image_url}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() < parsed.expiresAt) {
          return; 
        }
      }
    } catch {
      localStorage.removeItem(cacheKey);
    }


    supabase.storage
      .from('profile-images')
      .createSignedUrl(
        profile.profile_image_url,
        SIGNED_URL_TTL_SECONDS
      )
      .then(({ data }) => {
        if (!data?.signedUrl) return;

        const expiresAt =
          Date.now() + SIGNED_URL_TTL_SECONDS * 1000;

        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            url: data.signedUrl,
            expiresAt,
          })
        );

        setAvatarUrl(data.signedUrl);

  
        const img = new Image();
        img.src = data.signedUrl;
      });
  }, [profile?.profile_image_url]);

  return (
    <header className="top-header">
      {/* LEFT */}
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

      {/* RIGHT */}
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
          loading="eager"
          decoding="sync"
          fetchPriority="high"
          onClick={() => navigate('/residence')}
        />

        <span>
          {role === 'admin'
            ? 'Admin'
            : `Hello, ${username || 'User'}!`}
        </span>
      </div>
    </header>
  );
};

export default Header;

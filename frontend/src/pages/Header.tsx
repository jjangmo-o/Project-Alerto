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

const getCachedAvatar = (path: string) => {
  try {
    const cached = localStorage.getItem(`avatar:${path}`);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as {
      url: string;
      expiresAt: number;
    };

    if (Date.now() < parsed.expiresAt) {
      return parsed.url;
    }
  } catch {
    /* ignore */
  }

  return null;
};

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  username = 'User',
  role = 'user',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, loading } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const title = useMemo(() => {
    return role === 'admin'
      ? 'Admin Dashboard'
      : routeTitles[location.pathname] || 'Project Alerto';
  }, [location.pathname, role]);


  useEffect(() => {
    if (loading || !profile?.profile_image_url) return;

    const cached = getCachedAvatar(profile.profile_image_url);
    if (cached) {
      Promise.resolve().then(() => setAvatarUrl(cached));
      return;
    }

    const cacheKey = `avatar:${profile.profile_image_url}`;

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
  }, [loading, profile?.profile_image_url]);

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

        {/* Render avatar only when resolved */}
        <img
          src={avatarUrl ?? FALLBACK_IMAGE}
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

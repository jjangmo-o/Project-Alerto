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

/**
 * Fallback avatar (instant, cached by browser)
 */
const FALLBACK_IMAGE =
  'https://ui-avatars.com/api/?size=128&background=E5E7EB&color=374151&name=User';

/**
 * Page titles
 */
const routeTitles: Record<string, string> = {
  '/dashboard': 'Home',
  '/hotlines': 'Emergency Hotlines',
  '/map': 'Evacuation Map',
  '/residence': 'Residence Card',
  '/notifications': 'Notifications',
  '/community-status': 'Community Status',
};

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  username = 'User',
  role = 'user',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();

  /**
   * Avatar state
   */
  const [avatarUrl, setAvatarUrl] = useState<string>(
    profile?.profile_image_url ? '' : FALLBACK_IMAGE
  );
  const [isAvatarLoaded, setIsAvatarLoaded] = useState<boolean>(false);

  /**
   * Title memoized (minor perf boost)
   */
  const title = useMemo(() => {
    return role === 'admin'
      ? 'Admin Dashboard'
      : routeTitles[location.pathname] || 'Project Alerto';
  }, [location.pathname, role]);

  /**
   * Load + cache signed avatar URL
   */
  useEffect(() => {
    if (!profile?.profile_image_url) {
      // No need to set state here; initial state handles fallback
      return;
    }

    const storagePath = profile.profile_image_url;
    const cacheKey = `avatar-cache:${storagePath}`;

    try {
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const parsed = JSON.parse(cached) as {
          url: string;
          expiresAt: number;
        };

        // ✅ Use cached URL if still valid
        if (Date.now() < parsed.expiresAt) {
          setTimeout(() => setAvatarUrl(parsed.url), 0);
          return;
        }
      }
    } catch {
      // ignore corrupted cache
      localStorage.removeItem(cacheKey);
    }

    // ❌ No valid cache → generate new signed URL
    supabase.storage
      .from('profile-images')
      .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS)
      .then(({ data, error }) => {
        if (error || !data?.signedUrl) {
          console.error('Failed to create signed avatar URL:', error);
          return;
        }

        const expiresAt =
          Date.now() + SIGNED_URL_TTL_SECONDS * 1000;

        // ✅ Save to state
        setAvatarUrl(data.signedUrl);

        // ✅ Save to cache
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            url: data.signedUrl,
            expiresAt,
          })
        );

        // ✅ Preload image (instant render)
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
          className={`avatar-circle ${
            isAvatarLoaded ? 'avatar-loaded' : 'avatar-loading'
          }`}
          loading="eager"
          decoding="async"
          onLoad={() => setIsAvatarLoaded(true)}
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

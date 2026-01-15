import { useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { AuthContext } from './AuthContext';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

type RealtimeNotification = {
  title: string;
  message: string;
  target_role: 'USER' | 'ADMIN' | 'ALL';
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔔 IN-APP REALTIME NOTIFICATION STATE
  const [latestNotification, setLatestNotification] =
    useState<RealtimeNotification | null>(null);

  // ============================
  // AUTH STATE HANDLING
  // ============================
  useEffect(() => {
    const {
      data: { subscription },
    } = authService.onAuthStateChange(
      (_event: string, session: unknown) => {
        const typedSession = session as Session | null;

        if (typedSession?.user && typedSession.user.email_confirmed_at) {
          setUser(typedSession.user);

          profileService
            .getProfile(typedSession.user.id)
            .then(setProfile)
            .catch(() => setProfile(null));
        } else {
          setUser(null);
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ============================
  // REALTIME NOTIFICATIONS LISTENER
  // ============================
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('realtime-user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        payload => {
          if (!payload.new) return;

          const notif = payload.new as RealtimeNotification;

          if (notif.target_role === 'USER' || notif.target_role === 'ALL') {
            setLatestNotification({
              title: notif.title,
              message: notif.message,
              target_role: notif.target_role,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ============================
  // AUTO-DISMISS NOTIFICATION
  // ============================
  useEffect(() => {
    if (!latestNotification) return;

    const timeout = setTimeout(() => {
      setLatestNotification(null);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [latestNotification]);

  // ============================
  // AUTH ACTIONS
  // ============================
  const login = async (email: string, password: string) => {
    const { user } = await authService.login(email, password);

    if (!user?.email_confirmed_at) {
      await authService.logout();
      throw new Error('Please verify your email before logging in.');
    }

    setUser(user);

    profileService
      .getProfile(user.id)
      .then(setProfile)
      .catch(() => setProfile(null));
  };

  const register = async (data: Parameters<typeof authService.register>[0]) => {
    await authService.register(data);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}

      {/* 🔔 IN-APP REALTIME POPUP */}
      {latestNotification && (
        <div
          onClick={() => setLatestNotification(null)}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#1c3e6f',
            color: '#ffffff',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
            zIndex: 9999,
            maxWidth: '320px',
            cursor: 'pointer',
          }}
        >
          <strong style={{ fontSize: '1rem' }}>
            {latestNotification.title}
          </strong>
          <p style={{ marginTop: '6px', fontSize: '0.9rem' }}>
            {latestNotification.message}
          </p>
          <small style={{ opacity: 0.8 }}>
            Click to dismiss
          </small>
        </div>
      )}
    </AuthContext.Provider>
  );
};

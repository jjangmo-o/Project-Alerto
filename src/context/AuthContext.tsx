import React, { useEffect, useState, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import type { Profile } from '../lib/database.types';
import { AuthContext } from './AuthContextType';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const initAuth = async () => {
      try {
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (isMounted && loadingRef.current) {
            console.warn('Auth initialization timed out');
            setLoading(false);
            loadingRef.current = false;
          }
        }, 3000); // 3 second timeout

        const session = await authService.getSession();
        
        if (!isMounted) return;
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch profile in background, don't block loading
          profileService.getProfile(session.user.id)
            .then(userProfile => {
              if (isMounted) setProfile(userProfile);
            })
            .catch(err => {
              console.error('Error fetching profile:', err);
            });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
          loadingRef.current = false;
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event: string, session: unknown) => {
        if (!isMounted) return;
        
        const typedSession = session as Session | null;
        setUser(typedSession?.user ?? null);
        
        if (typedSession?.user && event !== 'SIGNED_OUT') {
          profileService.getProfile(typedSession.user.id)
            .then(userProfile => {
              if (isMounted) setProfile(userProfile);
            })
            .catch(err => {
              console.error('Error fetching profile:', err);
            });
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { user: authUser } = await authService.login(email, password);
    if (authUser) {
      setUser(authUser);
      profileService.getProfile(authUser.id)
        .then(userProfile => setProfile(userProfile))
        .catch(err => console.error('Error fetching profile:', err));
    }
  };

  const register = async (data: { 
    firstName: string; 
    lastName: string; 
    email: string;
    contact: string; 
    password: string;
    address?: string;
    birthDate?: string;
  }) => {
    await authService.register(data);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const userProfile = await profileService.getProfile(user.id);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error refreshing profile:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import type { Profile } from '../lib/database.types';
import { AuthContext } from './AuthContextType';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const userProfile = await profileService.getProfile(userId);
      return userProfile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const session = await authService.getSession();
        
        if (!isMounted) return;
        
        if (session?.user) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          if (isMounted) setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = authService.onAuthStateChange(
      async (_event: string, session: unknown) => {
        if (!isMounted) return;
        
        const typedSession = session as Session | null;
        setUser(typedSession?.user ?? null);
        
        if (typedSession?.user) {
          const userProfile = await fetchProfile(typedSession.user.id);
          if (isMounted) setProfile(userProfile);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const { user: authUser } = await authService.login(email, password);
    if (authUser) {
      setUser(authUser);
      const userProfile = await fetchProfile(authUser.id);
      setProfile(userProfile);
    }
  };

  const register = async (data: { 
    firstName: string; 
    lastName: string; 
    email: string;
    contact: string; 
    password: string;
    address?: string;
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
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

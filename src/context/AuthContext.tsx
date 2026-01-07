import React, { useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import type { Profile } from '../lib/database.types';
import { AuthContext } from './AuthContextType';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const session = await authService.getSession();
        
        if (!isMounted) return;
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch profile
          try {
            const userProfile = await profileService.getProfile(session.user.id);
            if (isMounted) setProfile(userProfile);
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Only initialize once
    if (!initialized) {
      initAuth();
    }

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event: string, session: unknown) => {
        if (!isMounted) return;
        
        const typedSession = session as Session | null;
        
        console.log('Auth state change:', event, typedSession?.user?.email);
        
        setUser(typedSession?.user ?? null);
        
        if (typedSession?.user) {
          try {
            const userProfile = await profileService.getProfile(typedSession.user.id);
            if (isMounted) setProfile(userProfile);
          } catch (error) {
            console.error('Error fetching profile on auth change:', error);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]); // Only depend on initialized

  const login = async (email: string, password: string) => {
    const { user: authUser } = await authService.login(email, password);
    if (authUser) {
      setUser(authUser);
      try {
        const userProfile = await profileService.getProfile(authUser.id);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error fetching profile after login:', error);
      }
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

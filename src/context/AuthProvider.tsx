import { useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { AuthContext } from './AuthContext';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import type { Tables } from '../lib/database.types';

type Profile = Tables<'profiles'>;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const {
      data: { subscription },
    } = authService.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        if (session?.user && session.user.email_confirmed_at) {
          setUser(session.user);

          profileService
            .getProfile(session.user.id)
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
    </AuthContext.Provider>
  );
};

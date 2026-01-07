import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../lib/database.types';

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { 
    firstName: string; 
    lastName: string; 
    email: string;
    contact: string; 
    password: string;
    address?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { supabase } from '../lib/supabase';

export const authService = {
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    contact: string;
    password: string;
    address?: string;
    birthDate?: string;
  }) {
    // Sign up with Supabase Auth - pass user metadata for the trigger
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          contact_number: data.contact,
          address: data.address || null,
          birth_date: data.birthDate || null,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Registration failed');

    // Profile is created automatically by database trigger
    return { user: authData.user };
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      console.error('Logout error:', error);
    }
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },
};

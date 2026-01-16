import { supabase } from '../lib/supabase';

export type RegisterPayload = {
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  email: string;
  contact: string;
  address: string;
  birthDate: string;
  password: string;
};

export const authService = {
  async register(data: RegisterPayload) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          middle_name: data.middleName ?? null,
          last_name: data.lastName,
          gender: data.gender,
          birth_date: data.birthDate,
          contact_number: data.contact,
          address: data.address,
        },
      },
    });

    if (error) throw error;
    if (!authData.user) {
      throw new Error('Registration failed');
    }

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
    await supabase.auth.signOut();
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthStateChange(
    callback: (event: string, session: import('@supabase/supabase-js').Session | null) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },
};

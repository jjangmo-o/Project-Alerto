import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/database.types';

type Profile = Tables<'profiles'>;

export const profileService = {
  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async updateProfileImage(userId: string, path: string) {
    const { error } = await supabase
      .from('profiles')
      .update({ profile_picture_path: path })
      .eq('user_id', userId);

    if (error) throw error;
  },

  async getSignedImageUrl(path: string) {
    const { data, error } = await supabase.storage
      .from('profile-images')
      .createSignedUrl(path, 60 * 5); // 5 minutes

    if (error) throw error;
    return data.signedUrl;
  },
};
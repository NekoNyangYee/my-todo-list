import { supabase } from './supabaseClient';

export const updateProfile = async (user: any, provider: string) => {
    const { id, email, user_metadata } = user;
    const full_name = user_metadata?.full_name || user_metadata?.name || '';
    const avatar_url = user_metadata?.avatar_url || user_metadata?.picture || '';

    console.log('Updating profile for user:', { id, email, full_name, avatar_url, provider });

    const { data, error } = await supabase.from('users').upsert({
        id,
        email,
        full_name,
        avatar_url,
        provider,
        updated_at: new Date(),
    });

    if (error) {
        console.error('Error updating profile:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
    } else {
        console.log('Profile updated successfully:', data);
    }
};

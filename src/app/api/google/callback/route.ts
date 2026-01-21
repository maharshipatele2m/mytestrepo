import { google } from 'googleapis';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state') || '';
    const [userId, targetService] = state.split(':');

    if (!code || !userId) {
        return NextResponse.redirect(`${origin}/?error=invalid-callback`);
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URL
    );

    try {
        const { tokens } = await oauth2Client.getToken(code);
        const supabase = await createClient();

        // 1. Update Profile Tokens
        const updateData: any = {
            google_access_token: tokens.access_token,
            updated_at: new Date().toISOString(),
        };

        if (tokens.refresh_token) updateData.google_refresh_token = tokens.refresh_token;
        if (tokens.expiry_date) updateData.google_token_expires_at = new Date(tokens.expiry_date).toISOString();

        const { error: profileError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId);

        if (profileError) throw profileError;

        // 2. Update Auth Metadata for granular service status
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const currentServices = user.user_metadata?.services || {};
            const newServices = { ...currentServices };

            if (targetService === 'all') {
                ['gmail', 'calendar', 'drive', 'docs'].forEach(s => newServices[s] = true);
            } else if (targetService) {
                newServices[targetService] = true;
            }

            await supabase.auth.updateUser({
                data: {
                    services: newServices,
                    services_scopes: tokens.scope || ''
                }
            });
        }

        return NextResponse.redirect(`${origin}/?success=google-connected`);
    } catch (error) {
        console.error('Google OAuth Callback Error:', error);
        return NextResponse.redirect(`${origin}/?error=google-auth-failed`);
    }
}

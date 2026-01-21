import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const service = searchParams.get('service');

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (service) {
            // Granular Disconnect: Just update metadata
            const currentServices = user.user_metadata?.services || {};
            const newServices = { ...currentServices };
            delete newServices[service];

            await supabase.auth.updateUser({
                data: { services: newServices }
            });

            return NextResponse.json({ success: true, mode: 'granular' });
        } else {
            // Global Disconnect: Clear tokens and metadata
            const { error } = await supabase
                .from('profiles')
                .update({
                    google_access_token: null,
                    google_refresh_token: null,
                    google_token_expires_at: null
                })
                .eq('id', user.id);

            if (error) throw error;

            await supabase.auth.updateUser({
                data: { services: {} }
            });

            return NextResponse.json({ success: true, mode: 'global' });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { documentId, isActive } = await req.json();

        if (!documentId || typeof isActive !== 'boolean') {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        // Update document active status
        const { error } = await supabase
            .from('documents')
            .update({ is_active: isActive })
            .eq('id', documentId)
            .eq('user_id', user.id);

        if (error) {
            console.error('Failed to update document status:', error);
            return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error toggling document:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

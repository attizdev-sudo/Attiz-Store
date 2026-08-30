import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { getSessionCookieFromHeaders, verifySession } from '@/lib/session';
import type { LookbookSettings } from '@/lib/types';

const DEFAULT_SETTINGS: LookbookSettings = {
  category_id: 'all',
  category_name: 'All Collections',
  title: 'TRENDING COLLECTION',
  subtitle: 'Handpicked bestsellers & top-rated garments loved by our community.',
  tag: 'MOST POPULAR',
  is_enabled: true,
  accent_color: '#FFCB05',
  limit_count: 10,
};

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    const { data, error } = await supabase
      .from('lookbook_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('attiz_session')?.value || getSessionCookieFromHeaders(request.headers);
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const session = await verifySession(sessionCookie);
    const isAdmin = Boolean(
      session &&
        (session.role === 'admin' ||
          session.role === 'super_admin' ||
          session.role === 'Administrator' ||
          session.role === 'administrator')
    );
    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();

    const payload: LookbookSettings = {
      category_id: body.category_id || 'all',
      category_name: body.category_name || 'All Collections',
      title: body.title?.trim() || DEFAULT_SETTINGS.title,
      subtitle: body.subtitle?.trim() || DEFAULT_SETTINGS.subtitle,
      tag: body.tag?.trim() || DEFAULT_SETTINGS.tag,
      is_enabled: body.is_enabled !== undefined ? Boolean(body.is_enabled) : true,
      accent_color: body.accent_color || '#FFCB05',
      limit_count: Number(body.limit_count) || 10,
      updated_at: new Date().toISOString(),
    };

    if (!supabase) {
      return NextResponse.json(payload);
    }

    // Check if a row already exists
    const { data: existing } = await supabase.from('lookbook_settings').select('id').limit(1).maybeSingle();

    let result;
    if (existing?.id) {
      result = await supabase
        .from('lookbook_settings')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase.from('lookbook_settings').insert(payload).select().single();
    }

    if (result.error) {
      console.warn('Lookbook settings DB update note (using payload directly):', result.error.message);
      return NextResponse.json(payload);
    }

    return NextResponse.json(result.data || payload);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update lookbook settings' }, { status: 500 });
  }
}

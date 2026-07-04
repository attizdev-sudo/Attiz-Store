import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

/** GET /api/products — list all products */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST /api/products — create a new product */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase.from('products').insert(body).select();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

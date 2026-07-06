import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const { data, error } = await supabase.from('categories').insert(body).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

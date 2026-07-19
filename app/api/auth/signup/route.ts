import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/db';
import { hashPassword, createSession, setSessionCookie } from '@/lib/auth/auth';
import { sendVerificationEmail } from '@/lib/auth/email';
import crypto from 'crypto';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  acceptTerms: z.literal(true, { message: 'You must accept the terms & conditions.' }),
});

/** POST /api/auth/signup */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      const errorMap = result.error.flatten().fieldErrors;
      const firstErrorMessage = Object.values(errorMap)[0]?.[0] || 'Invalid inputs.';
      return NextResponse.json({ error: firstErrorMessage }, { status: 400 });
    }

    const { firstName, lastName, email, phone, password } = result.data;

    // Check if email or phone is already registered (only checks phone if supplied)
    let queryFilter = `email.eq.${email.toLowerCase()}`;
    if (phone && phone.trim() !== '') {
      queryFilter += `,phone.eq.${phone}`;
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, phone')
      .or(queryFilter)
      .maybeSingle();

    if (existingUser) {
      if (existingUser.email?.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json({ error: 'Email address already registered.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Phone number already registered.' }, { status: 409 });
    }

    // Hash the password with Argon2id
    const hashedPassword = await hashPassword(password);

    // Insert user into database with email_verified = false
    const { data: createdUser, error: insertError } = await supabase
      .from('users')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        phone: (phone && phone.trim() !== '') ? phone : null,
        password_hash: hashedPassword,
        role: 'customer',
        email_verified: false,
        account_status: 'active',
      })
      .select('id, first_name, last_name, email, phone, role')
      .single();

    if (insertError || !createdUser) {
      return NextResponse.json({ error: insertError?.message || 'Registration failed.' }, { status: 500 });
    }

    // Generate a secure verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    const { error: tokenError } = await supabase.from('email_verification_tokens').insert({
      user_id: createdUser.id,
      token: verificationToken,
      expires_at: tokenExpiresAt.toISOString(),
    });

    if (tokenError) {
      console.error('Failed to store verification token:', tokenError.message);
      // Still return success - user created, email may not send but can be resent
    }

    // Send verification email
    try {
      await sendVerificationEmail(createdUser.email, verificationToken, createdUser.first_name);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the registration if email fails - user can request resend
    }

    // Do NOT create a session — user must verify email first
    return NextResponse.json({
      pending: true,
      message: `We've sent a verification link to ${createdUser.email}. Please check your inbox and click the link to activate your account.`,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during signup.' }, { status: 500 });
  }
}

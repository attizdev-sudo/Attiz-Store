import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/db';
import { createSession, setSessionCookie } from '@/lib/auth/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  // Get the state stored in cookie
  const cookieStore = await cookies();
  const storedState = cookieStore.get('google_oauth_state')?.value;

  // Clear state cookie immediately
  cookieStore.delete('google_oauth_state');

  // Verify OAuth state to prevent CSRF attacks
  if (!state || !storedState || state !== storedState) {
    console.error('CSRF verification failed: state mismatch.');
    return NextResponse.redirect(`${appUrl}/login?error=invalid_state`);
  }

  if (!code) {
    console.error('Authorization code is missing from Google redirect.');
    return NextResponse.redirect(`${appUrl}/login?error=missing_code`);
  }

  if (!clientId || !clientSecret) {
    console.error('Google client credentials are not configured in environment variables.');
    return NextResponse.redirect(`${appUrl}/login?error=google_auth_not_configured`);
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to exchange authorization code for tokens:', errorText);
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    if (!accessToken) {
      console.error('Access token was not returned by Google.');
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange_failed`);
    }

    // 2. Fetch user information from Google API
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoResponse.ok) {
      console.error('Failed to fetch user information from Google.');
      return NextResponse.redirect(`${appUrl}/login?error=userinfo_fetch_failed`);
    }

    const userInfo = await userinfoResponse.json();
    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture: avatarUrl } = userInfo;

    if (!email) {
      console.error('Google profile does not contain an email address.');
      return NextResponse.redirect(`${appUrl}/login?error=email_required`);
    }

    // 3. Match user in database
    let userId: string | null = null;

    // Check if user already has this google_id linked
    const { data: userByGoogleId, error: googleIdError } = await supabase
      .from('users')
      .select('id, email_verified, role')
      .eq('google_id', googleId)
      .maybeSingle();

    if (googleIdError) {
      console.error('Error fetching user by Google ID:', googleIdError.message);
      return NextResponse.redirect(`${appUrl}/login?error=database_error`);
    }

    if (userByGoogleId) {
      userId = userByGoogleId.id;

      // Update last login timestamp and potentially avatar if it changed
      await supabase
        .from('users')
        .update({
          last_login_at: new Date().toISOString(),
          avatar_url: avatarUrl || undefined,
        })
        .eq('id', userId);
    } else {
      // Check if user exists with the same email address (and link Google account)
      const { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('id, google_id, email_verified')
        .eq('email', email)
        .maybeSingle();

      if (emailError) {
        console.error('Error fetching user by email:', emailError.message);
        return NextResponse.redirect(`${appUrl}/login?error=database_error`);
      }

      if (userByEmail) {
        userId = userByEmail.id;

        // Link the Google account and ensure email is verified
        const { error: updateError } = await supabase
          .from('users')
          .update({
            google_id: googleId,
            email_verified: true,
            avatar_url: avatarUrl || undefined,
            last_login_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Failed to link Google account to existing user:', updateError.message);
          return NextResponse.redirect(`${appUrl}/login?error=database_error`);
        }
      } else {
        // Create a new user record
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            first_name: firstName || 'Google User',
            last_name: lastName || '',
            email: email,
            google_id: googleId,
            email_verified: true,
            avatar_url: avatarUrl || null,
            role: 'customer',
            account_status: 'active',
            last_login_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (insertError || !newUser) {
          console.error('Failed to register new Google user:', insertError?.message);
          return NextResponse.redirect(`${appUrl}/login?error=registration_failed`);
        }

        userId = newUser.id;
      }
    }

    // 4. Auto-login the user by creating a session
    if (!userId) {
      console.error('No user ID resolved after database operations.');
      return NextResponse.redirect(`${appUrl}/login?error=database_error`);
    }

    const ipAddress = request.headers.get('x-forwarded-for') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    const { token: sessionToken, expiresAt } = await createSession(userId, ipAddress, userAgent);
    await setSessionCookie(sessionToken, expiresAt);

    // Redirect to home page with success state
    return NextResponse.redirect(`${appUrl}/?verified=true`);
  } catch (error) {
    console.error('Unexpected error in Google OAuth callback route:', error);
    return NextResponse.redirect(`${appUrl}/login?error=auth_internal_error`);
  }
}

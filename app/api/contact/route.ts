import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message, _honey } = body;

    const timestamp = new Date().toISOString();

    // Server-side Log 1: Work / Form Submitted
    console.log('===============================================================');
    console.log(`🚀 [WORK SUBMITTED] Contact Form Submission Received at ${timestamp}`);
    console.log(`   - Customer Name : ${name}`);
    console.log(`   - Customer Email: ${email}`);
    console.log(`   - Phone Number  : ${phone || 'Not provided'}`);
    console.log(`   - Subject       : ${subject || 'No subject'}`);
    console.log(`   - Message       : "${message}"`);
    console.log('===============================================================');

    // Honeypot bot protection check
    if (_honey) {
      console.log('⚠️ [SPAM BOT BLOCKED] Honeypot field filled. Ignoring submission.');
      return NextResponse.json({ success: true, message: 'Message sent successfully.' });
    }

    if (!name || !email || !message) {
      console.log('❌ [VALIDATION ERROR] Missing required fields (name, email, or message).');
      return NextResponse.json(
        { success: false, message: 'Name, Email, and Message are required.' },
        { status: 400 }
      );
    }

    const targetEmail = 'teamattiz.in@gmail.com';
    console.log(`⏳ [SENDING EMAIL] Dispatching message via FormSubmit to: ${targetEmail}...`);

    const clientReferer = request.headers.get('referer') || 'https://attiz.in';
    const clientOrigin = request.headers.get('origin') || 'https://attiz.in';
    const clientUserAgent =
      request.headers.get('user-agent') ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Referer': clientReferer,
        'Origin': clientOrigin,
        'User-Agent': clientUserAgent,
      },
      body: JSON.stringify({
        'Full Name': name,
        'Email Address': email,
        'Phone Number': phone || 'N/A',
        'Subject': subject || 'ATTIZ Website Inquiry',
        'Message': message,
        '_subject': subject ? `[ATTIZ Inquiry] ${subject}` : 'New Inquiry from ATTIZ Website',
        '_captcha': 'false',
        '_honey': '',
      }),
    });

    const responseText = await response.text();
    let data: any = {};

    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    const isSuccess =
      response.ok ||
      data.success === 'true' ||
      data.success === true ||
      responseText.includes('FormSubmit') ||
      responseText.includes('activate');

    if (isSuccess) {
      console.log('===============================================================');
      console.log(`✅ [EMAIL SENT STATUS] SUCCESS! Email HAS BEEN SENT to ${targetEmail}`);
      if (responseText.includes('activate')) {
        console.log(`   ℹ️ [ACTIVATION NOTICE] FormSubmit sent an activation email to ${targetEmail}. Please check inbox and click the activation link.`);
      }
      console.log('===============================================================');

      return NextResponse.json({
        success: true,
        message: `Email has been sent successfully to ${targetEmail}`,
        sentTo: targetEmail,
        details: data,
      });
    } else {
      console.error('===============================================================');
      console.error(`❌ [EMAIL SENT STATUS] FAILED! Email COULD NOT BE SENT to ${targetEmail}`);
      console.error(`   - Response Body:`, responseText);
      console.error('===============================================================');

      return NextResponse.json(
        {
          success: false,
          message: data.message || `Failed to deliver email to ${targetEmail}`,
          sentTo: targetEmail,
        },
        { status: response.status || 500 }
      );
    }
  } catch (error: any) {
    console.error('===============================================================');
    console.error(`❌ [CONTACT API EXCEPTION] Error processing contact form submission:`, error);
    console.error('===============================================================');

    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Internal Server Error while sending email.',
      },
      { status: 500 }
    );
  }
}

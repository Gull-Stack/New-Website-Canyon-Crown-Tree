const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SITE_EMAIL = process.env.SITE_EMAIL || 'canyoncrowntreeco@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'leads@gullstack.com';
const SUPERTOOL_TENANT_ID = '6e069ec0-764d-4679-a1cf-3cde289268d1';

// Spam protection
function looksLikeSpam(data) {
  const { firstName, fax_number, _timestamp } = data;
  if (fax_number) return 'honeypot';
  if (_timestamp) {
    const elapsed = Date.now() - parseInt(_timestamp, 10);
    if (elapsed < 3000) return 'too_fast';
  }
  if (firstName && firstName.trim().length < 2) return 'short_name';
  return false;
}

async function sendEmail({ to, from, subject, html, replyTo, cc }) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }], ...(cc ? { cc: [{ email: cc }] } : {}) }],
      from: { email: from },
      reply_to: replyTo ? { email: replyTo } : undefined,
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
  return response.ok;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { firstName, lastName, email, phone, service, message, fax_number, _timestamp } = req.body;

    const spamReason = looksLikeSpam({ firstName, fax_number, _timestamp });
    if (spamReason) {
      console.log(`[SPAM BLOCKED] reason=${spamReason}`);
      return res.status(200).json({ ok: true });
    }

    if (!firstName || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const name = `${firstName} ${lastName || ''}`.trim();

    // Forward to SuperTool
    try {
      await fetch(`https://backend-production-5ad2.up.railway.app/api/public/leads/${SUPERTOOL_TENANT_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName: lastName || null,
          email, phone: phone || null,
          service: service || null, message: message || null,
          sourceSite: 'canyoncrowntreeco.com',
          sourceUrl: 'https://canyoncrowntreeco.com/contact',
          formName: 'Contact Form',
        }),
      });
    } catch (e) { console.error('SuperTool error:', e); }

    // Send notification email
    if (SENDGRID_API_KEY) {
      const notificationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2d5016; padding: 20px; text-align: center;">
            <h1 style="color: #a3d977; margin: 0; font-size: 20px;">New Lead — Canyon Crown Tree Co</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${phone || 'Not provided'}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Service:</strong></td><td style="padding: 10px; border-bottom: 1px solid #ddd;">${service || 'General inquiry'}</td></tr>
            </table>
            ${message ? `<div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border: 1px solid #ddd;"><strong>Message:</strong><br/><p style="margin: 10px 0 0 0;">${message}</p></div>` : ''}
          </div>
          <div style="background: #1a1a1a; padding: 15px; text-align: center;">
            <p style="color: #888; margin: 0; font-size: 12px;">Lead from canyoncrowntreeco.com</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: SITE_EMAIL,
        from: FROM_EMAIL,
        subject: `🔔 New Lead: ${name} - ${service || 'General inquiry'}`,
        html: notificationHtml,
        replyTo: email,
        cc: 'bryce@gullstack.com',
      });

      // Auto-reply to lead
      const confirmationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2d5016; padding: 30px; text-align: center;">
            <h1 style="color: #a3d977; margin: 0;">Thank You, ${firstName}!</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">We've received your message and will get back to you within 24 hours.</p>
            <p style="font-size: 16px; color: #333;">Need immediate help? Call us at <strong>(385) 215-9973</strong></p>
          </div>
          <div style="background: #1a1a1a; padding: 20px; text-align: center;">
            <p style="color: #888; margin: 0; font-size: 14px;">Canyon Crown Tree Co — Certified Arborists Serving Utah</p>
          </div>
        </div>
      `;

      await sendEmail({
        to: email,
        from: FROM_EMAIL,
        subject: 'Thanks for contacting Canyon Crown Tree Co!',
        html: confirmationHtml,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

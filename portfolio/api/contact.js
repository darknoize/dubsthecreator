const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RATE_MAX_REQUESTS = 10;
const RATE_MAX_REQUESTS = (() => {
  const parsed = Number.parseInt(process.env.CONTACT_RATE_MAX_REQUESTS || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_RATE_MAX_REQUESTS;
})();
const MIN_FILL_TIME_MS = 3500;
const MAX_FILL_TIME_MS = 60 * 60 * 1000;

const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 150;
const MAX_PHONE_LENGTH = 40;
const MAX_MESSAGE_LENGTH = 2000;

const rateBuckets = new Map();

const toTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return character;
    }
  });

const formatEmailMultiline = (value) => escapeHtml(value).replace(/\n/g, '<br />');

const isSafeAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

const buildMailtoHref = ({ to, subject, bodyLines }) => {
  const body = bodyLines.join('\n');
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const buildEmailShell = ({ eyebrow, title, subtitle, bodyHtml, footerHtml }) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <style>
      @media only screen and (max-width: 620px) {
        .email-shell {
          width: 100% !important;
        }

        .mobile-pad {
          padding: 20px 18px 10px 18px !important;
        }

        .body-wrap {
          padding: 8px 18px 20px 18px !important;
        }

        .hero-title {
          font-size: 30px !important;
          line-height: 1.16 !important;
        }

        .hero-subtitle {
          font-size: 15px !important;
          line-height: 1.55 !important;
        }

        .mobile-stack {
          display: block !important;
          width: 100% !important;
          padding: 0 0 10px 0 !important;
        }

        .mobile-btn {
          display: block !important;
          width: 100% !important;
          box-sizing: border-box !important;
          text-align: center !important;
        }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#070b12; color:#f5f7fb; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; background:radial-gradient(circle at top right, rgba(98,208,250,0.16), transparent 34%), linear-gradient(180deg, #0b1422 0%, #070b12 100%);">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table class="email-shell" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; max-width:720px; border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 18px 0; border-bottom:1px solid rgba(255,255,255,0.1);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; width:100%;">
                  <tr>
                    <td style="font-size:12px; letter-spacing:0.28em; text-transform:uppercase; color:rgba(255,255,255,0.65); font-weight:600;">
                      WILL WEEMS
                    </td>
                    <td align="right" style="font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:#62d0fa; font-weight:700;">
                      ${escapeHtml(eyebrow)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding-top:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:separate; border-spacing:0; background:rgba(255,255,255,0.045); border:1px solid rgba(255,255,255,0.10); border-radius:24px; box-shadow:0 24px 60px rgba(0,0,0,0.45);">
                  <tr>
                    <td class="mobile-pad" style="padding:28px 28px 12px 28px;">
                      <div style="font-size:14px; color:rgba(255,255,255,0.55); margin-bottom:12px;">Vision. Intelligence. Prediction.</div>
                      <div class="hero-title" style="font-size:36px; line-height:1.08; font-weight:600; letter-spacing:0.01em; color:#f5f7fb; margin-bottom:10px;">${escapeHtml(title)}</div>
                      <div class="hero-subtitle" style="font-size:16px; line-height:1.6; color:rgba(255,255,255,0.72);">${escapeHtml(subtitle)}</div>
                    </td>
                  </tr>
                  <tr>
                    <td class="body-wrap" style="padding:8px 28px 28px 28px;">
                      ${bodyHtml}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 8px 0 8px; font-size:12px; line-height:1.7; color:rgba(255,255,255,0.52);">
                ${footerHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const buildMetricCard = (label, value) => `
  <td class="mobile-stack" style="width:50%; padding:0 8px 16px 0; vertical-align:top;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:separate; border-spacing:0; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:18px; overflow:hidden;">
      <tr>
        <td style="padding:16px 18px;">
          <div style="font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.48); margin-bottom:8px;">${escapeHtml(label)}</div>
          <div style="font-size:16px; line-height:1.5; color:#f5f7fb; font-weight:600; word-break:break-word;">${escapeHtml(value)}</div>
        </td>
      </tr>
    </table>
  </td>`;

const buildLeadBriefHtml = ({ name, email, phone, message, pageUrl, submittedAtUtc, ip, moderationEmail }) => {
  const sourceLink = isSafeAbsoluteUrl(pageUrl)
    ? `<a href="${escapeHtml(pageUrl)}" style="color:#62d0fa; text-decoration:none;">${escapeHtml(pageUrl)}</a>`
    : escapeHtml(pageUrl);
  const emailHref = `mailto:${encodeURIComponent(email)}`;
  const phoneHref = `tel:${encodeURIComponent(phone)}`;
  const moderationTarget = isValidEmail(moderationEmail) ? moderationEmail : email;
  const markSpamHref = buildMailtoHref({
    to: moderationTarget,
    subject: `[MERLIN SPAM] ${email}`,
    bodyLines: [
      'Action: Mark this sender as spam.',
      `Sender Name: ${name}`,
      `Sender Email: ${email}`,
      `Sender Phone: ${phone}`,
      `Submitted At: ${submittedAtUtc}`,
      `Source Page: ${pageUrl}`,
      '',
      'Notes:',
    ],
  });
  const blockSenderHref = buildMailtoHref({
    to: moderationTarget,
    subject: `[MERLIN BLOCK] ${email}`,
    bodyLines: [
      'Action: Block this sender from future submissions.',
      `Sender Name: ${name}`,
      `Sender Email: ${email}`,
      `Sender Phone: ${phone}`,
      `Submitted At: ${submittedAtUtc}`,
      `Source Page: ${pageUrl}`,
      '',
      'Notes:',
    ],
  });

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse;">
      <tr>
        <td colspan="2" style="padding:0 0 18px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:separate; border-spacing:0; background:linear-gradient(180deg, rgba(98,208,250,0.18), rgba(98,208,250,0.06)); border:1px solid rgba(98,208,250,0.26); border-radius:22px; overflow:hidden;">
            <tr>
              <td style="padding:22px 24px 10px 24px;">
                <div style="font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#62d0fa; margin-bottom:10px;">Primary Contact</div>
                <div style="font-size:30px; line-height:1.15; color:#f5f7fb; font-weight:700; margin-bottom:8px;">${escapeHtml(name)}</div>
                <div style="font-size:17px; line-height:1.7; color:rgba(255,255,255,0.86);">
                  <strong style="color:#f5f7fb;">Email:</strong> ${escapeHtml(email)}<br />
                  <strong style="color:#f5f7fb;">Phone:</strong> ${escapeHtml(phone)}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 24px 24px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse;">
                  <tr>
                    <td class="mobile-stack" style="padding:0 10px 10px 0;">
                      <a class="mobile-btn" href="${emailHref}" style="display:inline-block; padding:12px 18px; border-radius:999px; background:#62d0fa; color:#07111c; font-size:14px; font-weight:700; text-decoration:none;">Email ${escapeHtml(name)}</a>
                    </td>
                    <td class="mobile-stack" style="padding:0 10px 10px 0;">
                      <a class="mobile-btn" href="${phoneHref}" style="display:inline-block; padding:12px 18px; border-radius:999px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); color:#f5f7fb; font-size:14px; font-weight:700; text-decoration:none;">Call ${escapeHtml(phone)}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        ${buildMetricCard('Lead Name', name)}
        ${buildMetricCard('Email', email)}
      </tr>
      <tr>
        ${buildMetricCard('Phone', phone)}
        ${buildMetricCard('Submitted', submittedAtUtc)}
      </tr>
      <tr>
        <td colspan="2" style="padding:0 0 18px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:separate; border-spacing:0; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:20px; overflow:hidden;">
            <tr>
              <td style="padding:20px 22px;">
                <div style="font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.48); margin-bottom:10px;">Message</div>
                <div style="font-size:16px; line-height:1.75; color:rgba(255,255,255,0.86);">${formatEmailMultiline(message)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding:0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:separate; border-spacing:0; background:linear-gradient(180deg, rgba(98,208,250,0.12), rgba(98,208,250,0.03)); border:1px solid rgba(98,208,250,0.22); border-radius:20px; overflow:hidden;">
            <tr>
              <td style="padding:20px 22px;">
                <div style="font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:#62d0fa; margin-bottom:12px;">Submission Details</div>
                <div style="font-size:15px; line-height:1.8; color:rgba(255,255,255,0.82);">
                  <strong style="color:#f5f7fb;">Source page:</strong> ${sourceLink}<br />
                  <strong style="color:#f5f7fb;">IP:</strong> ${escapeHtml(ip)}<br />
                  <strong style="color:#f5f7fb;">Reply path:</strong> Use reply to answer ${escapeHtml(name)} directly.
                </div>
                <div style="height:14px;"></div>
                <div style="font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:#62d0fa; margin-bottom:10px;">Admin Actions</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse;">
                  <tr>
                    <td class="mobile-stack" style="padding:0 10px 10px 0;">
                      <a class="mobile-btn" href="${markSpamHref}" style="display:inline-block; padding:11px 16px; border-radius:999px; background:rgba(255,168,99,0.2); border:1px solid rgba(255,168,99,0.55); color:#ffd9bb; font-size:13px; font-weight:700; text-decoration:none;">Mark as Spam</a>
                    </td>
                    <td class="mobile-stack" style="padding:0 10px 10px 0;">
                      <a class="mobile-btn" href="${blockSenderHref}" style="display:inline-block; padding:11px 16px; border-radius:999px; background:rgba(255,96,96,0.18); border:1px solid rgba(255,120,120,0.6); color:#ffd2d2; font-size:13px; font-weight:700; text-decoration:none;">Block Sender</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  return buildEmailShell({
    eyebrow: 'Message Merlin',
    title: `New message from ${name}`,
    subtitle: `${email} | ${phone}`,
    bodyHtml,
    footerHtml: 'This message was generated from the Will Weems portfolio contact flow and styled to match the portfolio interface.',
  });
};

const buildSenderReceiptHtml = ({ name }) => {
  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding:0 0 18px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:separate; border-spacing:0; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:20px; overflow:hidden;">
            <tr>
              <td style="padding:22px 24px; font-size:16px; line-height:1.8; color:rgba(255,255,255,0.82);">
                <div style="margin-bottom:12px; color:#f5f7fb; font-weight:600;">${escapeHtml(name)}, your message is in queue.</div>
                <div>Thank you for reaching out through the portfolio. Sir Dubs will review your note and respond shortly.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:separate; border-spacing:0; background:linear-gradient(180deg, rgba(98,208,250,0.12), rgba(98,208,250,0.03)); border:1px solid rgba(98,208,250,0.22); border-radius:20px; overflow:hidden;">
            <tr>
              <td style="padding:18px 22px; font-size:15px; line-height:1.7; color:rgba(255,255,255,0.78);">
                Until then, may you have the most beautiful day.<br /><br />
                <span style="color:#f5f7fb; font-weight:600;">~ Merlin</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

  return buildEmailShell({
    eyebrow: 'Portfolio Contact',
    title: 'Thank you for reaching out',
    subtitle: 'Your message was received and routed through Merlin Assistant.',
    bodyHtml,
    footerHtml: 'Merlin Assistant is the contact interface for the Will Weems portfolio.',
  });
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const sanitizeEmailHeaderLabel = (value, fallback = 'Portfolio Visitor') => {
  const sanitized = toTrimmedString(value).replace(/["<>]/g, '').replace(/\s+/g, ' ').trim();
  return sanitized || fallback;
};

const extractEmailAddress = (value) => {
  const raw = String(value || '').trim();
  const match = raw.match(/<([^>]+)>/);
  const candidate = (match ? match[1] : raw).trim();
  return isValidEmail(candidate) ? candidate : 'onboarding@resend.dev';
};

const buildInternalFromEmail = ({ configuredFromEmail, name }) => {
  const address = extractEmailAddress(configuredFromEmail);
  const label = sanitizeEmailHeaderLabel(name);
  return `${label} via Merlin <${address}>`;
};

const buildReplyTo = ({ name, email }) => `${sanitizeEmailHeaderLabel(name)} <${email}>`;

const parseRecipientEmails = (value) => {
  const raw = toTrimmedString(value);
  if (!raw) {
    return [];
  }

  const seen = new Set();
  return raw
    .split(/[;,\n]/)
    .map((email) => email.trim())
    .filter((email) => {
      if (!isValidEmail(email) || seen.has(email)) {
        return false;
      }
      seen.add(email);
      return true;
    });
};

const normalizePhone = (value) => value.replace(/[^\d+]/g, '');

const isValidPhone = (value) => /^\+?[0-9]{10,15}$/.test(value);

const parseBody = (rawBody) => {
  if (!rawBody) {
    return {};
  }

  if (typeof rawBody === 'string') {
    try {
      return JSON.parse(rawBody);
    } catch {
      return {};
    }
  }

  if (Buffer.isBuffer(rawBody)) {
    try {
      return JSON.parse(rawBody.toString('utf8'));
    } catch {
      return {};
    }
  }

  if (typeof rawBody === 'object') {
    return rawBody;
  }

  return {};
};

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }

  if (req.socket && req.socket.remoteAddress) {
    return req.socket.remoteAddress;
  }

  return 'unknown';
};

const isRateLimited = (ip) => {
  const now = Date.now();

  for (const [key, timestamps] of rateBuckets.entries()) {
    const recent = timestamps.filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
    if (recent.length > 0) {
      rateBuckets.set(key, recent);
    } else {
      rateBuckets.delete(key);
    }
  }

  const recent = rateBuckets.get(ip) || [];
  if (recent.length >= RATE_MAX_REQUESTS) {
    return true;
  }

  recent.push(now);
  rateBuckets.set(ip, recent);
  return false;
};

const verifyTurnstile = async ({ secret, token, ip }) => {
  if (!secret) {
    return { ok: true };
  }

  if (!token) {
    return { ok: false, error: 'Challenge token missing.' };
  }

  const payload = new URLSearchParams();
  payload.append('secret', secret);
  payload.append('response', token);
  if (ip) {
    payload.append('remoteip', ip);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: payload,
  });

  if (!response.ok) {
    return { ok: false, error: 'Challenge verification failed.' };
  }

  const data = await response.json();
  if (!data.success) {
    return { ok: false, error: 'Challenge verification failed.' };
  }

  return { ok: true };
};

const sendWithResend = async ({ apiKey, fromEmail, toEmails, subject, text, html, replyTo }) => {
  const payload = {
    from: fromEmail,
    to: toEmails,
    subject,
    text,
  };

  if (html) {
    payload.html = html;
  }

  if (replyTo) {
    payload.reply_to = replyTo;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend rejected request: ${details}`);
  }
};

const sendWithTwilio = async ({ accountSid, authToken, fromNumber, toNumber, body }) => {
  const payload = new URLSearchParams();
  payload.append('From', fromNumber);
  payload.append('To', toNumber);
  payload.append('Body', body);

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload.toString(),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Twilio rejected request: ${details}`);
  }
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return res.status(403).json({ ok: false, error: 'Invalid origin.' });
      }
    } catch {
      return res.status(403).json({ ok: false, error: 'Invalid origin.' });
    }
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
  }

  const body = parseBody(req.body);
  const name = toTrimmedString(body.name);
  const phone = toTrimmedString(body.phone);
  const email = toTrimmedString(body.email);
  const message = toTrimmedString(body.message);
  const honeypot = toTrimmedString(body.company);
  const pageUrl = toTrimmedString(body.pageUrl);
  const turnstileToken = toTrimmedString(body.turnstileToken);
  const startedAt = Number(body.startedAt);

  if (honeypot) {
    return res.status(200).json({ ok: true });
  }

  if (!Number.isFinite(startedAt)) {
    return res.status(400).json({ ok: false, error: 'Invalid submission timing.' });
  }

  const elapsedMs = Date.now() - startedAt;
  if (elapsedMs < MIN_FILL_TIME_MS || elapsedMs > MAX_FILL_TIME_MS) {
    return res.status(400).json({ ok: false, error: 'Submission timing check failed.' });
  }

  if (name.length < 2 || name.length > MAX_NAME_LENGTH) {
    return res.status(400).json({ ok: false, error: 'Please provide a valid name.' });
  }

  if (!email || email.length > MAX_EMAIL_LENGTH || !isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Please provide a valid email.' });
  }

  if (!phone || phone.length > MAX_PHONE_LENGTH) {
    return res.status(400).json({ ok: false, error: 'Please provide a valid phone number.' });
  }

  const normalizedPhone = phone ? normalizePhone(phone) : '';
  if (!normalizedPhone || !isValidPhone(normalizedPhone)) {
    return res.status(400).json({ ok: false, error: 'Please provide a valid phone number.' });
  }

  if (message.length < 10 || message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ ok: false, error: 'Please provide a valid message.' });
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  try {
    const turnstileResult = await verifyTurnstile({
      secret: turnstileSecret,
      token: turnstileToken,
      ip,
    });
    if (!turnstileResult.ok) {
      return res.status(400).json({ ok: false, error: turnstileResult.error });
    }
  } catch {
    return res.status(502).json({ ok: false, error: 'Challenge verification failed.' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const parsedRecipients = parseRecipientEmails(process.env.CONTACT_TO_EMAIL);
  const toEmails = parsedRecipients.length > 0 ? parsedRecipients : ['william.weems@gmail.com'];
  const defaultModerationEmail = toTrimmedString(process.env.CONTACT_MODERATION_EMAIL);
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Merlin Assistant <onboarding@resend.dev>';
  const internalFromEmail = buildInternalFromEmail({ configuredFromEmail: fromEmail, name });
  const replyTo = buildReplyTo({ name, email });

  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFromNumber = process.env.TWILIO_FROM_NUMBER;
  const toSmsNumber = process.env.CONTACT_TO_SMS;

  const smsConfigured = Boolean(twilioAccountSid && twilioAuthToken && twilioFromNumber && toSmsNumber);
  const emailConfigured = Boolean(resendApiKey && toEmails.length > 0);

  if (!smsConfigured && !emailConfigured) {
    return res.status(503).json({ ok: false, error: 'Contact service is not configured.' });
  }

  const safePageUrl = pageUrl && pageUrl.length <= 400 ? pageUrl : 'unknown';
  const submittedAtUtc = new Date().toISOString();
  const internalSubject = `Portfolio Inquiry | ${name} | ${email} | ${normalizedPhone}`;
  const internalText = [
    'Message Merlin Lead Brief',
    '',
    'Contact Details',
    '---------------',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${normalizedPhone}`,
    '',
    'Message:',
    message,
    '',
    'Submission Details',
    '------------------',
    `Source page: ${safePageUrl}`,
    `Submitted at (UTC): ${submittedAtUtc}`,
    `IP: ${ip}`,
    '',
    'Responder note: use Reply to respond directly to the sender.',
  ].join('\n');
  const senderReceiptSubject = 'Thank you for reaching out to Sir Dubs';
  const senderReceiptText = [
    'Thank you for reaching out. Sir Dubs will respond shortly.',
    '',
    'May you have the most beautiful day,',
    '',
    '~ Merlin',
  ].join('\n');
  const senderReceiptHtml = buildSenderReceiptHtml({ name });

  const smsText = [
    `Portfolio inquiry from ${name}`,
    `Phone: ${normalizedPhone}`,
    `Email: ${email}`,
    `Page: ${safePageUrl}`,
    `Msg: ${message}`,
  ].join(' | ').slice(0, 1400);

  try {
    const channels = [];

    if (smsConfigured) {
      await sendWithTwilio({
        accountSid: twilioAccountSid,
        authToken: twilioAuthToken,
        fromNumber: twilioFromNumber,
        toNumber: toSmsNumber,
        body: smsText,
      });
      channels.push('sms');
    }

    if (emailConfigured) {
      const internalEmailResults = await Promise.allSettled(
        toEmails.map((recipientEmail) =>
          sendWithResend({
            apiKey: resendApiKey,
            fromEmail: internalFromEmail,
            toEmails: [recipientEmail],
            subject: internalSubject,
            text: internalText,
            html: buildLeadBriefHtml({
              name,
              email,
              phone: normalizedPhone,
              message,
              pageUrl: safePageUrl,
              submittedAtUtc,
              ip,
              moderationEmail: defaultModerationEmail || recipientEmail,
            }),
            replyTo,
          })
        )
      );

      const internalEmailFailure = internalEmailResults.find((result) => result.status === 'rejected');
      if (internalEmailFailure) {
        throw internalEmailFailure.reason;
      }

      channels.push('email');

      // Send a clean acknowledgement to the submitter with no ops/debug metadata.
      let senderReceiptSent = false;
      try {
        await sendWithResend({
          apiKey: resendApiKey,
          fromEmail,
          toEmails: [email],
          subject: senderReceiptSubject,
          text: senderReceiptText,
          html: senderReceiptHtml,
        });
        senderReceiptSent = true;
      } catch {
        senderReceiptSent = false;
      }

      return res.status(200).json({ ok: true, channels, senderReceiptSent });
    }

    return res.status(200).json({ ok: true, channels });
  } catch {
    return res.status(502).json({ ok: false, error: 'Unable to send message right now. Please try again soon.' });
  }
};

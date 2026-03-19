const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const MIN_FILL_TIME_MS = 3500;
const MAX_FILL_TIME_MS = 60 * 60 * 1000;

const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 150;
const MAX_MESSAGE_LENGTH = 2000;

const rateBuckets = new Map();

const toTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

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

const sendWithResend = async ({ apiKey, fromEmail, toEmail, subject, text, replyTo }) => {
  const payload = {
    from: fromEmail,
    to: [toEmail],
    subject,
    text,
  };

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

  if (email.length < 5 || email.length > MAX_EMAIL_LENGTH || !isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Please provide a valid email.' });
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
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Merlin Assistant <onboarding@resend.dev>';

  if (!resendApiKey || !toEmail) {
    return res.status(503).json({ ok: false, error: 'Contact service is not configured.' });
  }

  const safePageUrl = pageUrl && pageUrl.length <= 400 ? pageUrl : 'unknown';
  const subject = `Portfolio inquiry from ${name}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Source page: ${safePageUrl}`,
    `IP: ${ip}`,
    '',
    'Message:',
    message,
  ].join('\n');

  try {
    await sendWithResend({
      apiKey: resendApiKey,
      fromEmail,
      toEmail,
      subject,
      text,
      replyTo: email,
    });

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, error: 'Unable to send message right now. Please try again soon.' });
  }
};

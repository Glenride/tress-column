/**
 * POST /api/waitlist — Tress Column waitlist signup
 *
 * Mirrors the gateway contact backend (~/workspace/repos/dvaughnhouse/
 * gateway-com/functions/api/contact.js): validation, honeypot, per-IP
 * rate limit 5/hour, 503 when D1 is not bound — never silently drops
 * a signup.
 *
 * Storage: bound D1 database (binding name: DB), table `waitlist`.
 * Privacy: the waitlist table holds email + name + interest + timestamp
 * ONLY — no IP addresses, no user agents. IPs live only in the
 * rate_limits table, as the contact pattern does.
 *
 * Dedupe: an email already on the list returns ok + already_registered,
 * never an error, and is never duplicated.
 *
 * Notification: best-effort email via Resend (env RESEND_API_KEY) to
 * dvaughnhouse@gmail.com. A failed send never fails a stored signup.
 * If RESEND_API_KEY is unset, the signup still stores and returns ok.
 */

const INTERESTS = {
  passes: "Tress Column Plus passes",
  launching: "Launching on Tress Column",
  both: "Both",
};
const RATE_LIMIT_MAX = 5; // signups per IP per hour
const NOTIFY_TO = "dvaughnhouse@gmail.com";
const NOTIFY_FROM = "waitlist@dvaughnhouse.com";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export async function onRequestPost({ request, env }) {
  // Storage not wired yet — fail loudly, never silently.
  if (!env.DB) {
    return json({ ok: false, error: "storage_not_configured" }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // Honeypot: bots fill it, humans don't. Pretend success either way.
  if (body.company && String(body.company).trim() !== "") {
    return json({ ok: true }, 200);
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const interest = String(body.interest || "").trim();

  if (name.length > 100) {
    return json({ ok: false, error: "invalid_name" }, 400);
  }
  if (!isValidEmail(email) || email.length > 254) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }
  if (!Object.prototype.hasOwnProperty.call(INTERESTS, interest)) {
    return json({ ok: false, error: "invalid_interest" }, 400);
  }

  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown";

  // Rate limit: 5 signups per IP per rolling hour.
  const now = new Date();
  const windowStart = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const rl = await env.DB.prepare(
    "SELECT count, window_start FROM rate_limits WHERE ip = ?"
  )
    .bind(ip)
    .first();

  if (rl && rl.window_start > windowStart && rl.count >= RATE_LIMIT_MAX) {
    return json({ ok: false, error: "rate_limited" }, 429);
  }
  if (rl && rl.window_start > windowStart) {
    await env.DB.prepare(
      "UPDATE rate_limits SET count = count + 1 WHERE ip = ?"
    )
      .bind(ip)
      .run();
  } else {
    await env.DB.prepare(
      "INSERT OR REPLACE INTO rate_limits (ip, count, window_start) VALUES (?, 1, ?)"
    )
      .bind(ip, now.toISOString())
      .run();
  }

  // Dedupe: already on the list is a success, not an error.
  const existing = await env.DB.prepare(
    "SELECT email FROM waitlist WHERE email = ?"
  )
    .bind(email)
    .first();
  if (existing) {
    return json({ ok: true, already_registered: true }, 200);
  }

  await env.DB.prepare(
    "INSERT INTO waitlist (email, name, interest, created_at) VALUES (?, ?, ?, ?)"
  )
    .bind(email, name === "" ? null : name, interest, now.toISOString())
    .run();

  // Email ping: best-effort. The D1 record above is the source of truth;
  // a failed send never fails the submission.
  if (env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: NOTIFY_FROM,
          to: NOTIFY_TO,
          subject: "New Tress Column waitlist signup",
          text:
            `Email: ${email}\n` +
            `Name: ${name === "" ? "(not given)" : name}\n` +
            `Interest: ${INTERESTS[interest]}\n`,
        }),
      });
    } catch {
      // Swallowed on purpose — the signup is already stored.
    }
  }

  return json({ ok: true }, 200);
}

// Anything other than POST: method not allowed.
// OPTIONS is the CORS preflight: answer it so a same-origin fetch with
// a JSON body never trips on it.
export async function onRequest({ request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  return json({ ok: false, error: "method_not_allowed" }, 405);
}

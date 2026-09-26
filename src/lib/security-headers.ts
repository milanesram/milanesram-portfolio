/**
 * Response headers for the portfolio.
 *
 * Framing uses CSP `frame-ancestors 'none'`. `X-Frame-Options: DENY` is
 * kept for browsers that ignore `frame-ancestors`.
 *
 * `script-src` and `style-src` allow `'unsafe-inline'` because this Next.js
 * app emits inline bootstrap scripts and font styles. A nonce policy would
 * need a request-time proxy and is not used here. There is no `*` source.
 *
 * LinkedIn's profile badge runs only on the contact page, but these headers
 * are site-wide so that page can load `platform.linkedin.com`. That script
 * then loads `https://badges.linkedin.com`, which is allowed as a script and
 * as a frame. There is no wildcard host.
 */

export function contentSecurityPolicy(
  supabaseUrl: string | undefined,
): string {
  const connect = ["'self'"];
  const img = ["'self'", "data:", "blob:"];
  const supabaseOrigin = readHttpsOrigin(supabaseUrl);

  if (supabaseOrigin) {
    connect.push(supabaseOrigin);
    connect.push(supabaseOrigin.replace(/^https:/, "wss:"));
    img.push(supabaseOrigin);
  }

  connect.push("https://www.linkedin.com", "https://platform.linkedin.com");
  img.push("https://media.licdn.com", "https://static.licdn.com");

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline' https://platform.linkedin.com https://badges.linkedin.com",
    "style-src 'self' 'unsafe-inline'",
    `img-src ${img.join(" ")}`,
    "font-src 'self'",
    `connect-src ${connect.join(" ")}`,
    "frame-src https://www.linkedin.com https://badges.linkedin.com",
  ].join("; ");
}

export function securityHeaders(supabaseUrl: string | undefined): Array<{
  key: string;
  value: string;
}> {
  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    {
      key: "Content-Security-Policy",
      value: contentSecurityPolicy(supabaseUrl),
    },
  ];
}

function readHttpsOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" || !url.hostname) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

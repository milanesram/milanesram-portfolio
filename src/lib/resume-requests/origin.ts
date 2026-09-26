export function isAllowedResumeRequestOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  const allowed = new Set<string>();
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  if (configured) {
    allowed.add(configured);
  }

  try {
    allowed.add(new URL(request.url).origin);
  } catch {
    return false;
  }

  const vercelHost = process.env.VERCEL_URL?.replace(/\/$/, "");

  if (vercelHost) {
    allowed.add(`https://${vercelHost}`);
  }

  return allowed.has(origin.replace(/\/$/, ""));
}

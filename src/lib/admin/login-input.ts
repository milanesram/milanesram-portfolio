const EMAIL_MAX = 254;
const PASSWORD_MAX = 256;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ParsedLogin =
  | { ok: true; email: string; password: string }
  | { ok: false; error: string };

export function parseLoginFormData(formData: FormData): ParsedLogin {
  const emailRaw = formData.get("email");
  const passwordRaw = formData.get("password");

  if (typeof emailRaw !== "string" || typeof passwordRaw !== "string") {
    return { ok: false, error: "Enter your email and password." };
  }

  const email = emailRaw.trim().toLowerCase();
  const password = passwordRaw;

  if (!email || !password) {
    return { ok: false, error: "Enter your email and password." };
  }

  if (email.length > EMAIL_MAX || password.length > PASSWORD_MAX) {
    return { ok: false, error: "Enter your email and password." };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  return { ok: true, email, password };
}

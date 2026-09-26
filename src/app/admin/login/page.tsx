import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminContext, loginRedirectFor } from "@/lib/admin/authorization";
import { adminRedirectFor, safeAdminNext } from "@/lib/admin/mfa-policy";
import { createPageMetadata } from "@/lib/metadata";
import { redirect } from "next/navigation";

export const metadata = {
  ...createPageMetadata(
    "Admin sign in",
    "Sign in to administer the portfolio.",
    "/admin/login",
  ),
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const context = await getAdminContext();
  const destination = loginRedirectFor(context);
  const params = await searchParams;
  const requested = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = safeAdminNext(requested);

  if (destination) {
    if (context.gate === "ready" || context.gate === "challenge") {
      redirect(adminRedirectFor(context.gate, next));
    }

    redirect(destination);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16 sm:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
        Administration
      </p>
      <h1 className="mt-3 font-serif text-3xl text-ink">Sign in</h1>
      <p className="mt-3 text-base leading-7 text-ink-soft">
        Owner access only. There is no public registration.
      </p>
      <div className="mt-8 rounded-xl border border-line bg-paper-elevated p-6">
        <AdminLoginForm next={next} />
      </div>
    </div>
  );
}

import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { AdminMfaBlocked } from "@/components/admin/AdminMfaBlocked";
import { AdminMfaChallengeForm } from "@/components/admin/AdminMfaChallengeForm";
import { getAdminContext } from "@/lib/admin/authorization";
import { safeAdminNext } from "@/lib/admin/mfa-policy";
import { createPageMetadata } from "@/lib/metadata";
import { redirect } from "next/navigation";

export const metadata = {
  ...createPageMetadata(
    "Authenticator check",
    "Confirm the authenticator code for portfolio administration.",
    "/admin/mfa/challenge",
  ),
  robots: { index: false, follow: false },
};

export default async function AdminMfaChallengePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const context = await getAdminContext();
  const params = await searchParams;
  const requested = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = safeAdminNext(requested);

  if (context.gate === "anonymous") {
    redirect(context.redirectTo);
  }

  if (context.gate === "denied") {
    return <AdminAccessDenied email={context.email} />;
  }

  if (context.gate === "blocked") {
    return <AdminMfaBlocked />;
  }

  if (context.gate !== "challenge") {
    redirect(context.gate === "ready" ? next : context.redirectTo);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16 sm:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
        Administration
      </p>
      <h1 className="mt-3 font-serif text-3xl text-ink">Authenticator check</h1>
      <p className="mt-3 text-base leading-7 text-ink-soft">
        Enter the current six-digit code from your authenticator app.
      </p>
      <div className="mt-8 rounded-xl border border-line bg-paper-elevated p-6">
        <AdminMfaChallengeForm next={next} />
      </div>
    </div>
  );
}

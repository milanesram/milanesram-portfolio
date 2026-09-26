import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { AdminMfaBlocked } from "@/components/admin/AdminMfaBlocked";
import { AdminMfaEnrollForm } from "@/components/admin/AdminMfaEnrollForm";
import { getAdminContext } from "@/lib/admin/authorization";
import { createPageMetadata } from "@/lib/metadata";
import { redirect } from "next/navigation";

export const metadata = {
  ...createPageMetadata(
    "Set up authenticator",
    "Set up an authenticator for portfolio administration.",
    "/admin/mfa/enroll",
  ),
  robots: { index: false, follow: false },
};

export default async function AdminMfaEnrollPage() {
  const context = await getAdminContext();

  if (context.gate === "anonymous") {
    redirect(context.redirectTo);
  }

  if (context.gate === "denied") {
    return <AdminAccessDenied email={context.email} />;
  }

  if (context.gate === "blocked") {
    return <AdminMfaBlocked />;
  }

  if (context.gate !== "enroll") {
    redirect(context.redirectTo);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16 sm:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-copper">
        Administration
      </p>
      <h1 className="mt-3 font-serif text-3xl text-ink">Set up authenticator</h1>
      <p className="mt-3 text-base leading-7 text-ink-soft">
        Add this site to an authenticator app, then enter the current six-digit
        code. Administration stays closed until that code is verified.
      </p>
      <div className="mt-8 rounded-xl border border-line bg-paper-elevated p-6">
        <AdminMfaEnrollForm />
      </div>
    </div>
  );
}

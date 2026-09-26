import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminContext } from "@/lib/admin/authorization";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const context = await getAdminContext();

  if (context.gate === "denied") {
    return <AdminAccessDenied email={context.email} />;
  }

  if (context.gate !== "ready") {
    redirect(context.redirectTo);
  }

  return <AdminShell email={context.email} />;
}

import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminContext } from "@/lib/admin/authorization";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const context = await getAdminContext();

  if (!context.signedIn) {
    redirect("/admin/login");
  }

  if (!context.isAdmin) {
    return <AdminAccessDenied email={context.email} />;
  }

  return <AdminShell email={context.email} />;
}

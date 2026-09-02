import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { AdminChrome } from "@/components/admin/AdminChrome";
import { getAdminContext } from "@/lib/admin/authorization";
import { redirect } from "next/navigation";

export default async function SeoAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getAdminContext();

  if (!context.signedIn) {
    redirect("/admin/login");
  }

  if (!context.isAdmin) {
    return <AdminAccessDenied email={context.email} />;
  }

  return <AdminChrome email={context.email} title="SEO">{children}</AdminChrome>;
}

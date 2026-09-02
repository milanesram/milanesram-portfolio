import Link from "next/link";
import { AboutForm } from "@/components/admin/AboutForm";
import { requireAdminMutation } from "@/lib/admin/authorization";
import {
  getAdminAboutPage,
  listAdminAboutListItems,
  listAdminAboutParagraphs,
} from "@/lib/admin/about/queries";
import { redirect } from "next/navigation";

export default async function AdminAboutPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const pageResult = await getAdminAboutPage(auth.supabase);
  const aboutPageId = pageResult.data?.id ?? null;

  const [paragraphsResult, listItemsResult] = await Promise.all([
    aboutPageId
      ? listAdminAboutParagraphs(auth.supabase, aboutPageId)
      : Promise.resolve({ data: [], error: null }),
    aboutPageId
      ? listAdminAboutListItems(auth.supabase, aboutPageId)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const loadError =
    pageResult.error || paragraphsResult.error || listItemsResult.error;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl text-ink">About page</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Published About copy. Journey milestones are managed separately.
          Education facts stay on static credentials until a later step.
        </p>
        <p className="mt-3">
          <Link href="/admin/journey" className="text-sm font-medium text-accent hover:underline">
            Manage Journey milestones
          </Link>
        </p>
      </div>

      {loadError ? (
        <p role="alert" className="text-sm text-danger">
          About settings could not be loaded.
        </p>
      ) : (
        <AboutForm
          page={pageResult.data}
          paragraphs={paragraphsResult.data ?? []}
          listItems={listItemsResult.data ?? []}
        />
      )}
    </div>
  );
}

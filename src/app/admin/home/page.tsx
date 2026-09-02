import { HomeForm } from "@/components/admin/HomeForm";
import { requireAdminMutation } from "@/lib/admin/authorization";
import {
  getAdminHomePage,
  listAdminHomeChips,
  listAdminHomeCredentialChoices,
  listAdminHomeCredentialLinks,
  listAdminHomeExperienceChoices,
  listAdminHomeExperienceLinks,
  listAdminHomeProjectChoices,
  listAdminHomeProofItems,
} from "@/lib/admin/home/queries";
import { redirect } from "next/navigation";

export default async function AdminHomePage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const pageResult = await getAdminHomePage(auth.supabase);
  const homePageId = pageResult.data?.id ?? null;

  const [
    chipsResult,
    proofResult,
    experienceLinksResult,
    credentialLinksResult,
    experienceChoicesResult,
    credentialChoicesResult,
    projectChoicesResult,
  ] = await Promise.all([
    homePageId
      ? listAdminHomeChips(auth.supabase, homePageId)
      : Promise.resolve({ data: [], error: null }),
    homePageId
      ? listAdminHomeProofItems(auth.supabase, homePageId)
      : Promise.resolve({ data: [], error: null }),
    homePageId
      ? listAdminHomeExperienceLinks(auth.supabase, homePageId)
      : Promise.resolve({ data: [], error: null }),
    homePageId
      ? listAdminHomeCredentialLinks(auth.supabase, homePageId)
      : Promise.resolve({ data: [], error: null }),
    listAdminHomeExperienceChoices(auth.supabase),
    listAdminHomeCredentialChoices(auth.supabase),
    listAdminHomeProjectChoices(auth.supabase),
  ]);

  const loadError =
    pageResult.error ||
    chipsResult.error ||
    proofResult.error ||
    experienceLinksResult.error ||
    credentialLinksResult.error ||
    experienceChoicesResult.error ||
    credentialChoicesResult.error ||
    projectChoicesResult.error;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl text-ink">Home page</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Published Home copy and UUID relationships. Experience and credential
          facts stay in their own tables. Track cards read hosted Focus records.
        </p>
      </div>

      {loadError ? (
        <p role="alert" className="text-sm text-danger">
          Home settings could not be loaded.
        </p>
      ) : (
        <HomeForm
          page={pageResult.data}
          chips={chipsResult.data ?? []}
          proofItems={proofResult.data ?? []}
          experienceLinks={experienceLinksResult.data ?? []}
          credentialLinks={credentialLinksResult.data ?? []}
          experienceChoices={experienceChoicesResult.data ?? []}
          credentialChoices={credentialChoicesResult.data ?? []}
          projectChoices={projectChoicesResult.data ?? []}
        />
      )}
    </div>
  );
}

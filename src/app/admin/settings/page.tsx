import {
  SiteProfileForm,
  SiteSettingsForm,
} from "@/components/admin/SettingsForms";
import { requireAdminMutation } from "@/lib/admin/authorization";
import {
  getAdminSiteProfile,
  getAdminSiteSettings,
} from "@/lib/admin/settings/queries";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const auth = await requireAdminMutation();

  if (!auth.ok) {
    redirect("/admin/login");
  }

  const [profileResult, settingsResult] = await Promise.all([
    getAdminSiteProfile(auth.supabase),
    getAdminSiteSettings(auth.supabase),
  ]);

  return (
    <div className="space-y-12">
      <div>
        <h2 className="font-serif text-2xl text-ink">Site settings</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Two singleton rows: <code>site_profile</code> (public identity when
          published) and <code>site_settings</code> (public website flags and
          the release label). There is no delete action.
        </p>
      </div>

      <section
        aria-labelledby="site-profile-heading"
        className="rounded-xl border border-line bg-paper-elevated p-6"
      >
        <h3 id="site-profile-heading" className="font-serif text-xl text-ink">
          Profile
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Schema-backed public chrome only. Do not store owner Auth email,
          secrets, or private contact details here.
        </p>
        {profileResult.error ? (
          <p role="alert" className="mt-6 text-sm text-danger">
            The site profile could not be loaded.
          </p>
        ) : (
          <div className="mt-6">
            <SiteProfileForm profile={profileResult.data} />
          </div>
        )}
      </section>

      <section
        aria-labelledby="site-flags-heading"
        className="rounded-xl border border-line bg-paper-elevated p-6"
      >
        <h3 id="site-flags-heading" className="font-serif text-xl text-ink">
          Website flags
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Contact, indexing, and the public version label are readable by
          anonymous visitors by design. Do not add secrets to this table.
        </p>
        {settingsResult.error ? (
          <p role="alert" className="mt-6 text-sm text-danger">
            Site settings could not be loaded.
          </p>
        ) : (
          <div className="mt-6">
            <SiteSettingsForm settings={settingsResult.data} />
          </div>
        )}
      </section>
    </div>
  );
}

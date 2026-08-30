import { SkillFocusForm } from "@/components/admin/SkillFocusForm";

export default function NewSkillGroupPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl text-ink">New skill group</h2>
      <p className="mt-2 text-sm leading-6 text-ink-soft">
        New records are stored in <code>focus_pages</code> with an empty
        competencies array and default to draft unless you publish. Add skills
        after the group exists. Public pages will not show this until they are
        switched to the Supabase adapter.
      </p>
      <div className="mt-8 rounded-xl border border-line bg-paper-elevated p-6">
        <SkillFocusForm />
      </div>
    </div>
  );
}

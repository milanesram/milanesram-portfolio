import { notFound } from "next/navigation";
import { CallToAction } from "@/components/ui/CallToAction";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import {
  getPublishedProjectBySlug,
  toPresentationProject,
  toPresentationSection,
} from "@/lib/content/projects";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(
  "PrivAI Guard",
  "Shadow AI privacy-risk triage capstone MVP — structured assessment, human review, remediation, and audit evidence. Non-production, synthetic data only.",
  "/projects/privai-guard",
);

export default async function PrivaiGuardPage() {
  const project = await getPublishedProjectBySlug("privai-guard");

  if (!project) {
    notFound();
  }

  const view = toPresentationProject(project);
  const sections = project.sections.map(toPresentationSection);

  return (
    <>
      <PageHero
        kicker="Case study · Northwestern MSIS capstone · 2026"
        title={view.name}
        lede={view.summary}
      >
        <p className="max-w-2xl rounded-xl bg-accent-soft px-4 py-3 text-sm leading-6 text-ink">
          {view.limits}
        </p>
      </PageHero>
      <Container narrow className="py-16">
        <p className="text-sm text-ink-faint">Role: {view.role}</p>

        {sections.map((section) => (
          <section key={section.id} className="mt-12">
            <h2 className="font-serif text-2xl font-medium text-ink">
              {section.heading}
            </h2>
            <p className="mt-4 leading-8 text-ink-soft">{section.body}</p>
          </section>
        ))}

        <section className="mt-12">
          <h2 className="font-serif text-2xl font-medium text-ink">Stack</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {view.stack.map((item) => (
              <li
                key={item}
                className="rounded-full border border-line px-3 py-1 font-mono text-xs text-ink-soft"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-16">
          <CallToAction title="Discuss this work" />
        </div>
      </Container>
    </>
  );
}

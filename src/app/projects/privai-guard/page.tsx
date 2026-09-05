import { notFound } from "next/navigation";
import { CallToAction } from "@/components/ui/CallToAction";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { PrivaiGuardEarlyEvidence } from "@/components/projects/PrivaiGuardEarlyEvidence";
import { ProjectWorkflowGallery } from "@/components/projects/ProjectWorkflowGallery";
import {
  PRIVAI_PAGE_DESCRIPTION,
  privaiHeroBoundary,
  privaiSectionAnchorId,
  selectPrivaiEarlyCapabilities,
  selectPrivaiEarlyPreview,
} from "@/lib/content/privai-evidence";
import {
  getPublishedProjectBySlug,
  toPresentationProject,
  toPresentationSection,
} from "@/lib/content/projects";
import { createPageMetadata, withPublicRobots } from "@/lib/metadata";

export const dynamic = "force-dynamic";

const MICROSITE_URL = "https://priv-ai-guard-audience-microsite.vercel.app/";

export async function generateMetadata() {
  return withPublicRobots(
    createPageMetadata(
      "PrivAI Guard",
      PRIVAI_PAGE_DESCRIPTION,
      "/projects/privai-guard",
    ),
  );
}

export default async function PrivaiGuardPage() {
  const project = await getPublishedProjectBySlug("privai-guard");

  if (!project) {
    notFound();
  }

  const view = toPresentationProject(project);
  const sections = project.sections.map(toPresentationSection);
  const earlyCapabilities = selectPrivaiEarlyCapabilities(
    project.sections,
    project.media,
  );
  const earlyPreview = selectPrivaiEarlyPreview(project.media);
  const hasWorkflowSection = sections.some((section) => section.id === "workflow");

  return (
    <>
      <PageHero
        kicker="Case study · Northwestern MSIS capstone · 2026"
        title={view.name}
        lede={view.summary}
      >
        <p className="max-w-2xl text-base leading-7 text-ink">
          <span className="font-medium">Role:</span> {view.role}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
          {privaiHeroBoundary(view.limits)}
        </p>
      </PageHero>
      <Container narrow className="py-16">
        <PrivaiGuardEarlyEvidence
          capabilities={earlyCapabilities}
          stack={view.stack}
          preview={earlyPreview}
        />

        {sections.map((section) => {
          const anchorId = privaiSectionAnchorId(section.id);

          return (
            <div key={section.id}>
              <section className="mt-12 scroll-mt-24" id={anchorId}>
                <h2 className="font-serif text-2xl font-medium text-ink">
                  {section.heading}
                </h2>
                <p className="mt-4 whitespace-pre-line leading-8 text-ink-soft">
                  {section.body}
                </p>
              </section>
              {section.id === "workflow" ? (
                <ProjectWorkflowGallery
                  items={project.media}
                  preloadFirst={!earlyPreview}
                />
              ) : null}
            </div>
          );
        })}

        {!hasWorkflowSection ? (
          <ProjectWorkflowGallery
            items={project.media}
            preloadFirst={!earlyPreview}
          />
        ) : null}

        <div className="mt-16 space-y-6">
          <ButtonLink href={MICROSITE_URL} variant="secondary" external>
            Explore the PrivAI Guard capstone microsite
          </ButtonLink>
          <CallToAction title="Discuss this work" />
        </div>
      </Container>
    </>
  );
}

import { PageHero } from "@/components/ui/PageHero";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Container } from "@/components/layout/Container";
import {
  getPublishedProjects,
  toPresentationProject,
} from "@/lib/content/projects";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(
  "Projects",
  "Selected work including PrivAI Guard, a Shadow AI privacy-risk triage capstone, and national privacy-regulatory systems.",
  "/projects",
);

export default async function ProjectsPage() {
  const result = await getPublishedProjects();

  return (
    <>
      <PageHero
        kicker="Projects"
        title="Selected work"
        lede="PrivAI Guard is the flagship technical case study. The national systems are described at public-function level only."
      />
      <Container className="grid gap-6 py-16 lg:grid-cols-2">
        {result.ok ? (
          result.projects.length === 0 ? (
            <p className="text-base leading-7 text-ink-soft lg:col-span-2">
              No published projects are available.
            </p>
          ) : (
            result.projects.map((project) => {
              const view = toPresentationProject(project);
              return (
                <ProjectCard
                  key={view.slug}
                  project={view}
                  featured={view.featured}
                />
              );
            })
          )
        ) : (
          <p className="text-base leading-7 text-ink-soft lg:col-span-2">
            Projects are temporarily unavailable.
          </p>
        )}
      </Container>
    </>
  );
}

import { PageHero } from "@/components/ui/PageHero";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Container } from "@/components/layout/Container";
import { getPublishedProjectsPage } from "@/lib/content/projects-chrome";
import {
  getPublishedProjects,
  toPresentationProject,
} from "@/lib/content/projects";
import { generateRouteMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return generateRouteMetadata("projects");
}

export default async function ProjectsPage() {
  const [chromeResult, result] = await Promise.all([
    getPublishedProjectsPage(),
    getPublishedProjects(),
  ]);

  if (!chromeResult.ok) {
    return (
      <>
        <PageHero
          kicker="Projects"
          title="Projects"
          lede="Projects are temporarily unavailable."
        />
        <Container className="py-16">
          <p className="text-base leading-7 text-ink-soft">
            Projects are temporarily unavailable.
          </p>
        </Container>
      </>
    );
  }

  if (!chromeResult.page) {
    return (
      <>
        <PageHero
          kicker="Projects"
          title="Projects"
          lede="This page is not published."
        />
        <Container className="py-16">
          <p className="text-base leading-7 text-ink-soft">
            Projects page framing is not published.
          </p>
        </Container>
      </>
    );
  }

  const chrome = chromeResult.page;

  return (
    <>
      <PageHero
        kicker={chrome.kicker}
        title={chrome.headline}
        lede={chrome.lede}
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

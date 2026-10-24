import { PageHero } from "@/components/ui/PageHero";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Container } from "@/components/layout/Container";
import { getPublishedProjectsPage } from "@/lib/content/projects-chrome";
import {
  getPublishedLeadMediaBySlug,
  getPublishedProjects,
  toPresentationProject,
} from "@/lib/content/projects";
import { arrangeProjectsIndex } from "@/lib/content/projects-index";
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
  const arranged = result.ok ? arrangeProjectsIndex(result.projects) : null;
  const leadMedia = result.ok
    ? await getPublishedLeadMediaBySlug(result.projects.map((project) => project.slug))
    : new Map();

  return (
    <>
      <PageHero
        kicker={chrome.kicker}
        title={chrome.headline}
        lede={chrome.lede}
      />
      <Container className="flex flex-col gap-10 py-16">
        {!result.ok ? (
          <p className="text-base leading-7 text-ink-soft">
            Projects are temporarily unavailable.
          </p>
        ) : result.projects.length === 0 ? (
          <p className="text-base leading-7 text-ink-soft">
            No published projects are available.
          </p>
        ) : arranged ? (
          <>
            {arranged.featured ? (
              <ProjectCard
                project={toPresentationProject(arranged.featured)}
                featured={arranged.featured.featured}
                headingLevel="h2"
                layout="alongside"
                leadMedia={leadMedia.get(arranged.featured.slug) ?? null}
              />
            ) : null}
            {arranged.rest.length > 0 ? (
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                {arranged.rest.map((project) => {
                  const view = toPresentationProject(project);
                  return (
                    <ProjectCard
                      key={view.slug}
                      project={view}
                      featured={view.featured}
                      headingLevel="h2"
                      leadMedia={leadMedia.get(view.slug) ?? null}
                    />
                  );
                })}
              </div>
            ) : null}
          </>
        ) : null}
      </Container>
    </>
  );
}

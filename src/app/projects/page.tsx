import { PageHero } from "@/components/ui/PageHero";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Container } from "@/components/layout/Container";
import { projects } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(
  "Projects",
  "Selected work including PrivAI Guard, a Shadow AI privacy-risk triage capstone, and national privacy-regulatory systems.",
  "/projects",
);

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        kicker="Projects"
        title="Selected work"
        lede="PrivAI Guard is the flagship technical case study. The national systems are described at public-function level only."
      />
      <Container className="grid gap-6 py-16 lg:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            featured={project.featured}
          />
        ))}
      </Container>
    </>
  );
}

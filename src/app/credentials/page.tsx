import { CredentialCard } from "@/components/ui/CredentialCard";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import { publicCredentials } from "@/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata(
  "Credentials",
  "Northwestern MSIS security specialization, CIPM, ISC2 CC, specialized cybersecurity training, and Philippine legal licensure.",
  "/credentials",
);

const groups = [
  { id: "degree", title: "Education" },
  { id: "certification", title: "Certifications" },
  { id: "training", title: "Specialized training" },
  { id: "license", title: "Legal licensure" },
] as const;

export default function CredentialsPage() {
  return (
    <>
      <PageHero
        kicker="Credentials"
        title="Education, certifications, and licensure"
        lede="Philippine legal licensure is listed separately and is not U.S. bar admission."
      />
      <Container className="space-y-14 py-16">
        {groups.map((group) => {
          const items = publicCredentials.filter((item) => item.kind === group.id);
          if (items.length === 0) {
            return null;
          }

          return (
            <section key={group.id}>
              <h2 className="font-serif text-2xl font-medium text-ink">{group.title}</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {items.map((credential) => (
                  <CredentialCard key={credential.id} credential={credential} />
                ))}
              </div>
            </section>
          );
        })}
      </Container>
    </>
  );
}

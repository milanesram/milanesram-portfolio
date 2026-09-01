import { CredentialCard } from "@/components/ui/CredentialCard";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import {
  getPublishedCredentials,
  toPresentationCredential,
} from "@/lib/content/credentials";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(
  "Credentials",
  "Earned Northwestern MSIS (Security Specialization), CIPM, ISC2 Certified in Cybersecurity, specialized cybersecurity training, and Philippine legal licensure.",
  "/credentials",
);

const groups = [
  { id: "degree", title: "Education" },
  { id: "certification", title: "Certifications" },
  { id: "training", title: "Specialized training" },
  { id: "license", title: "Legal licensure" },
] as const;

export default async function CredentialsPage() {
  const result = await getPublishedCredentials();

  return (
    <>
      <PageHero
        kicker="Credentials"
        title="Education, certifications, and licensure"
        lede="Selected verified credentials that support cybersecurity governance, GRC, privacy, and AI-governance work. Philippine legal licensure is listed separately and is not U.S. bar admission."
      />
      <Container className="space-y-14 py-16">
        {result.ok ? (
          result.credentials.length === 0 ? (
            <p className="text-base leading-7 text-ink-soft">
              No published credentials are available.
            </p>
          ) : (
            groups.map((group) => {
              const items = result.credentials
                .filter((item) => item.kind === group.id)
                .map(toPresentationCredential);
              if (items.length === 0) {
                return null;
              }

              return (
                <section key={group.id}>
                  <h2 className="font-serif text-2xl font-medium text-ink">
                    {group.title}
                  </h2>
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    {items.map((credential) => (
                      <CredentialCard
                        key={credential.id}
                        credential={credential}
                      />
                    ))}
                  </div>
                </section>
              );
            })
          )
        ) : (
          <p className="text-base leading-7 text-ink-soft">
            Credentials are temporarily unavailable.
          </p>
        )}
      </Container>
    </>
  );
}

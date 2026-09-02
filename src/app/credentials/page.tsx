import { CredentialCard } from "@/components/ui/CredentialCard";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/layout/Container";
import {
  getPublishedCredentials,
  getPublishedCredentialsPage,
  toPresentationCredential,
} from "@/lib/content/credentials";
import { generateRouteMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return generateRouteMetadata("credentials");
}

const groups = [
  { id: "degree", title: "Education" },
  { id: "certification", title: "Certifications" },
  { id: "training", title: "Specialized training" },
  { id: "license", title: "Legal licensure" },
] as const;

export default async function CredentialsPage() {
  const [pageResult, credentialsResult] = await Promise.all([
    getPublishedCredentialsPage(),
    getPublishedCredentials(),
  ]);

  if (!pageResult.ok || !credentialsResult.ok) {
    return (
      <>
        <PageHero
          kicker="Credentials"
          title="Credentials"
          lede="Credentials are temporarily unavailable."
        />
        <Container className="py-16">
          <p className="text-base leading-7 text-ink-soft">
            Credentials are temporarily unavailable.
          </p>
        </Container>
      </>
    );
  }

  if (!pageResult.page) {
    return (
      <>
        <PageHero
          kicker="Credentials"
          title="Credentials"
          lede="This page is not published."
        />
        <Container className="py-16">
          <p className="text-base leading-7 text-ink-soft">
            Credentials are not published.
          </p>
        </Container>
      </>
    );
  }

  const page = pageResult.page;

  return (
    <>
      <PageHero kicker={page.kicker} title={page.headline} lede={page.lede} />
      <Container className="space-y-14 py-16">
        {credentialsResult.credentials.length === 0 ? (
          <p className="text-base leading-7 text-ink-soft">
            No published credentials are available.
          </p>
        ) : (
          groups.map((group) => {
            const items = credentialsResult.credentials
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
        )}
      </Container>
    </>
  );
}

export type PublicContactPage = {
  kicker: string;
  headline: string;
  lede: string;
  emailEnabled: boolean;
  linkedinEnabled: boolean;
  emailLabel: string;
  linkedinLabel: string;
  formIntro: string;
  ctaHeading: string;
  ctaLede: string;
};

export type PublicContactChannel = {
  label: string;
  href: string;
  text: string;
  external: boolean;
};

export type ResumeContactChannels = {
  email: PublicContactChannel | null;
  linkedin: PublicContactChannel | null;
};

export type ContactPageRow = {
  status: string;
  kicker: string;
  headline: string;
  lede: string;
  email_enabled: boolean;
  linkedin_enabled: boolean;
  email_label: string;
  linkedin_label: string;
  form_intro: string;
  cta_heading: string;
  cta_lede: string;
};

export function mapContactPage(row: ContactPageRow): PublicContactPage | null {
  if (row.status !== "published") {
    return null;
  }

  const headline = row.headline.trim();
  const lede = row.lede.trim();

  if (!headline || !lede) {
    return null;
  }

  return {
    kicker: row.kicker.trim() || "Contact",
    headline,
    lede,
    emailEnabled: row.email_enabled,
    linkedinEnabled: row.linkedin_enabled,
    emailLabel: row.email_label.trim() || "Email",
    linkedinLabel: row.linkedin_label.trim() || "LinkedIn",
    formIntro: row.form_intro.trim(),
    ctaHeading: row.cta_heading.trim() || "Start a conversation",
    ctaLede:
      row.cta_lede.trim() ||
      "Email and LinkedIn are the public contact channels.",
  };
}

export function selectVisibleContactChannels(args: {
  page: PublicContactPage;
  email: string | null;
  linkedinUrl: string | null;
  linkedinDisplay?: string | null;
}): ResumeContactChannels {
  const email = args.email?.trim() ?? "";
  const linkedinUrl = args.linkedinUrl?.trim() ?? "";

  return {
    email:
      args.page.emailEnabled && email.includes("@")
        ? {
            label: args.page.emailLabel,
            href: `mailto:${email}`,
            text: email,
            external: false,
          }
        : null,
    linkedin:
      args.page.linkedinEnabled && /^https:\/\//i.test(linkedinUrl)
        ? {
            label: args.page.linkedinLabel,
            href: linkedinUrl,
            text: args.linkedinDisplay?.trim() || args.page.linkedinLabel,
            external: true,
          }
        : null,
  };
}

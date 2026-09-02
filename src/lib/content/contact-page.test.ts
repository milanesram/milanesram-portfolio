import { describe, expect, it } from "vitest";
import { mapContactPage, selectVisibleContactChannels } from "./contact-page";

const PAGE = {
  kicker: "Contact",
  headline: "Start a conversation",
  lede: "Email and LinkedIn are the public channels.",
  emailEnabled: true,
  linkedinEnabled: true,
  emailLabel: "Email",
  linkedinLabel: "LinkedIn",
  formIntro: "A web form is not published on this site.",
};

describe("contact channel visibility", () => {
  it("omits email when disabled without dropping the profile value", () => {
    const channels = selectVisibleContactChannels({
      page: { ...PAGE, emailEnabled: false },
      email: "milanesram@gmail.com",
      linkedinUrl: "https://www.linkedin.com/in/example",
      linkedinDisplay: "linkedin.com/in/example",
    });

    expect(channels.email).toBeNull();
    expect(channels.linkedin?.href).toBe("https://www.linkedin.com/in/example");
  });

  it("does not render a broken mailto when email is missing", () => {
    const channels = selectVisibleContactChannels({
      page: PAGE,
      email: "",
      linkedinUrl: "https://www.linkedin.com/in/example",
    });

    expect(channels.email).toBeNull();
    expect(channels.linkedin).not.toBeNull();
  });

  it("maps only published contact pages", () => {
    expect(
      mapContactPage({
        status: "draft",
        kicker: "Contact",
        headline: "Start a conversation",
        lede: "Lede",
        email_enabled: true,
        linkedin_enabled: true,
        email_label: "Email",
        linkedin_label: "LinkedIn",
        form_intro: "Intro",
      }),
    ).toBeNull();
  });
});

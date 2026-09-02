import { describe, expect, it } from "vitest";
import { parseContactPageFormData } from "./validation";

function form(entries: Array<[string, string]>) {
  const data = new FormData();
  for (const [name, value] of entries) {
    data.append(name, value);
  }
  return data;
}

describe("contact page validation", () => {
  it("treats missing checkboxes as disabled channels", () => {
    const parsed = parseContactPageFormData(
      form([
        ["kicker", "Contact"],
        ["headline", "Start a conversation"],
        ["lede", "Email and LinkedIn."],
        ["email_label", "Email"],
        ["linkedin_label", "LinkedIn"],
        ["form_intro", "A web form is not published on this site."],
        ["intent", "publish"],
      ]),
    );

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.emailEnabled).toBe(false);
      expect(parsed.value.linkedinEnabled).toBe(false);
    }
  });
});

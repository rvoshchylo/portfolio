import { describe, expect, it } from "vitest";
import { buildMailto, validateContact } from "./contactForm";

describe("contact form", () => {
  it("validates required fields, email shape and message length", () => {
    expect(validateContact({ name: "", email: "", msg: "" })).toEqual({
      name: "name is required",
      email: "email is required",
      msg: "a few more words, please (10+ chars)",
    });
    expect(validateContact({ name: "A", email: "nope@", msg: "long enough text" }).email).toBe("that email looks off");
    expect(validateContact({ name: "A", email: "a@b.co", msg: "long enough text" })).toEqual({});
  });

  it("builds an encoded mailto draft to the CV address", () => {
    const url = buildMailto({ name: "Jane", email: "jane@x.com", msg: "Hello & welcome?" });
    expect(url.startsWith("mailto:ruslan.voshchylo2@gmail.com?subject=")).toBe(true);
    expect(decodeURIComponent(url.split("subject=")[1].split("&")[0])).toBe("Portfolio inquiry from Jane");
    expect(decodeURIComponent(url.split("body=")[1])).toContain("Hello & welcome?\n\n— Jane <jane@x.com>");
  });
});

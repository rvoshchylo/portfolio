import { describe, expect, it } from "vitest";
import { complete, runCommand } from "./commands";

const text = (r: ReturnType<typeof runCommand>) => r.lines.map((l) => l.text).join("\n");

describe("terminal commands", () => {
  it("whoami prints name and role from the CV", () => {
    expect(text(runCommand("whoami"))).toContain("Ruslan Voshchylo — Full-Stack Developer");
  });

  it("help lists the core commands", () => {
    const out = text(runCommand("help"));
    for (const c of ["whoami", "projects", "skills", "contact", "open <app>", "resume"]) expect(out).toContain(c);
  });

  it("open returns an open action for known apps (with or without .exe)", () => {
    expect(runCommand("open projects").action).toEqual({ type: "open", app: "projects" });
    expect(runCommand("OPEN skills.exe").action).toEqual({ type: "open", app: "skills" });
    expect(runCommand("open nope").action).toBeUndefined();
  });

  it("cat project files show highlights", () => {
    const out = text(runCommand("cat projects/aksel"));
    expect(out).toContain("Safepay v2");
    expect(text(runCommand("cat projects/missing"))).toContain("No such file");
  });

  it("contact lines link to the real profiles", () => {
    const r = runCommand("contact");
    expect(r.lines.some((l) => l.href === "https://github.com/rvoshchylo")).toBe(true);
    expect(r.lines.some((l) => l.href === "mailto:ruslan.voshchylo2@gmail.com")).toBe(true);
  });

  it("resume opens the PDF", () => {
    const a = runCommand("resume").action;
    expect(a?.type).toBe("url");
    expect(a && "href" in a && a.href).toMatch(/Ruslan_Voshchylo_CV\.pdf$/);
  });

  it("clear and exit return actions; unknown commands error", () => {
    expect(runCommand("clear").action).toEqual({ type: "clear" });
    expect(runCommand("exit").action).toEqual({ type: "exit" });
    expect(runCommand("rm -rf /").lines[0].tone).toBe("error");
    expect(runCommand("   ").lines).toEqual([]);
  });

  it("history echoes previous commands", () => {
    expect(text(runCommand("history", ["ls", "whoami"]))).toMatch(/1 {2}ls\n\s+2 {2}whoami/);
  });

  it("tab completion completes commands and arguments", () => {
    expect(complete("who")).toBe("whoami ");
    expect(complete("open pro")).toBe("open projects");
    expect(complete("cat projects/gog")).toBe("cat projects/gogeta");
    expect(complete("e")).toBe("e"); // ambiguous: echo, email, exit, experience
    expect(complete("ex")).toBe("ex"); // exit / experience
  });
});

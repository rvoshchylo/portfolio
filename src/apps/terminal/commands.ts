import { EMAIL, contacts, education, jobs, profile, projects, resumeUrl, skills } from "../../data/profile";

export type Tone = "default" | "muted" | "accent" | "ok" | "error" | "warn";
export type Line = { text: string; tone?: Tone; color?: string; href?: string };

export type TermAction =
  | { type: "open"; app: string }
  | { type: "url"; href: string }
  | { type: "clear" }
  | { type: "exit" };

export type Result = { lines: Line[]; action?: TermAction };

export const OPENABLE = ["about", "experience", "projects", "skills", "contact", "terminal"] as const;

const FILES = ["about.txt", "experience.log", "projects/", "skills.json", "contact.vcf", "resume.pdf"];

const HELP: [string, string][] = [
  ["help", "show this list"],
  ["whoami", "who's behind this machine"],
  ["about", "short bio"],
  ["experience", "where I've worked + education"],
  ["projects", "what I've shipped"],
  ["skills", "the toolbox"],
  ["contact", "how to reach me"],
  ["open <app>", `open a window: ${OPENABLE.join(", ")}`],
  ["ls / cat <file>", "browse the home folder"],
  ["resume", "open the PDF résumé"],
  ["email | github | linkedin | telegram", "jump to a profile"],
  ["clear", "clear the screen (or ctrl+l)"],
];

export const COMMANDS = [
  "help", "whoami", "about", "experience", "projects", "skills", "contact", "open", "ls", "cat",
  "resume", "cv", "email", "github", "linkedin", "telegram", "clear", "date", "echo", "history",
  "hire-me", "sudo", "exit", "pwd",
];

const t = (text: string, tone?: Tone): Line => ({ text, tone });
const blank = (): Line => t("");

function projectLines(id: string): Line[] | null {
  const p = projects.find((x) => x.id === id || x.name === id);
  if (!p) return null;
  return [
    { text: `${p.name}  ·  ${p.company} · ${p.year}`, color: p.accent },
    t(p.context, "muted"),
    ...p.highlights.map((h) => t(`  • ${h}`)),
    t(`  stack: ${p.stack.join(", ")}`, "muted"),
  ];
}

function bio(): Line[] {
  return [t(profile.bio.comment, "muted"), t(profile.bio.plain)];
}

function experience(): Line[] {
  const out: Line[] = [];
  for (const j of jobs) {
    out.push({ text: `${j.period.padEnd(20)} ${j.company} — ${j.role} (${j.place})`, color: j.accent });
    out.push(t(`${"".padEnd(20)} ${j.note}`, "muted"));
    out.push(t(`${"".padEnd(20)} projects: ${j.projects.join(", ")}`, "muted"));
  }
  out.push(blank(), t("education", "accent"));
  for (const e of education) out.push(t(`${e.period.padEnd(20)} ${e.degree} — ${e.school}`));
  return out;
}

function skillLines(): Line[] {
  const out: Line[] = [t("{", "muted")];
  skills.forEach((c, i) => {
    out.push({
      text: `  "${c.name.toLowerCase()}": [${c.skills.map((s) => `"${s}"`).join(", ")}]${i < skills.length - 1 ? "," : ""}`,
      color: c.accent,
    });
  });
  out.push(t("}", "muted"));
  return out;
}

function contactLines(): Line[] {
  return contacts.map((c) => ({ text: `${c.label.padEnd(10)} ${c.handle}`, href: c.href, color: c.accent }));
}

export function runCommand(raw: string, history: string[] = []): Result {
  const input = raw.trim();
  if (!input) return { lines: [] };
  const [cmdRaw, ...args] = input.split(/\s+/);
  const cmd = cmdRaw.toLowerCase();
  const arg = args.join(" ");

  switch (cmd) {
    case "help":
    case "?":
      return {
        lines: [
          t("available commands:", "accent"),
          ...HELP.map(([c, d]) => t(`  ${c.padEnd(38)} ${d}`)),
          blank(),
          t("tip: ↑/↓ for history, tab to autocomplete.", "muted"),
        ],
      };
    case "whoami":
      return {
        lines: [
          { text: `${profile.name} — ${profile.role}`, color: "#cdb9ff" },
          t(`${profile.location}${profile.remote ? " · open to remote" : ""}`, "muted"),
        ],
      };
    case "pwd":
      return { lines: [t(`/home/${profile.handle}`)] };
    case "about":
    case "bio":
      return { lines: bio() };
    case "experience":
    case "work":
      return { lines: experience() };
    case "projects":
      return {
        lines: [
          ...projects.map((p) => ({ text: `${p.name.padEnd(12)} ${p.summary}`, color: p.accent })),
          blank(),
          t("cat projects/<name> for details · open projects for the gallery", "muted"),
        ],
      };
    case "skills":
      return { lines: skillLines() };
    case "contact":
    case "socials":
      return { lines: [...contactLines(), blank(), t("or: open contact", "muted")] };
    case "ls": {
      const target = arg.replace(/\/$/, "");
      if (target === "projects" || target === "~/projects") return { lines: [t(projects.map((p) => p.name).join("  "))] };
      if (target && target !== "~" && target !== ".") return { lines: [t(`ls: ${arg}: No such file or directory`, "error")] };
      return { lines: [t(FILES.join("  "))] };
    }
    case "cat": {
      if (!arg) return { lines: [t("usage: cat <file>", "warn")] };
      const f = arg.replace(/^~\//, "");
      if (f === "about.txt") return { lines: bio() };
      if (f === "experience.log") return { lines: experience() };
      if (f === "skills.json") return { lines: skillLines() };
      if (f === "contact.vcf") return { lines: contactLines() };
      if (f === "resume.pdf") return { lines: [t("binary file — opening in a new tab…", "muted")], action: { type: "url", href: resumeUrl() } };
      if (f.startsWith("projects/")) {
        const lines = projectLines(f.slice("projects/".length));
        if (lines) return { lines };
      }
      return { lines: [t(`cat: ${arg}: No such file or directory`, "error")] };
    }
    case "open": {
      const app = arg.toLowerCase().replace(/\.exe$/, "");
      if ((OPENABLE as readonly string[]).includes(app)) return { lines: [t(`opening ${app}.exe…`, "ok")], action: { type: "open", app } };
      if (app === "resume" || app === "resume.pdf" || app === "cv") return runCommand("resume");
      return { lines: [t(`open: unknown app '${arg}'. try: ${OPENABLE.join(", ")}`, "error")] };
    }
    case "resume":
    case "cv":
      return { lines: [t("opening résumé (PDF)…", "ok")], action: { type: "url", href: resumeUrl() } };
    case "email":
    case "github":
    case "linkedin":
    case "telegram": {
      const c = contacts.find((x) => x.id === cmd)!;
      return { lines: [{ text: `→ ${c.handle}`, href: c.href, color: c.accent }], action: { type: "url", href: c.href } };
    }
    case "hire-me":
    case "hire":
      return {
        lines: [t("great choice. opening contact.exe…", "ok"), t(`or write directly: ${EMAIL}`, "muted")],
        action: { type: "open", app: "contact" },
      };
    case "sudo":
      return { lines: [t(`${profile.handle} is not in the sudoers file. This incident will be reported.`, "error"), t("…but `hire-me` works without root.", "muted")] };
    case "date":
      return { lines: [t(new Date().toString())] };
    case "echo":
      return { lines: [t(arg)] };
    case "history":
      return { lines: history.map((h, i) => t(`${String(i + 1).padStart(4)}  ${h}`)) };
    case "clear":
      return { lines: [], action: { type: "clear" } };
    case "exit":
      return { lines: [t("logout", "muted")], action: { type: "exit" } };
    default:
      return { lines: [t(`command not found: ${cmdRaw}. type 'help' to see what's available.`, "error")] };
  }
}

/** Tab completion: completes the command, or the argument for open/cat/ls. */
export function complete(input: string): string {
  const parts = input.split(" ");
  if (parts.length === 1) {
    const hits = COMMANDS.filter((c) => c.startsWith(parts[0].toLowerCase()));
    return hits.length === 1 ? hits[0] + " " : commonPrefix(hits) || input;
  }
  const [cmd, ...rest] = parts;
  const partial = rest.join(" ");
  const pool =
    cmd === "open"
      ? [...OPENABLE]
      : cmd === "cat"
        ? [...FILES.filter((f) => !f.endsWith("/")), ...projects.map((p) => `projects/${p.name}`)]
        : cmd === "ls"
          ? ["projects/"]
          : [];
  const hits = pool.filter((p) => p.startsWith(partial));
  if (hits.length === 1) return `${cmd} ${hits[0]}`;
  const pre = commonPrefix(hits);
  return pre ? `${cmd} ${pre}` : input;
}

function commonPrefix(xs: string[]): string {
  if (!xs.length) return "";
  let p = xs[0];
  for (const x of xs) while (!x.startsWith(p)) p = p.slice(0, -1);
  return p;
}

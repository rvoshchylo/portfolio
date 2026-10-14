import { EMAIL } from "../data/profile";

export type ContactForm = { name: string; email: string; msg: string };
export type ContactErrors = Partial<Record<keyof ContactForm, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(f: ContactForm): ContactErrors {
  const e: ContactErrors = {};
  if (!f.name.trim()) e.name = "name is required";
  if (!f.email.trim()) e.email = "email is required";
  else if (!EMAIL_RE.test(f.email.trim())) e.email = "that email looks off";
  if (f.msg.trim().length < 10) e.msg = "a few more words, please (10+ chars)";
  return e;
}

/** No backend: the form opens a pre-filled draft in the visitor's mail client. */
export function buildMailto(f: ContactForm): string {
  const subject = `Portfolio inquiry from ${f.name.trim()}`;
  const body = `${f.msg.trim()}\n\n— ${f.name.trim()} <${f.email.trim()}>`;
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

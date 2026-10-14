import { useState, type FormEvent } from "react";
import { EMAIL, contacts } from "../data/profile";
import { buildMailto, validateContact, type ContactErrors, type ContactForm } from "./contactForm";
import { Cmd, Label, card, hoverTint } from "./ui";

const empty: ContactForm = { name: "", email: "", msg: "" };

export function ContactApp() {
  const [form, setForm] = useState<ContactForm>(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const update = (k: keyof ContactForm) => (v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (touched) setErrors(validateContact(next));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const errs = validateContact(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    window.location.href = buildMailto(form);
    setSent(true);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <div className="p-5 sm:p-6 text-[13px]" style={{ color: "#e8e8ee" }}>
      <Cmd>echo "let's talk" {">"} /dev/inbox</Cmd>

      {/* Link cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {contacts.map((l) => (
          <a
            key={l.id}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="rounded-[10px] p-3 flex items-center gap-3 transition"
            style={{ ...card, color: "#e8e8ee", textDecoration: "none" }}
            {...hoverTint(l.accent)}
          >
            <div
              className="rounded-[8px] grid place-items-center text-[13px] font-bold shrink-0"
              style={{ width: 36, height: 36, color: l.accent, background: l.accent + "18", border: "1px solid " + l.accent + "33" }}
            >
              {l.glyph}
            </div>
            <div className="min-w-0">
              <Label>{l.label}</Label>
              <div className="truncate text-[12px]" style={{ color: "#e8e8ee" }}>
                {l.handle}
              </div>
            </div>
            <span className="ml-auto text-[11px]" style={{ color: "#6b6b78" }}>
              ↗
            </span>
          </a>
        ))}
      </div>

      {/* Message form */}
      <div className="rounded-[10px] p-4" style={card}>
        <div className="text-[11px] mb-3 flex items-center gap-2" style={{ color: "#8b8b96" }}>
          <span>// or send a quick note</span>
          <button type="button" onClick={copyEmail} className="ml-auto text-[11px] underline-offset-2 hover:underline" style={{ color: copied ? "#34d399" : "#5e9cf5" }}>
            {copied ? "copied ✓" : "copy email"}
          </button>
        </div>
        {sent ? (
          <div className="text-center py-6 fade-in" role="status">
            <div className="text-[28px] mb-2" style={{ color: "#34d399" }}>
              ✓
            </div>
            <div className="font-semibold" style={{ color: "#e8e8ee" }}>
              draft ready in your mail app
            </div>
            <div className="text-[11px] mt-1 leading-relaxed" style={{ color: "#8b8b96" }}>
              Hit send there and I'll get back to you within ~24h.
              <br />
              Nothing opened? Write to <a className="underline" style={{ color: "#5e9cf5" }} href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </div>
            <button
              onClick={() => {
                setSent(false);
                setTouched(false);
                setErrors({});
                setForm(empty);
              }}
              className="mt-4 text-[11px] underline"
              style={{ color: "#5e9cf5" }}
            >
              send another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-2" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FormInput label="name" placeholder="name" value={form.name} onChange={update("name")} error={errors.name} />
              <FormInput label="email" placeholder="email" value={form.email} onChange={update("email")} error={errors.email} type="email" />
            </div>
            <FormInput label="message" placeholder="what's on your mind?" value={form.msg} onChange={update("msg")} error={errors.msg} multiline />
            <button
              type="submit"
              className="mt-1 self-start px-4 py-2 rounded-[8px] text-[12px] font-semibold transition-transform active:scale-[0.97]"
              style={{
                color: "white",
                background: "linear-gradient(135deg,#5e9cf5 0%,#a78bfa 100%)",
                boxShadow: "0 8px 20px rgba(94,156,245,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
            >
              send →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function FormInput({
  value,
  onChange,
  placeholder,
  label,
  error,
  type = "text",
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  error?: string;
  type?: string;
  multiline?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  const border = error ? "rgba(255,95,87,0.6)" : focus ? "rgba(94,156,245,0.5)" : "rgba(255,255,255,0.1)";
  const common = {
    value,
    placeholder,
    "aria-label": label,
    "aria-invalid": !!error,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    className: "w-full px-3 py-2 rounded-[6px] text-[12px] outline-none transition",
    style: { background: "rgba(0,0,0,0.25)", border: "1px solid " + border, color: "#e8e8ee", fontFamily: "inherit" } as React.CSSProperties,
  };
  return (
    <div>
      {multiline ? (
        <textarea {...common} rows={4} style={{ ...common.style, resize: "vertical", minHeight: 90 }} />
      ) : (
        <input {...common} type={type} />
      )}
      {error && (
        <div className="text-[10px] mt-1" style={{ color: "#ff8a80" }}>
          {error}
        </div>
      )}
    </div>
  );
}

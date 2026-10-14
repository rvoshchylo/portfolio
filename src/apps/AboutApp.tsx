import { profile, resumeUrl } from "../data/profile";
import { openExternal, useDesktop } from "../desktop/DesktopContext";
import { useNow } from "../lib/hooks";
import { Label, card } from "./ui";

const hl = (c: string) => ({ color: c });

export function AboutApp() {
  const { open } = useDesktop();
  const now = useNow(30_000);
  const localTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: profile.timezone });

  return (
    <div className="p-5 sm:p-6 text-[13px]" style={{ color: "#e8e8ee" }}>
      {/* Header */}
      <div className="flex items-center gap-5 mb-6">
        <div
          className="rounded-full grid place-items-center text-[22px] font-bold no-select shrink-0"
          style={{
            width: 84,
            height: 84,
            background: "conic-gradient(from 220deg, #5e9cf5, #a78bfa, #f472b6, #5e9cf5)",
            boxShadow: "0 0 0 2px rgba(255,255,255,0.08), 0 10px 30px rgba(94,156,245,0.25)",
          }}
        >
          <div className="rounded-full grid place-items-center" style={{ width: 76, height: 76, background: "#0d0d11" }}>
            <span
              style={{
                background: "linear-gradient(135deg,#cdb9ff,#5e9cf5)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {profile.initials}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "#f7f7fb" }}>
            {profile.name}
          </h1>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span
              className="px-2 py-0.5 rounded-full text-[11px]"
              style={{ background: "rgba(94,156,245,0.12)", color: "#9ec1f7", border: "1px solid rgba(94,156,245,0.25)" }}
            >
              {profile.role}
            </span>
            <span className="text-[11px]" style={{ color: "#8b8b96" }}>
              ◍ {profile.location} · remote · {localTime} local
            </span>
          </div>
        </div>
      </div>

      {/* about.txt */}
      <div className="rounded-[8px] overflow-hidden mb-6" style={card}>
        <div
          className="px-3 py-1.5 text-[11px] flex items-center gap-2"
          style={{ background: "rgba(255,255,255,0.04)", color: "#bcbcc6", borderBottom: "1px solid var(--line)" }}
        >
          <span style={{ color: "#fb923c" }}>$</span>
          <span>cat ~/about.txt</span>
        </div>
        <div className="p-4 leading-relaxed" style={{ color: "#d4d4dc" }}>
          <span style={{ color: "#8b8b96" }}>{profile.bio.comment}</span>
          <br />
          I build <span style={hl("#a78bfa")}>payment flows</span>, <span style={hl("#a78bfa")}>subscription billing</span>{" "}
          and integrations for production platforms with <span style={hl("#5e9cf5")}>NestJS</span>,{" "}
          <span style={hl("#5e9cf5")}>PostgreSQL</span>, <span style={hl("#34d399")}>AWS</span>,{" "}
          <span style={hl("#34d399")}>Terraform</span> and <span style={hl("#5e9cf5")}>React/TypeScript</span>. I shipped Stripe billing
          with idempotent webhooks, a <span style={hl("#fb923c")}>state-machine payment service</span> and a{" "}
          <span style={hl("#fb923c")}>PCI DSS-compliant</span> insurance module for a{" "}
          <span style={hl("#f472b6")}>DKK 280M+</span> car marketplace, and I ship{" "}
          <span style={hl("#34d399")}>OpenAI-powered</span> features too. English B2, completing an MSc in Cybersecurity.
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {profile.stats.map((s) => (
          <div key={s.k} className="rounded-[8px] p-4" style={card}>
            <Label>{s.k}</Label>
            <div className="mt-2 text-[15px] sm:text-[16px] font-semibold" style={{ color: s.c }}>
              {s.v}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => open("contact")}
          className="px-3.5 py-2 rounded-[8px] text-[12px] font-semibold"
          style={{
            color: "white",
            background: "linear-gradient(135deg,#5e9cf5 0%,#a78bfa 100%)",
            boxShadow: "0 8px 20px rgba(94,156,245,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
          }}
        >
          get in touch →
        </button>
        <button onClick={() => openExternal(resumeUrl())} className="px-3.5 py-2 rounded-[8px] text-[12px]" style={{ ...card, color: "#e8e8ee" }}>
          ↓ résumé.pdf
        </button>
        <button onClick={() => open("experience")} className="px-3.5 py-2 rounded-[8px] text-[12px]" style={{ ...card, color: "#bcbcc6" }}>
          git log →
        </button>
      </div>
    </div>
  );
}

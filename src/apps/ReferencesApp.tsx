import { useState } from "react";
import { ACCENT, profile, referenceUrl, references } from "../data/profile";
import { openExternal } from "../desktop/DesktopContext";
import { Cmd, Label, Tag, card } from "./ui";

export function ReferencesApp() {
  return (
    <div className="p-5 sm:p-6 text-[13px]" style={{ color: "#e8e8ee" }}>
      <Cmd right={`${references.length} letter${references.length === 1 ? "" : "s"} · signed PDF`}>cat ~/references/*.txt</Cmd>
      <div className="flex flex-col gap-5">
        {references.map((r) => (
          <Letter key={r.id} r={r} />
        ))}
      </div>
    </div>
  );
}

function Letter({ r }: { r: (typeof references)[number] }) {
  const [full, setFull] = useState(false);
  const initials = r.author
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <article className="rounded-[10px] overflow-hidden" style={card}>
      {/* Pull quote */}
      <div className="relative p-5 pt-7 pb-4">
        <span
          aria-hidden="true"
          className="absolute left-3 top-1 text-[72px] leading-none no-select"
          style={{ color: "rgba(167,139,250,0.22)", fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          “
        </span>
        <blockquote className="relative text-[14px] leading-relaxed" style={{ color: "#f0f0f6" }}>
          {r.quote}
        </blockquote>

        <div className="mt-4 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full grid place-items-center text-[12px] font-bold shrink-0"
            style={{ background: "linear-gradient(135deg,#fb923c,#f472b6)", color: "white" }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-semibold" style={{ color: "#e8e8ee" }}>
              {r.author}
            </div>
            <div className="text-[11px]" style={{ color: "#8b8b96" }}>
              {r.title} ·{" "}
              {r.companyHref ? (
                <a href={r.companyHref} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: ACCENT.blue }}>
                  {r.company}
                </a>
              ) : (
                r.company
              )}{" "}
              · {r.date}
            </div>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid var(--line)", background: "rgba(255,255,255,0.02)" }}>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <Label>overall assessment</Label>
          <span className="text-[16px] font-semibold" style={{ color: ACCENT.green }}>
            {r.rating}
          </span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {r.scores.map((s) => (
            <Tag key={s} accent={ACCENT.green}>
              {s}
            </Tag>
          ))}
        </div>
      </div>

      {/* Full letter */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid var(--line)" }}>
        {full && (
          <div className="mb-4 flex flex-col gap-3 leading-relaxed fade-in" style={{ color: "#cfcfd8" }}>
            <div className="text-[11px]" style={{ color: "#6b6b78" }}>
              Reference letter · {profile.name}, {profile.role}
            </div>
            {r.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div className="text-[11px]" style={{ color: "#8b8b96" }}>
              — {r.author}, {r.title}, {r.company}
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFull((v) => !v)}
            className="px-3.5 py-2 rounded-[8px] text-[12px]"
            style={{ ...card, color: "#e8e8ee" }}
            aria-expanded={full}
          >
            {full ? "hide full letter ↑" : "read full letter ↓"}
          </button>
          <button
            onClick={() => openExternal(referenceUrl(r))}
            className="px-3.5 py-2 rounded-[8px] text-[12px] font-semibold"
            style={{
              color: "white",
              background: "linear-gradient(135deg,#5e9cf5 0%,#a78bfa 100%)",
              boxShadow: "0 8px 20px rgba(94,156,245,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            signed PDF (EN + UA) ↗
          </button>
        </div>
      </div>
    </article>
  );
}

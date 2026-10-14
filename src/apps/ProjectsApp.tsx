import { useEffect, useState } from "react";
import { projects, type Project } from "../data/profile";
import { useDesktop } from "../desktop/DesktopContext";
import { Cmd, Tag, card, hoverTint } from "./ui";

export function ProjectsApp() {
  const { params } = useDesktop();
  const p = params("projects");
  const [selected, setSelected] = useState<string | null>((p?.project as string) ?? null);

  // Opening from another window (experience.exe, terminal) can deep-link a project.
  useEffect(() => {
    if (p?.project) setSelected(p.project as string);
  }, [p?.nonce, p?.project]);

  const project = projects.find((x) => x.id === selected);
  if (project) return <ProjectDetail project={project} onBack={() => setSelected(null)} />;

  return (
    <div className="p-5 sm:p-6 text-[13px]" style={{ color: "#e8e8ee" }}>
      <Cmd right={`${projects.length} entries · click for details`}>ls -la ~/projects/</Cmd>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((pr) => (
          <button
            key={pr.id}
            type="button"
            onClick={() => setSelected(pr.id)}
            className="proj-card text-left rounded-[10px] p-4 flex flex-col"
            style={card}
            {...hoverTint(pr.accent)}
          >
            <div className="flex items-baseline justify-between gap-2 w-full">
              <div className="font-semibold tracking-tight text-[15px]" style={{ color: pr.accent }}>
                {pr.name}
              </div>
              <div className="text-[11px] whitespace-nowrap" style={{ color: "#6b6b78" }}>
                {pr.company} · {pr.year}
              </div>
            </div>
            <div className="mt-2 leading-relaxed" style={{ color: "#cfcfd8" }}>
              {pr.summary}
            </div>
            <div className="mt-3 text-[11px]" style={{ color: "#9a9aa6" }}>
              {pr.metrics.map((m, i) => (
                <span key={m}>
                  {i > 0 && <span style={{ color: "#4a4a55" }}> · </span>}
                  {m}
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {pr.stack.map((t) => (
                <Tag key={t} accent={pr.accent}>
                  {t}
                </Tag>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ProjectDetail({ project: p, onBack }: { project: Project; onBack: () => void }) {
  return (
    <div className="p-5 sm:p-6 text-[13px] slide-in" style={{ color: "#e8e8ee" }}>
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="text-[11px] px-2 py-1 rounded-[6px]"
          style={{ ...card, color: "#bcbcc6" }}
          aria-label="Back to all projects"
        >
          ← cd ..
        </button>
        <span className="truncate" style={{ color: "#6b6b78" }}>
          ~/projects/<span style={{ color: p.accent }}>{p.name}</span>
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="text-[22px] font-bold tracking-tight" style={{ color: p.accent }}>
          {p.name}
        </h2>
        <div className="text-[11px]" style={{ color: "#8b8b96" }}>
          {p.company} · {p.year}
        </div>
      </div>
      <div className="mt-1 leading-relaxed" style={{ color: "#9a9aa6" }}>
        {p.context}
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
        {p.metrics.map((m) => (
          <div key={m} className="rounded-[8px] px-3 py-2.5 text-[12px] font-semibold" style={{ ...card, color: p.accent }}>
            {m}
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[8px] overflow-hidden" style={card}>
        <div
          className="px-3 py-1.5 text-[11px]"
          style={{ background: "rgba(255,255,255,0.04)", color: "#bcbcc6", borderBottom: "1px solid var(--line)" }}
        >
          <span style={{ color: "#fb923c" }}>$</span> git log --oneline --no-merges
        </div>
        <ul className="p-4 flex flex-col gap-3">
          {p.highlights.map((h, i) => (
            <li key={i} className="flex gap-3 leading-relaxed" style={{ color: "#d4d4dc" }}>
              <span className="shrink-0 text-[11px] mt-[2px]" style={{ color: p.accent }}>
                ●
              </span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {p.stack.map((t) => (
          <Tag key={t} accent={p.accent} size="md">
            {t}
          </Tag>
        ))}
      </div>
    </div>
  );
}

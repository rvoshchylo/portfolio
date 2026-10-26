import { education, jobs, projects, references } from "../data/profile";
import { useDesktop } from "../desktop/DesktopContext";
import { Cmd, Tag, card } from "./ui";

export function ExperienceApp() {
  const { open } = useDesktop();

  return (
    <div className="p-5 sm:p-6 text-[13px]" style={{ color: "#e8e8ee" }}>
      <Cmd>git log --graph --author="ruslan"</Cmd>

      <ol className="relative">
        {jobs.map((j, idx) => (
          <li key={j.company} className="relative pl-7 pb-6">
            {/* graph line + commit dot */}
            <span
              className="absolute left-[5px] top-[14px] bottom-0 w-px"
              style={{ background: idx < jobs.length - 1 ? "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))" : "transparent" }}
            />
            <span
              className="absolute left-0 top-[4px] w-[11px] h-[11px] rounded-full"
              style={{ background: "#0d0d11", border: `2px solid ${j.accent}`, boxShadow: `0 0 10px ${j.accent}88` }}
            />

            <div className="flex items-baseline gap-2 flex-wrap">
              {j.href ? (
                <a href={j.href} target="_blank" rel="noreferrer" className="font-semibold text-[15px] hover:underline" style={{ color: j.accent }}>
                  {j.company}
                </a>
              ) : (
                <span className="font-semibold text-[15px]" style={{ color: j.accent }}>
                  {j.company}
                </span>
              )}
              {j.current && (
                <span className="text-[10px] px-1.5 py-[1px] rounded" style={{ color: "#34d399", border: "1px solid rgba(52,211,153,0.35)" }}>
                  HEAD → current
                </span>
              )}
            </div>
            <div className="mt-0.5 text-[12px]" style={{ color: "#bcbcc6" }}>
              {j.role}
            </div>
            <div className="text-[11px]" style={{ color: "#6b6b78" }}>
              {j.period} · {j.place}
            </div>
            <p className="mt-2 leading-relaxed" style={{ color: "#cfcfd8" }}>
              {j.note}
            </p>
            {references
              .filter((r) => r.company === j.company)
              .map((r) => (
                <button
                  key={r.id}
                  onClick={() => open("references")}
                  className="proj-card mt-3 w-full text-left rounded-[8px] px-3 py-2.5 flex items-start gap-2.5"
                  style={{ ...card, borderColor: "rgba(245,177,61,0.3)", background: "rgba(245,177,61,0.06)" }}
                  title="Open references.exe"
                >
                  <span className="text-[14px] leading-none mt-[1px]">📜</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold" style={{ color: "#f5c96b" }}>
                      reference letter · {r.author}, {r.title.toLowerCase()} · {r.rating}
                    </span>
                    <span className="block mt-0.5 text-[11px] leading-snug truncate" style={{ color: "#9a9aa6" }}>
                      “{r.quote}”
                    </span>
                  </span>
                  <span className="text-[10px] shrink-0" style={{ color: "#6b6b78" }}>
                    open →
                  </span>
                </button>
              ))}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {j.projects.map((id) => {
                const p = projects.find((x) => x.id === id)!;
                return (
                  <button
                    key={id}
                    onClick={() => open("projects", { project: id })}
                    className="proj-card text-left rounded-[8px] px-3 py-2.5"
                    style={card}
                    title={`Open ${p.name} in projects.exe`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold" style={{ color: p.accent }}>
                        {p.name}
                      </span>
                      <span className="text-[10px]" style={{ color: "#6b6b78" }}>
                        open →
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] leading-snug" style={{ color: "#9a9aa6" }}>
                      {p.metrics.join(" · ")}
                    </div>
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-1">
        <Cmd>cat ~/education.md</Cmd>
        <div className="flex flex-col gap-2">
          {education.map((e) => (
            <div key={e.degree} className="rounded-[8px] px-4 py-3 flex items-start gap-3" style={card}>
              <span className="text-[11px] mt-[2px]" style={{ color: e.current ? "#34d399" : "#6b6b78" }}>
                {e.current ? "◉" : "○"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <span className="font-semibold" style={{ color: "#e8e8ee" }}>
                    {e.degree}
                  </span>
                  <span className="text-[11px]" style={{ color: "#6b6b78" }}>
                    {e.period}
                  </span>
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "#9a9aa6" }}>
                  {e.href ? (
                    <a href={e.href} target="_blank" rel="noreferrer" className="hover:underline">
                      {e.school}
                    </a>
                  ) : (
                    e.school
                  )}{" "}
                  · Ternopil, Ukraine
                </div>
                {e.current && (
                  <div className="mt-1.5">
                    <Tag accent="#34d399">in progress</Tag>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

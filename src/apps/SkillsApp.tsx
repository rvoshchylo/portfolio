import { skills } from "../data/profile";
import { Cmd, card } from "./ui";

export function SkillsApp() {
  const total = skills.reduce((n, c) => n + c.skills.length, 0);
  return (
    <div className="p-5 sm:p-6 text-[13px]" style={{ color: "#e8e8ee" }}>
      <Cmd right={`${total} packages`}>cat package.json | jq '.skills'</Cmd>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {skills.map((c, i) => (
          <div
            key={c.name}
            className={"rounded-[10px] p-4 " + (i === skills.length - 1 && skills.length % 2 === 1 ? "sm:col-span-2" : "")}
            style={card}
          >
            <div className="flex items-center gap-2 mb-3">
              <span style={{ width: 6, height: 6, borderRadius: 99, background: c.accent, boxShadow: "0 0 8px " + c.accent + "aa" }} />
              <div className="text-[13px] font-semibold tracking-tight" style={{ color: c.accent }}>
                {c.name.toLowerCase()}
              </div>
              <span className="text-[10px] ml-auto" style={{ color: "#6b6b78" }}>
                {c.skills.length} entries
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.skills.map((s) => (
                <span
                  key={s}
                  className="skill-pill px-2.5 py-1 rounded-full text-[11px] cursor-default"
                  style={{ color: "#cfcfd8", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = c.accent;
                    e.currentTarget.style.background = c.accent + "15";
                    e.currentTarget.style.borderColor = c.accent + "55";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#cfcfd8";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

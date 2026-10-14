import type { CSSProperties, ReactNode } from "react";

/** `$ some command` header used at the top of every app. */
export function Cmd({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 mb-5 min-w-0">
      <span className="text-[11px]" style={{ color: "#fb923c" }}>
        $
      </span>
      <span className="truncate" style={{ color: "#bcbcc6" }}>
        {children}
      </span>
      {right && (
        <span className="text-[10px] ml-auto shrink-0 hidden sm:inline" style={{ color: "#6b6b78" }}>
          {right}
        </span>
      )}
    </div>
  );
}

export const card: CSSProperties = { background: "var(--card)", border: "1px solid var(--line)" };

export function Tag({ children, accent, size = "sm" }: { children: ReactNode; accent: string; size?: "sm" | "md" }) {
  return (
    <span
      className={"rounded-full whitespace-nowrap " + (size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]")}
      style={{ color: accent, background: accent + "15", border: "1px solid " + accent + "33" }}
    >
      {children}
    </span>
  );
}

/** Hover tint shared by cards: border picks up the accent. */
export function hoverTint(accent: string) {
  return {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.borderColor = accent + "55";
      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
    },
  };
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.12em]" style={{ color: "#8b8b96" }}>
      {children}
    </div>
  );
}

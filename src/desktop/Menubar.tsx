import { useEffect, useRef, useState } from "react";
import { APPS } from "../apps/registry";
import { profile, resumeUrl } from "../data/profile";
import { useBattery, useNow } from "../lib/hooks";
import { useDesktop } from "./DesktopContext";

type Item = { label: string; hint?: string; onSelect?: () => void; checked?: boolean; divider?: boolean; disabled?: boolean };

export function Menubar({ openIds, onCloseAll }: { openIds: string[]; onCloseAll: () => void }) {
  const { open, openUrl, restart } = useDesktop();
  const [menu, setMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const now = useNow();
  const battery = useBattery();

  useEffect(() => {
    if (!menu) return;
    const off = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setMenu(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    window.addEventListener("pointerdown", off);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", off);
      window.removeEventListener("keydown", esc);
    };
  }, [menu]);

  const menus: Record<string, Item[]> = {
    logo: [
      { label: "About PortOS", onSelect: () => open("about") },
      { divider: true, label: "" },
      { label: "Download résumé…", onSelect: () => openUrl(resumeUrl()) },
      { divider: true, label: "" },
      { label: "Restart…", hint: "replays boot", onSelect: restart },
    ],
    File: [
      { label: "New Terminal", hint: "⌥T", onSelect: () => open("terminal") },
      { label: "Open résumé.pdf", onSelect: () => openUrl(resumeUrl()) },
      { divider: true, label: "" },
      { label: "Close All Windows", onSelect: onCloseAll, disabled: openIds.length === 0 },
    ],
    View: APPS.map((a) => ({ label: a.title, checked: openIds.includes(a.id), onSelect: () => open(a.id) })),
    Help: [
      { label: "Double-click icons or use the dock", disabled: true },
      { label: "Drag windows by the titlebar", disabled: true },
      { label: "Double-click titlebar to maximize", disabled: true },
      { divider: true, label: "" },
      { label: "Open Terminal → type help", onSelect: () => open("terminal") },
      { label: `Contact ${profile.firstName}…`, onSelect: () => open("contact") },
    ],
  };

  const time = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const pct = Math.round(battery.level * 100);

  const trigger = (key: string, content: React.ReactNode, extra = "") => (
    <div className="relative h-full flex items-center">
      <button
        className={"h-[22px] px-2 rounded-[5px] flex items-center " + extra}
        style={{ background: menu === key ? "rgba(255,255,255,0.12)" : "transparent" }}
        aria-haspopup="menu"
        aria-expanded={menu === key}
        onPointerDown={(e) => {
          e.preventDefault();
          setMenu((m) => (m === key ? null : key));
        }}
        onPointerEnter={() => menu && menu !== key && setMenu(key)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setMenu((m) => (m === key ? null : key))}
      >
        {content}
      </button>
      {menu === key && (
        <div
          role="menu"
          className="absolute left-0 top-[26px] min-w-[220px] py-1 rounded-[8px] frost-strong fade-in"
          style={{ boxShadow: "0 18px 50px rgba(0,0,0,0.55)", animationDuration: ".12s" }}
        >
          {menus[key].map((it, i) =>
            it.divider ? (
              <div key={i} className="my-1 h-px mx-2" style={{ background: "rgba(255,255,255,0.08)" }} />
            ) : (
              <button
                key={i}
                role="menuitem"
                disabled={it.disabled}
                className="w-full text-left px-3 py-[5px] mx-0 flex items-center gap-2 text-[12px] rounded-[4px] enabled:hover:bg-[#5e9cf5] enabled:hover:text-white disabled:cursor-default"
                style={{ color: it.disabled ? "#6b6b78" : "#e8e8ee" }}
                onClick={() => {
                  setMenu(null);
                  it.onSelect?.();
                }}
              >
                <span className="w-3 text-[10px]">{it.checked ? "✓" : ""}</span>
                <span className="flex-1">{it.label}</span>
                {it.hint && <span className="text-[10px] opacity-60">{it.hint}</span>}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={barRef}
      className="absolute top-0 left-0 right-0 z-[1000] frost-strong flex items-center px-2 text-[12px] no-select"
      style={{ height: 28, borderWidth: "0 0 1px 0" }}
    >
      <div className="flex items-center h-full">
        {trigger("logo", <span className="logo-glyph" aria-label="PortOS menu" />)}
        <span className="font-semibold px-2" style={{ color: "#f0f0f6" }}>
          {profile.firstName}.portfolio
        </span>
        {trigger("File", <span style={{ color: "#bcbcc6" }}>File</span>, "hidden sm:flex")}
        {trigger("View", <span style={{ color: "#bcbcc6" }}>View</span>, "hidden sm:flex")}
        {trigger("Help", <span style={{ color: "#bcbcc6" }}>Help</span>, "hidden sm:flex")}
      </div>
      <div className="ml-auto flex items-center gap-3 sm:gap-4" style={{ color: "#cfcfd8" }}>
        {profile.available && (
          <button onClick={() => open("contact")} className="flex items-center gap-1.5 hover:text-white" title="Open contact.exe">
            <span className="live-dot" style={{ width: 6, height: 6, borderRadius: 99, background: "#34d399" }} />
            <span className="hidden min-[420px]:inline">available for hire</span>
          </button>
        )}
        <span className="hidden sm:flex items-center gap-1" title={battery.charging ? "charging" : "battery"}>
          <span style={{ position: "relative", width: 22, height: 10, border: "1px solid rgba(255,255,255,0.45)", borderRadius: 2 }}>
            <span
              style={{
                position: "absolute",
                left: 1,
                top: 1,
                bottom: 1,
                width: `calc(${Math.max(8, pct)}% - 2px)`,
                background: pct <= 20 && !battery.charging ? "#ff5f57" : "#e8e8ee",
                borderRadius: 1,
              }}
            />
            <span style={{ position: "absolute", right: -3, top: 2, bottom: 2, width: 2, background: "rgba(255,255,255,0.45)", borderRadius: 1 }} />
          </span>
          <span className="text-[11px]">
            {battery.charging ? "⚡" : ""}
            {pct}%
          </span>
        </span>
        <span className="hidden md:inline">{date}</span>
        <span style={{ color: "#f0f0f6", fontVariantNumeric: "tabular-nums" }}>{time}</span>
      </div>
    </div>
  );
}

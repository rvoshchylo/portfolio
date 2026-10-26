import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { APPS, appById } from "../apps/registry";
import { profile, resumeUrl } from "../data/profile";
import { useCoarsePointer, useIsMobile, useViewport } from "../lib/hooks";
import { AppWindow } from "./AppWindow";
import { DesktopContext, openExternal, type AppParams, type DesktopApi } from "./DesktopContext";
import { Glyph } from "./Glyph";
import { Menubar } from "./Menubar";
import { initialWM, topWindow, wmReducer } from "./windowManager";

type Icon = { id: string; label: string; icon: string; bg: string; action: () => void };

export function Desktop({ onRestart, initialApp }: { onRestart: () => void; initialApp?: string | null }) {
  const [state, dispatch] = useReducer(wmReducer, initialWM);
  const [params, setParams] = useState<Record<string, AppParams>>({});
  const [bouncing, setBouncing] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [hintGone, setHintGone] = useState(false);
  const viewport = useViewport();
  const mobile = useIsMobile();
  const coarse = useCoarsePointer();
  const singleTap = mobile || coarse;

  const open = useCallback(
    (id: string, p?: AppParams) => {
      const meta = appById(id);
      if (!meta) return;
      setHintGone(true);
      if (p) setParams((s) => ({ ...s, [id]: { ...p, nonce: Date.now() } }));
      setBouncing((b) => ({ ...b, [id]: Date.now() }));
      window.setTimeout(
        () =>
          setBouncing((b) => {
            const c = { ...b };
            delete c[id];
            return c;
          }),
        600,
      );
      dispatch({ type: "open", id, size: meta.size, viewport: { w: window.innerWidth, h: window.innerHeight } });
    },
    [],
  );

  const api: DesktopApi = useMemo(
    () => ({
      open,
      close: (id) => dispatch({ type: "close", id }),
      openUrl: openExternal,
      params: (id) => params[id],
      restart: onRestart,
    }),
    [open, params, onRestart],
  );

  // Deep link: /#projects opens that window after boot.
  useEffect(() => {
    if (initialApp && appById(initialApp)) open(initialApp);
  }, [initialApp, open]);

  // …and links like <a href="#references"> work on the live page too.
  useEffect(() => {
    const onHash = () => {
      const id = window.location.hash.slice(1);
      if (appById(id)) open(id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [open]);

  const top = topWindow(state);
  const openIds = state.wins.filter((w) => !w.closing).map((w) => w.id);

  // Keep the URL hash in sync with the focused window so links are shareable.
  useEffect(() => {
    const hash = top ? `#${top.id}` : "";
    if (window.location.hash !== hash) history.replaceState(null, "", hash || window.location.pathname + window.location.search);
  }, [top?.id]);

  // Esc closes the focused window, ⌥T opens a terminal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.tagName === "INPUT" || t.tagName === "TEXTAREA";
      if (e.key === "Escape" && !typing && top) dispatch({ type: "close", id: top.id });
      if (e.altKey && e.code === "KeyT") {
        e.preventDefault();
        open("terminal");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [top, open]);

  const icons: Icon[] = [
    ...APPS.map((a) => ({ id: a.id, label: a.title, icon: a.icon, bg: a.iconBg, action: () => open(a.id) })),
    {
      id: "resume",
      label: "résumé.pdf",
      icon: "📄",
      bg: "linear-gradient(135deg, #f4f4f8 0%, #c9c9d6 100%)",
      action: () => openExternal(resumeUrl()),
    },
  ];

  return (
    <DesktopContext.Provider value={api}>
      <div className="absolute inset-0 overflow-hidden" onPointerDown={() => setSelected(null)} data-testid="desktop">
        <div className="wallpaper" />
        <div className="orb" style={{ width: 380, height: 380, top: -100, left: -80, background: "#5e9cf5" }} />
        <div className="orb b" style={{ width: 460, height: 460, bottom: -140, right: -120, background: "#a78bfa" }} />

        {/* Name watermark — gives the empty desktop some identity */}
        <div className="absolute left-6 bottom-28 sm:left-10 sm:bottom-32 no-select pointer-events-none hidden md:block" aria-hidden="true">
          <div className="text-[40px] lg:text-[52px] font-bold tracking-tight leading-none" style={{ color: "rgba(255,255,255,0.06)" }}>
            {profile.name}
          </div>
          <div className="mt-2 text-[13px]" style={{ color: "rgba(255,255,255,0.1)" }}>
            {profile.role} · {profile.tagline.split("·").slice(1).join("·").trim()}
          </div>
        </div>

        <Menubar openIds={openIds} onCloseAll={() => dispatch({ type: "closeAll" })} />

        {/* Desktop icons */}
        <div
          className={
            mobile
              ? "absolute left-0 right-0 top-[44px] grid grid-cols-4 gap-y-5 px-3 z-10 no-select"
              : "absolute right-5 top-11 bottom-28 w-[320px] flex flex-col flex-wrap-reverse content-start gap-y-4 gap-x-1 z-10 no-select"
          }
        >
          {icons.map((ic) => (
            <button
              key={ic.id}
              data-icon={ic.id}
              onPointerDown={(e) => {
                e.stopPropagation();
                setSelected(ic.id);
              }}
              onClick={() => singleTap && ic.action()}
              onDoubleClick={() => !singleTap && ic.action()}
              onKeyDown={(e) => e.key === "Enter" && ic.action()}
              className="flex flex-col items-center gap-1.5 rounded-[10px] py-1 justify-self-center"
              style={{ width: mobile ? 84 : 100 }}
              aria-label={`Open ${ic.label}`}
            >
              <div style={{ filter: selected === ic.id ? "brightness(0.8)" : undefined }}>
                <Glyph ch={ic.icon} bg={ic.bg} size={mobile ? 52 : 56} />
              </div>
              <div
                className="text-[10.5px] px-1 py-0.5 rounded max-w-full truncate"
                style={{
                  color: "#e8e8ee",
                  background: selected === ic.id ? "rgba(94,156,245,0.85)" : "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {ic.label}
              </div>
            </button>
          ))}
        </div>

        {/* Hint */}
        <div
          className={
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 no-select text-center pointer-events-none " +
            (hintGone ? "hint-out" : "hint") +
            (mobile ? " top-[62%]" : "")
          }
          aria-hidden={hintGone}
        >
          <div className="text-[13px]" style={{ color: "#bcbcc6" }}>
            {singleTap ? "tap an icon to open" : "double-click an icon to open"}
          </div>
          <div className="text-[10px] mt-1" style={{ color: "#6b6b78" }}>
            or pick from the dock below ↓
          </div>
        </div>

        {/* Windows */}
        {state.wins.map((w) => {
          const meta = appById(w.id)!;
          const Comp = meta.Comp;
          return (
            <AppWindow
              key={w.id}
              win={w}
              title={meta.title}
              icon={meta.icon}
              mobile={mobile}
              viewport={viewport}
              active={top?.id === w.id}
              dispatch={dispatch}
            >
              <Comp />
            </AppWindow>
          );
        })}

        {/* Dock */}
        <nav
          className="absolute left-1/2 -translate-x-1/2 z-[900]"
          style={{ bottom: mobile ? 8 : 12 }}
          aria-label="Dock"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div
            className={"frost-strong flex items-end " + (mobile ? "rounded-[18px] px-2 py-1.5 gap-2" : "rounded-[20px] px-3 py-2 gap-3")}
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)" }}
          >
            {APPS.filter((a) => !(mobile && a.id === "references")).map((a) => {
              const isOpen = openIds.includes(a.id);
              return (
                <div key={a.id} className="dock-item relative flex flex-col items-center gap-1 no-select">
                  <span className="dock-tip text-[11px] px-2 py-1 rounded-[6px] frost-strong" style={{ color: "#e8e8ee" }}>
                    {a.title}
                  </span>
                  <button
                    data-dock={a.id}
                    className={"dock-icon " + (bouncing[a.id] ? "dock-bounce" : "")}
                    onClick={() => open(a.id)}
                    aria-label={`Open ${a.title}`}
                  >
                    <Glyph ch={a.icon} bg={a.iconBg} size={mobile ? 44 : 56} />
                  </button>
                  <span style={{ width: 4, height: 4, borderRadius: 99, background: isOpen ? "#e8e8ee" : "transparent" }} />
                </div>
              );
            })}
            {!mobile && (
              <>
                <div style={{ width: 1, height: 44, background: "rgba(255,255,255,0.08)", margin: "0 4px 10px" }} />
                <div className="dock-item relative flex flex-col items-center gap-1 no-select">
                  <span className="dock-tip text-[11px] px-2 py-1 rounded-[6px] frost-strong" style={{ color: "#e8e8ee" }}>
                    résumé.pdf
                  </span>
                  <button className="dock-icon" onClick={() => openExternal(resumeUrl())} aria-label="Open résumé PDF">
                    <Glyph ch="📄" bg="linear-gradient(135deg, #f4f4f8 0%, #c9c9d6 100%)" />
                  </button>
                  <span style={{ width: 4, height: 4 }} />
                </div>
                <div className="dock-item relative flex flex-col items-center gap-1 no-select">
                  <span className="dock-tip text-[11px] px-2 py-1 rounded-[6px] frost-strong" style={{ color: "#e8e8ee" }}>
                    trash — closes all windows
                  </span>
                  <button className="dock-icon" onClick={() => dispatch({ type: "closeAll" })} aria-label="Close all windows">
                    <Glyph ch="🗑" bg="linear-gradient(135deg,#3a3a44,#222229)" />
                  </button>
                  <span style={{ width: 4, height: 4 }} />
                </div>
              </>
            )}
          </div>
        </nav>
      </div>
    </DesktopContext.Provider>
  );
}

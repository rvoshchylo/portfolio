import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { DOCK_RESERVE, MENUBAR_H, type Viewport, type WMAction, type Win } from "./windowManager";

type Props = {
  win: Win;
  title: string;
  icon: string;
  mobile: boolean;
  viewport: Viewport;
  active: boolean;
  dispatch: (a: WMAction) => void;
  children: ReactNode;
};

const MOBILE_DOCK = 84;

export function AppWindow({ win, title, icon, mobile, viewport, active, dispatch, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ dx: number; dy: number; id: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const max = mobile || win.maximized;

  // Spring in on first open and every restore from the dock.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || win.minimized) return;
    el.animate(
      [
        { opacity: 0, transform: "scale(.92)" },
        { opacity: 1, transform: "scale(1.012)", offset: 0.6 },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 320, easing: "cubic-bezier(.2,.9,.3,1.2)" },
    );
  }, [win.openSeq, win.minimized]);

  // Removal after the close animation (with a timeout fallback for hidden tabs).
  useEffect(() => {
    if (!win.closing) return;
    const t = window.setTimeout(() => dispatch({ type: "remove", id: win.id }), 220);
    return () => window.clearTimeout(t);
  }, [win.closing, win.id, dispatch]);

  const focus = () => dispatch({ type: "focus", id: win.id });

  const onTitleDown = (e: RPointerEvent<HTMLDivElement>) => {
    focus();
    if (max || e.button !== 0 || (e.target as HTMLElement).closest("button")) return;
    const rect = ref.current!.getBoundingClientRect();
    drag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.userSelect = "none";
    setDragging(true);
  };
  const onTitleMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    dispatch({ type: "move", id: win.id, pos: { x: e.clientX - d.dx, y: e.clientY - d.dy }, viewport });
  };
  const endDrag = () => {
    drag.current = null;
    document.body.style.userSelect = "";
    setDragging(false);
  };

  const minimize = () => {
    const el = ref.current;
    const target = document.querySelector<HTMLElement>(`[data-dock="${win.id}"]`);
    if (!el || !target) return dispatch({ type: "minimize", id: win.id });
    const a = el.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const anim = el.animate(
      [
        { transform: "none", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0.2 },
      ],
      { duration: 340, easing: "cubic-bezier(.5,0,.75,0)" },
    );
    let done = false;
    const fin = () => {
      if (done) return;
      done = true;
      dispatch({ type: "minimize", id: win.id });
    };
    anim.onfinish = fin;
    window.setTimeout(fin, 420);
  };

  const geom = mobile
    ? { left: 0, top: MENUBAR_H, width: viewport.w, height: viewport.h - MENUBAR_H - MOBILE_DOCK }
    : win.maximized
      ? { left: 8, top: MENUBAR_H + 8, width: viewport.w - 16, height: viewport.h - MENUBAR_H - DOCK_RESERVE - 8 }
      : { left: win.pos.x, top: win.pos.y, width: win.size.w, height: win.size.h };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={title}
      data-window={win.id}
      className={"absolute frost-strong overflow-hidden flex flex-col " + (win.closing ? "win-out " : "") + (dragging ? "" : "win-geom")}
      style={{
        ...geom,
        zIndex: win.z,
        display: win.minimized ? "none" : undefined,
        borderRadius: mobile ? 0 : 10,
        boxShadow: active
          ? "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)"
          : "0 18px 50px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05)",
      }}
      onPointerDownCapture={focus}
    >
      {/* Titlebar */}
      <div
        className="relative flex items-center px-3 no-select shrink-0 touch-none"
        style={{
          height: 32,
          background: "rgba(10,10,14,0.75)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          cursor: max ? "default" : "grab",
        }}
        onPointerDown={onTitleDown}
        onPointerMove={onTitleMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={(e) => {
          if (!mobile && !(e.target as HTMLElement).closest("button")) dispatch({ type: "toggleMax", id: win.id });
        }}
      >
        <div className="traffic flex items-center gap-2 relative z-10" style={{ opacity: active ? 1 : 0.55 }}>
          <button
            aria-label={`close ${title}`}
            className="t-close rounded-full"
            style={{ width: 12, height: 12, background: "#ff5f57", boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.25)" }}
            onClick={() => dispatch({ type: "close", id: win.id })}
          />
          <button
            aria-label={`minimize ${title}`}
            className="t-min rounded-full"
            style={{ width: 12, height: 12, background: "#febc2e", boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.25)" }}
            onClick={minimize}
          />
          <button
            aria-label={`maximize ${title}`}
            className="t-max rounded-full"
            disabled={mobile}
            style={{ width: 12, height: 12, background: "#28c840", boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.25)", opacity: mobile ? 0.4 : 1 }}
            onClick={() => dispatch({ type: "toggleMax", id: win.id })}
          />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 text-[12px] flex items-center gap-2 pointer-events-none" style={{ color: active ? "#dcdce4" : "#8b8b96" }}>
          <span className="text-[13px] leading-none" style={icon === ">_" ? { color: "#34d399", fontSize: 11, fontWeight: 700 } : undefined}>
            {icon}
          </span>
          <span className="font-semibold">{title}</span>
        </div>
      </div>
      {/* Body */}
      <div
        className="relative flex-1 min-h-0"
        style={{ background: "linear-gradient(180deg, rgba(13,13,17,0.96) 0%, rgba(10,10,14,0.96) 100%)", overflowY: "auto", overscrollBehavior: "contain" }}
      >
        {children}
      </div>
    </div>
  );
}

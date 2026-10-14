import { describe, expect, it } from "vitest";
import { MENUBAR_H, clampPos, initialWM, topWindow, wmReducer, type WMState } from "./windowManager";

const vp = { w: 1440, h: 900 };
const size = { w: 600, h: 500 };
const open = (s: WMState, id: string) => wmReducer(s, { type: "open", id, size, viewport: vp });

describe("window manager", () => {
  it("opens a window on top and centred-ish inside the viewport", () => {
    const s = open(initialWM, "about");
    expect(s.wins).toHaveLength(1);
    const [w] = s.wins;
    expect(w.z).toBe(s.zTop);
    expect(w.pos.x).toBeGreaterThan(0);
    expect(w.pos.x + w.size.w).toBeLessThan(vp.w);
    expect(w.pos.y).toBeGreaterThanOrEqual(MENUBAR_H);
  });

  it("cascades new windows and re-opening focuses instead of duplicating", () => {
    let s = open(initialWM, "about");
    s = open(s, "skills");
    expect(s.wins[1].pos.x).toBeGreaterThan(s.wins[0].pos.x);
    s = open(s, "about");
    expect(s.wins).toHaveLength(2);
    expect(topWindow(s)?.id).toBe("about");
  });

  it("focus raises z only when needed", () => {
    let s = open(open(initialWM, "a"), "b");
    const same = wmReducer(s, { type: "focus", id: "b" });
    expect(same).toBe(s);
    s = wmReducer(s, { type: "focus", id: "a" });
    expect(topWindow(s)?.id).toBe("a");
  });

  it("minimize hides from topWindow and open restores with a new animation seq", () => {
    let s = open(initialWM, "a");
    const seq = s.wins[0].openSeq;
    s = wmReducer(s, { type: "minimize", id: "a" });
    expect(topWindow(s)).toBeUndefined();
    s = open(s, "a");
    expect(s.wins[0].minimized).toBe(false);
    expect(s.wins[0].openSeq).toBe(seq + 1);
  });

  it("close marks closing, remove deletes, and a closing window can be reopened", () => {
    let s = wmReducer(open(initialWM, "a"), { type: "close", id: "a" });
    expect(s.wins[0].closing).toBe(true);
    const reopened = open(s, "a");
    expect(reopened.wins).toHaveLength(1);
    expect(reopened.wins[0].closing).toBe(false);
    s = wmReducer(s, { type: "remove", id: "a" });
    expect(s.wins).toHaveLength(0);
  });

  it("move clamps the titlebar on screen", () => {
    let s = open(initialWM, "a");
    s = wmReducer(s, { type: "move", id: "a", pos: { x: -5000, y: -40 }, viewport: vp });
    expect(s.wins[0].pos.y).toBe(MENUBAR_H);
    expect(s.wins[0].pos.x + s.wins[0].size.w).toBeGreaterThanOrEqual(96);
    expect(clampPos({ x: 99999, y: 99999 }, size, vp).x).toBeLessThanOrEqual(vp.w - 96);
  });

  it("shrinks windows to fit a small viewport", () => {
    const s = wmReducer(initialWM, { type: "open", id: "a", size: { w: 900, h: 900 }, viewport: { w: 800, h: 600 } });
    expect(s.wins[0].size.w).toBeLessThanOrEqual(776);
    expect(s.wins[0].size.h).toBeLessThan(600);
  });
});

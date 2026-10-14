export const MENUBAR_H = 28;
export const DOCK_RESERVE = 96; // space kept clear for the dock when maximized

export type Point = { x: number; y: number };
export type Size = { w: number; h: number };
export type Viewport = { w: number; h: number };

export type Win = {
  id: string;
  z: number;
  pos: Point;
  size: Size;
  minimized: boolean;
  maximized: boolean;
  closing: boolean;
  /** bumps every time the window is (re)shown so the open animation replays */
  openSeq: number;
};

export type WMState = { wins: Win[]; zTop: number };

export type WMAction =
  | { type: "open"; id: string; size: Size; viewport: Viewport }
  | { type: "focus"; id: string }
  | { type: "close"; id: string }
  | { type: "remove"; id: string }
  | { type: "minimize"; id: string }
  | { type: "toggleMax"; id: string }
  | { type: "move"; id: string; pos: Point; viewport: Viewport }
  | { type: "closeAll" };

export const initialWM: WMState = { wins: [], zTop: 10 };

/** Fit a requested size into the viewport, leaving room for menubar and dock. */
export function fitSize(size: Size, vp: Viewport): Size {
  return {
    w: Math.max(280, Math.min(size.w, vp.w - 24)),
    h: Math.max(240, Math.min(size.h, vp.h - MENUBAR_H - DOCK_RESERVE - 12)),
  };
}

/** Keep at least a grabbable strip of the titlebar on screen. */
export function clampPos(pos: Point, size: Size, vp: Viewport): Point {
  const minVisible = 96;
  return {
    x: Math.round(Math.min(Math.max(pos.x, minVisible - size.w), vp.w - minVisible)),
    y: Math.round(Math.min(Math.max(pos.y, MENUBAR_H), vp.h - 48)),
  };
}

/** Centered with a cascade so several new windows don't stack exactly on top of each other. */
export function cascadePos(index: number, size: Size, vp: Viewport): Point {
  const step = 28;
  const offset = (index % 6) * step;
  const x = (vp.w - size.w) / 2 - 2 * step + offset;
  let y = MENUBAR_H + Math.max(16, (vp.h - MENUBAR_H - DOCK_RESERVE - size.h) / 2) - step + offset;
  // prefer not to slide under the dock
  y = Math.max(MENUBAR_H + 8, Math.min(y, vp.h - DOCK_RESERVE - size.h));
  return clampPos({ x, y }, size, vp);
}

export function topWindow(state: WMState): Win | undefined {
  return state.wins
    .filter((w) => !w.minimized && !w.closing)
    .reduce<Win | undefined>((top, w) => (!top || w.z > top.z ? w : top), undefined);
}

export function wmReducer(state: WMState, action: WMAction): WMState {
  switch (action.type) {
    case "open": {
      const zTop = state.zTop + 1;
      const found = state.wins.find((w) => w.id === action.id);
      if (found && !found.closing) {
        return {
          zTop,
          wins: state.wins.map((w) =>
            w.id === action.id
              ? { ...w, z: zTop, minimized: false, openSeq: w.minimized ? w.openSeq + 1 : w.openSeq }
              : w,
          ),
        };
      }
      const size = fitSize(action.size, action.viewport);
      const visible = state.wins.filter((w) => !w.closing && w.id !== action.id).length;
      const win: Win = {
        id: action.id,
        z: zTop,
        size,
        pos: cascadePos(visible, size, action.viewport),
        minimized: false,
        maximized: false,
        closing: false,
        openSeq: (found?.openSeq ?? 0) + 1,
      };
      return { zTop, wins: [...state.wins.filter((w) => w.id !== action.id), win] };
    }
    case "focus": {
      const win = state.wins.find((w) => w.id === action.id);
      if (!win || win.z === state.zTop) return state;
      const zTop = state.zTop + 1;
      return { zTop, wins: state.wins.map((w) => (w.id === action.id ? { ...w, z: zTop } : w)) };
    }
    case "close":
      return { ...state, wins: state.wins.map((w) => (w.id === action.id ? { ...w, closing: true } : w)) };
    case "remove":
      return { ...state, wins: state.wins.filter((w) => !(w.id === action.id && w.closing)) };
    case "minimize":
      return { ...state, wins: state.wins.map((w) => (w.id === action.id ? { ...w, minimized: true } : w)) };
    case "toggleMax":
      return { ...state, wins: state.wins.map((w) => (w.id === action.id ? { ...w, maximized: !w.maximized } : w)) };
    case "move":
      return {
        ...state,
        wins: state.wins.map((w) =>
          w.id === action.id ? { ...w, pos: clampPos(action.pos, w.size, action.viewport) } : w,
        ),
      };
    case "closeAll":
      return { ...state, wins: state.wins.map((w) => ({ ...w, closing: true })) };
  }
}

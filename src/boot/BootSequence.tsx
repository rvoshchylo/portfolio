import { useCallback, useEffect, useRef, useState } from "react";
import { BrandMark } from "../components/BrandMark";
import { profile } from "../data/profile";

/*
  Boot timeline (ms from mount). Every step is skippable: click, tap or any key.

     0  darkness, closed laptop seen from above at an angle
   450  lid starts lifting (slow break-away → smooth swing → soft settle)
        while the camera orbits round to the front and pulls in
  1450  screen powers on (backlight flash), keyboard backlight + light spill
  1550  brand mark + progress bar
  3350  lock screen; password types itself
  4750  signing in… → welcome
  5750  camera dives into the screen; the real desktop is revealed underneath
  7050  boot layer unmounts
*/

type Stage = "dark" | "brand" | "login" | "auth" | "welcome" | "dive";

const LID_W = 600;
const LID_H = 390;
// Screen inset inside the lid (see .lt-front padding)
const SCREEN = { w: LID_W - 26, h: LID_H - 13 - 22, dy: (13 - 22) / 2 };
const PWD_LEN = 10;

const pose = (tilt: number, yaw: number, roll = 0) => `rotateX(${tilt}deg) rotateY(${yaw}deg) rotateZ(${roll}deg)`;
const cam = (ty: number, s: number) => `translate3d(0, ${ty}px, 0) scale(${s})`;

function viewportFit() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // laptop footprint ≈ 640 × 560 once open; keep 16px gutters on phones
  const fit = Math.min(1, (vw - 32) / 760, (vh - 96) / 580);
  const cover = Math.max(vw / SCREEN.w, vh / SCREEN.h) * 1.04;
  return { fit: Math.max(0.35, fit), cover };
}

export function BootSequence({ onDive, onDone }: { onDive: () => void; onDone: () => void }) {
  const [stage, setStage] = useState<Stage>("dark");
  const [lit, setLit] = useState(false);
  const [pwd, setPwd] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const laptopRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  const timers = useRef<number[]>([]);
  const finished = useRef(false);
  const dived = useRef(false);
  const cbs = useRef({ onDive, onDone });
  cbs.current = { onDive, onDone };

  const at = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const dive = useCallback(() => {
    if (dived.current) return;
    dived.current = true;
    cbs.current.onDive();
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    cbs.current.onDone();
  }, []);

  // Skip: reveal the desktop and fade the boot layer out quickly.
  const skip = useCallback(() => {
    if (finished.current) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    dive();
    const root = rootRef.current;
    if (!root) return finish();
    const a = root.animate([{ opacity: getComputedStyle(root).opacity }, { opacity: 0 }], {
      duration: 380,
      easing: "ease",
      fill: "forwards",
    });
    a.onfinish = finish;
    // Belt and braces: never leave the overlay up if the animation is throttled.
    window.setTimeout(finish, 600);
  }, [dive, finish]);

  useEffect(() => {
    const lid = lidRef.current!;
    const laptop = laptopRef.current!;
    const camera = camRef.current!;
    const screen = screenRef.current!;
    const glare = glareRef.current!;
    const spot = spotRef.current!;
    const root = rootRef.current!;
    const { fit, cover } = viewportFit();
    const restY = -54 * fit;
    const anims: Animation[] = [];
    const play = (el: Element, kf: Keyframe[], o: KeyframeAnimationOptions) => {
      const a = el.animate(kf, { fill: "forwards", ...o });
      anims.push(a);
      return a;
    };

    // Closed pose
    lid.style.transform = "rotateX(-90deg)";
    laptop.style.transform = pose(-56, -30, 4);
    camera.style.transform = cam(-150 * fit, fit * 0.8);
    screen.style.filter = "brightness(0)";

    play(spot, [{ opacity: 0 }, { opacity: 0.55 }], { duration: 1400, easing: "ease-out" });

    at(450, () => {
      // Lid: break-away from the magnet, smooth swing, small overshoot, settle back.
      play(
        lid,
        [
          { transform: "rotateX(-90deg)", easing: "cubic-bezier(.55,0,.75,.4)" },
          { transform: "rotateX(-82deg)", offset: 0.14, easing: "cubic-bezier(.2,.5,.3,1)" },
          { transform: "rotateX(16deg)", offset: 0.8, easing: "cubic-bezier(.4,0,.6,1)" },
          { transform: "rotateX(9deg)", offset: 0.92, easing: "ease-in-out" },
          { transform: "rotateX(11deg)" },
        ],
        { duration: 2100 },
      );
      play(glare, [{ transform: "translate3d(-38%,0,0)" }, { transform: "translate3d(32%,0,0)" }], {
        duration: 2600,
        easing: "cubic-bezier(.3,0,.2,1)",
      });
    });
    at(300, () => {
      play(laptop, [{ transform: pose(-56, -30, 4) }, { transform: pose(-15, 0, 0) }], {
        duration: 3000,
        easing: "cubic-bezier(.45,0,.15,1)",
      });
      play(camera, [{ transform: cam(-150 * fit, fit * 0.8) }, { transform: cam(restY, fit) }], {
        duration: 3000,
        easing: "cubic-bezier(.45,0,.15,1)",
      });
    });

    at(1450, () => {
      setLit(true);
      play(
        screen,
        [
          { filter: "brightness(0)" },
          { filter: "brightness(1.7) saturate(0.6)", offset: 0.25 },
          { filter: "brightness(1)" },
        ],
        { duration: 900, easing: "ease-out" },
      );
      play(spot, [{ opacity: 0.55 }, { opacity: 1 }], { duration: 1200, easing: "ease-out" });
    });
    at(1550, () => setStage("brand"));
    at(3350, () => setStage("login"));
    for (let i = 1; i <= PWD_LEN; i++) at(3750 + i * 85, () => setPwd(i));
    at(3750 + PWD_LEN * 85 + 160, () => setStage("auth"));
    at(5150, () => setStage("welcome"));

    at(5750, () => {
      setStage("dive");
      dive();
      const ease = "cubic-bezier(.7,0,.25,1)";
      play(laptop, [{ transform: pose(-15, 0, 0) }, { transform: pose(0, 0, 0) }], { duration: 1000, easing: "cubic-bezier(.5,0,.3,1)" });
      play(lid, [{ transform: "rotateX(11deg)" }, { transform: "rotateX(0deg)" }], { duration: 1000, easing: "cubic-bezier(.5,0,.3,1)" });
      play(camera, [{ transform: cam(restY, fit) }, { transform: cam(-SCREEN.dy * cover, cover) }], {
        duration: 1250,
        easing: ease,
      });
      play(root, [{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], { duration: 1250, easing: "ease-in" });
    });
    at(7050, finish);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      anims.forEach((a) => a.cancel());
    };
  }, [dive, finish]);

  // Any key / click skips.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  return (
    <div
      ref={rootRef}
      className={"boot no-select " + (lit ? "lit" : "")}
      onPointerDown={skip}
      data-testid="boot"
      data-stage={stage}
      aria-label="Boot animation. Press any key to skip."
      role="img"
    >
      <div ref={spotRef} className="boot-spot" />

      <div ref={camRef} className="boot-camera">
        <div className="boot-scene">
          <div ref={laptopRef} className="lt">
            {/* ---------- Deck (keyboard half) ---------- */}
            <div className="lt-deck">
              <div className="lt-shadow" />
              <div className="lt-hinge" />
              <div className="lt-speaker l" />
              <div className="lt-speaker r" />
              <Keyboard />
              <div className="lt-pad" />
              <div className="lt-spill" />
              <div className="lt-edge front" />
              <div className="lt-edge left" />
              <div className="lt-edge right" />
            </div>

            {/* ---------- Lid ---------- */}
            <div ref={lidRef} className="lt-lid">
              <div className="lt-face lt-back">
                <BrandMark size={54} className="lt-logo" />
              </div>
              <div className="lt-edge top" />
              <div className="lt-edge left" />
              <div className="lt-edge right" />
              <div className="lt-face lt-front">
                <div className="lt-notch" />
                <div ref={screenRef} className="lt-screen scr-scan">
                  <ScreenContent stage={stage} pwd={pwd} />
                  <div ref={glareRef} className="lt-glare" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="boot-skip absolute bottom-5 right-5 text-[11px] px-3 py-1.5 rounded-full"
        style={{ color: "#6b6b78", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
        onPointerDown={(e) => {
          e.stopPropagation();
          skip();
        }}
      >
        skip intro ↵
      </button>
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] hidden sm:block"
        style={{ color: "#4a4a55", opacity: stage === "dive" ? 0 : 1, transition: "opacity .3s" }}
      >
        press any key to skip
      </div>
    </div>
  );
}

function ScreenContent({ stage, pwd }: { stage: Stage; pwd: number }) {
  const showWall = stage !== "dark" && stage !== "brand";
  const showLogin = stage === "login" || stage === "auth" || stage === "welcome";
  const now = new Date();
  const time = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      {/* base: black → boot gray */}
      <div className="scr-layer" style={{ background: stage === "dark" ? "#000" : "#0b0b0f" }} />

      {/* wallpaper — identical to the desktop so the dive hands over seamlessly */}
      <div className="scr-layer" style={{ opacity: showWall ? 1 : 0, transition: "opacity .7s ease" }}>
        <div className="scr-wall" />
        <div
          className="scr-layer"
          style={{
            background: "rgba(6,6,10,0.35)",
            backdropFilter: "blur(2px)",
            opacity: stage === "dive" ? 0 : 1,
            transition: "opacity .5s ease",
          }}
        />
      </div>

      {stage === "brand" && (
        <div className="scr-layer flex flex-col items-center justify-center gap-6 fade-in">
          <BrandMark size={78} pulse />
          <div className="boot-progress">
            <i />
          </div>
        </div>
      )}

      {showLogin && (
        <div className="scr-layer flex flex-col items-center fade-in" style={{ paddingTop: 34 }}>
          <div className="text-[44px] font-semibold leading-none tracking-tight" style={{ color: "rgba(240,240,246,0.92)" }}>
            {time}
          </div>
          <div className="text-[10px] mt-2" style={{ color: "rgba(220,220,230,0.6)" }}>
            {date}
          </div>

          <div className="mt-auto mb-9 flex flex-col items-center gap-2.5">
            <div
              className="w-[58px] h-[58px] rounded-full grid place-items-center text-[18px] font-bold"
              style={{
                background: "linear-gradient(135deg,#5e9cf5,#a78bfa)",
                boxShadow: "0 0 0 2px rgba(255,255,255,0.18), 0 10px 24px rgba(0,0,0,0.5)",
                color: "white",
              }}
            >
              {profile.initials}
            </div>
            <div className="text-[13px] font-semibold tracking-wide" style={{ color: "#f0f0f6" }}>
              {profile.name}
            </div>
            <div className="text-[10px] -mt-1.5" style={{ color: "#a0a0ac" }}>
              {profile.role}
            </div>

            <div className="h-[26px] mt-1 flex items-center">
              {stage === "login" && (
                <div
                  className="px-3 h-[24px] rounded-full flex items-center gap-[5px]"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)", minWidth: 150 }}
                >
                  {Array.from({ length: pwd }).map((_, i) => (
                    <span key={i} className="pwd-dot" style={{ width: 5, height: 5, borderRadius: 99, background: "#e8e8ee" }} />
                  ))}
                  {pwd < PWD_LEN && <span className="caret" style={{ width: 1, height: 11, background: "#e8e8ee", marginLeft: 1 }} />}
                  {pwd === 0 && (
                    <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>
                      Enter Password
                    </span>
                  )}
                  <span className="ml-auto text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    ➜
                  </span>
                </div>
              )}
              {stage === "auth" && (
                <div className="flex items-center gap-2 text-[10px] fade-in" style={{ color: "#cfcfd8" }}>
                  <span className="spinner" /> signing in…
                </div>
              )}
              {stage === "welcome" && (
                <div className="text-[11px] fade-in" style={{ color: "#e8e8ee" }}>
                  welcome back, {profile.firstName.toLowerCase()} <span style={{ color: "#34d399" }}>✓</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const ROWS: string[][] = [
  ["", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", "", "", "", "", "w15"],
  ["w15", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["w2", "", "", "", "", "", "", "", "", "", "", "w2"],
  ["w2", "", "", "", "", "", "", "", "", "", "", "w2"],
  ["", "", "", "w15", "space", "w15", "", "", ""],
];

function Keyboard() {
  return (
    <div className="lt-keys">
      {ROWS.map((row, r) => (
        <div key={r} className="lt-row" style={r === 0 ? { flex: 0.6 } : undefined}>
          {row.map((k, i) => (
            <div key={i} className={"lt-key " + k} />
          ))}
        </div>
      ))}
    </div>
  );
}

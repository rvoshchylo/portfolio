import { useCallback, useEffect, useRef, useState } from "react";
import { camTransform, choreoFor, pickDevice, type Choreo } from "./devices";
import { LaptopRig, PhoneRig, TabletRig, type RigRefs } from "./Rigs";
import { PWD_LEN, ScreenContent, type Stage } from "./ScreenContent";

/*
  Boot timeline (ms from mount). Every step is skippable: click, tap or any key.
  The device is picked by viewport width: phone < 768 ≤ tablet < 1200 ≤ laptop.

     0  darkness, the device closed / face-down, seen from above at an angle
  ~400  the device opens (lid / folio cover / flip-over) while the camera pulls in
 ~1150  screen powers on (backlight flash) — exact moment per device
        brand mark + progress bar
  3350  lock screen; password / passcode types itself
  4750  signing in… → welcome
  5750  camera dives into the screen; the real desktop is revealed underneath
  7050  boot layer unmounts
*/

const DIVE_AT = 5750;
const DONE_AT = 7050;

export function BootSequence({ onDive, onDone }: { onDive: () => void; onDone: () => void }) {
  const [choreo] = useState<Choreo>(() => choreoFor(pickDevice(window.innerWidth), window.innerWidth, window.innerHeight));
  const [stage, setStage] = useState<Stage>("dark");
  const [lit, setLit] = useState(false);
  const [pwd, setPwd] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const refs: RigRefs = {
    model: useRef<HTMLDivElement>(null),
    part: useRef<HTMLDivElement>(null),
    screen: useRef<HTMLDivElement>(null),
    glare: useRef<HTMLDivElement>(null),
    shadow: useRef<HTMLDivElement>(null),
  };
  const refsRef = useRef(refs);

  const timers = useRef<number[]>([]);
  const finished = useRef(false);
  const dived = useRef(false);
  const cbs = useRef({ onDive, onDone });
  cbs.current = { onDive, onDone };

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
    const r = refsRef.current;
    const parts = {
      model: r.model.current!,
      part: r.part.current,
      glare: r.glare.current!,
      shadow: r.shadow.current,
    };
    const camera = camRef.current!;
    const screen = r.screen.current!;
    const spot = spotRef.current!;
    const root = rootRef.current!;
    const { geometry: g } = choreo;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const fit = Math.max(0.35, choreo.fit(vw, vh));
    const cover = Math.max(vw / g.screen.w, vh / g.screen.h) * 1.04;
    const start = choreo.camStart(fit);
    const rest = choreo.camRest(fit);

    const anims: Animation[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, ms));
    };
    const play = (el: Element, kf: Keyframe[], o: KeyframeAnimationOptions) => {
      const a = el.animate(kf, { fill: "forwards", ...o });
      anims.push(a);
      return a;
    };
    const tools = { at, play };

    choreo.setup(parts, fit);
    camera.style.transform = camTransform(start);
    screen.style.filter = "brightness(0)";

    play(spot, [{ opacity: 0 }, { opacity: 0.55 }], { duration: 1400, easing: "ease-out" });
    at(300, () =>
      play(camera, [{ transform: camTransform(start) }, { transform: camTransform(rest) }], {
        duration: 3000,
        easing: "cubic-bezier(.45,0,.15,1)",
      }),
    );
    choreo.intro(parts, tools, fit);

    at(choreo.powerOnAt, () => {
      setLit(true);
      play(
        screen,
        [{ filter: "brightness(0)" }, { filter: "brightness(1.7) saturate(0.6)", offset: 0.25 }, { filter: "brightness(1)" }],
        { duration: 900, easing: "ease-out" },
      );
      play(spot, [{ opacity: 0.55 }, { opacity: 1 }], { duration: 1200, easing: "ease-out" });
    });
    at(choreo.powerOnAt + 100, () => setStage("brand"));
    at(3350, () => setStage("login"));
    for (let i = 1; i <= PWD_LEN; i++) at(3750 + i * 85, () => setPwd(i));
    at(3750 + PWD_LEN * 85 + 160, () => setStage("auth"));
    at(5150, () => setStage("welcome"));

    at(DIVE_AT, () => {
      setStage("dive");
      dive();
      choreo.dive(parts, tools);
      play(camera, [{ transform: camTransform(rest) }, { transform: camTransform({ tx: 0, ty: -g.screen.dy * cover, s: cover }) }], {
        duration: 1250,
        easing: "cubic-bezier(.7,0,.25,1)",
      });
      if (parts.shadow) play(parts.shadow, [{ opacity: 0.6 }, { opacity: 0 }], { duration: 400, easing: "ease-out" });
      play(root, [{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], { duration: 1250, easing: "ease-in" });
    });
    at(DONE_AT, finish);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      anims.forEach((a) => a.cancel());
    };
  }, [choreo, dive, finish]);

  // Any key / click skips.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  const { w, h } = choreo.geometry;
  const screen = <ScreenContent stage={stage} pwd={pwd} device={choreo.kind} />;

  return (
    <div
      ref={rootRef}
      className={"boot no-select " + (lit ? "lit" : "")}
      onPointerDown={skip}
      data-testid="boot"
      data-stage={stage}
      data-device={choreo.kind}
      aria-label="Boot animation. Press any key to skip."
      role="img"
    >
      <div ref={spotRef} className="boot-spot" />

      <div ref={camRef} className="boot-camera" style={{ width: w, height: h, margin: `${-h / 2}px 0 0 ${-w / 2}px` }}>
        <div className="boot-scene">
          {choreo.kind === "laptop" && <LaptopRig refs={refs}>{screen}</LaptopRig>}
          {choreo.kind === "tablet" && (
            <TabletRig refs={refs} portrait={h > w}>
              {screen}
            </TabletRig>
          )}
          {choreo.kind === "phone" && <PhoneRig refs={refs}>{screen}</PhoneRig>}
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
        {choreo.kind === "laptop" ? "press any key to skip" : "tap to skip"}
      </div>
    </div>
  );
}

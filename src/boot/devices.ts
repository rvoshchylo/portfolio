/*
  Device-specific 3D choreography for the boot intro.

  Every device follows the same story — closed → opens → screen wakes → lock
  screen → camera dives into the screen — but with its own "opening" move:
    laptop  lid swings open while the camera orbits round to the front
    tablet  folio cover swings open like a book, waking the screen
    phone   flips over from face-down and rises up to the camera

  Timings for the screen stages (brand, lock screen, dive) live in
  BootSequence.tsx and are shared by all devices.
*/

export type DeviceKind = "laptop" | "tablet" | "phone";

export const PHONE_MAX = 768; // < 768px  → phone
export const TABLET_MAX = 1200; // < 1200px → tablet, otherwise laptop

export function pickDevice(width: number): DeviceKind {
  if (width < PHONE_MAX) return "phone";
  if (width < TABLET_MAX) return "tablet";
  return "laptop";
}

export type Geometry = {
  /** size of the camera box (laptop: the lid; tablet/phone: the body) */
  w: number;
  h: number;
  /** visible screen inside that box; dy = screen centre offset from box centre */
  screen: { w: number; h: number; dy: number };
};

export type Parts = {
  model: HTMLElement;
  /** laptop lid / tablet cover */
  part: HTMLElement | null;
  glare: HTMLElement;
  shadow: HTMLElement | null;
};

export type Tools = {
  at: (ms: number, fn: () => void) => void;
  play: (el: Element, kf: Keyframe[], o: KeyframeAnimationOptions) => Animation;
};

export type Cam = { tx: number; ty: number; s: number };

export type Choreo = {
  kind: DeviceKind;
  geometry: Geometry;
  fit: (vw: number, vh: number) => number;
  camStart: (fit: number) => Cam;
  camRest: (fit: number) => Cam;
  setup: (p: Parts, fit: number) => void;
  intro: (p: Parts, t: Tools, fit: number) => void;
  /** when the backlight comes on (ms from mount) */
  powerOnAt: number;
  dive: (p: Parts, t: Tools) => void;
};

export const camTransform = ({ tx, ty, s }: Cam) => `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;

/* ---------------------------------------------------------------- laptop */

const lap = (tilt: number, yaw: number, roll = 0) => `rotateX(${tilt}deg) rotateY(${yaw}deg) rotateZ(${roll}deg)`;

const laptop: Choreo = {
  kind: "laptop",
  // lid 600 × 390; screen inset 13/13/13/22 (see .lt-front)
  geometry: { w: 600, h: 390, screen: { w: 574, h: 355, dy: (13 - 22) / 2 } },
  fit: (vw, vh) => Math.min(1, (vw - 32) / 760, (vh - 96) / 580),
  camStart: (f) => ({ tx: 0, ty: -150 * f, s: 0.8 * f }),
  camRest: (f) => ({ tx: 0, ty: -54 * f, s: f }),
  setup: ({ model, part }) => {
    part!.style.transform = "rotateX(-90deg)";
    model.style.transform = lap(-56, -30, 4);
  },
  intro: ({ model, part, glare }, { at, play }) => {
    at(300, () =>
      play(model, [{ transform: lap(-56, -30, 4) }, { transform: lap(-15, 0, 0) }], {
        duration: 3000,
        easing: "cubic-bezier(.45,0,.15,1)",
      }),
    );
    at(450, () => {
      // Lid: break-away from the magnet, smooth swing, small overshoot, settle back.
      play(
        part!,
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
  },
  powerOnAt: 1450,
  dive: ({ model, part }, { play }) => {
    const o = { duration: 1000, easing: "cubic-bezier(.5,0,.3,1)" };
    play(model, [{ transform: lap(-15, 0, 0) }, { transform: lap(0, 0, 0) }], o);
    play(part!, [{ transform: "rotateX(11deg)" }, { transform: "rotateX(0deg)" }], o);
  },
};

/* ------------------------------------------------------ tablet & phone */

// One transform list for every keyframe so the browser interpolates each part.
const body = (z: number, tilt: number, roll: number, yaw: number) =>
  `translateZ(${z}px) rotateX(${tilt}deg) rotateZ(${roll}deg) rotateY(${yaw}deg)`;

/** Soft contact shadow that follows the device (2D, under the model). */
function shadowFrames(h: number, lying: boolean): Keyframe[] {
  const under = `translate3d(-50%, -50%, 0) scale(1.05, ${lying ? 1.3 : 0.25})`;
  const lifted = `translate3d(-50%, ${h * 0.42}px, 0) scale(.55, .16)`;
  const standing = `translate3d(-50%, ${h * 0.5 + 18}px, 0) scale(.9, .16)`;
  return [
    { transform: under, opacity: 0.9 },
    { transform: lifted, opacity: 0.25, offset: 0.55 },
    { transform: standing, opacity: 0.6 },
  ];
}

function tabletChoreo(portrait: boolean): Choreo {
  const w = portrait ? 430 : 600;
  const h = portrait ? 600 : 430;
  const bezel = 16;
  const rest = body(0, 0, 0, -12);
  return {
    kind: "tablet",
    geometry: { w, h, screen: { w: w - bezel * 2, h: h - bezel * 2, dy: 0 } },
    fit: (vw, vh) => Math.min(1.3, (vw - 80) / (w * 1.35), (vh - 120) / (h * 1.3)),
    camStart: (f) => ({ tx: 0, ty: 0, s: 0.78 * f }),
    // nudge right so the cover, opened to the left, stays in frame
    camRest: (f) => ({ tx: w * 0.12 * f, ty: -10 * f, s: f }),
    setup: ({ model, part, shadow }) => {
      model.style.transform = body(0, 58, -14, 0);
      part!.style.transform = "translateZ(2px) rotateY(0deg)";
      shadow!.style.transform = shadowFrames(h, true)[0].transform as string;
    },
    intro: ({ model, part, glare, shadow }, { at, play }) => {
      at(300, () => {
        play(
          model,
          [
            { transform: body(0, 58, -14, 0) },
            { transform: body(70, 26, -6, -4), offset: 0.5 },
            { transform: rest },
          ],
          { duration: 3000, easing: "cubic-bezier(.45,0,.15,1)" },
        );
        play(shadow!, shadowFrames(h, true), { duration: 3000, easing: "cubic-bezier(.45,0,.15,1)" });
      });
      at(500, () => {
        // Folio cover: magnet break-away, wide swing like a book page, soft landing.
        play(
          part!,
          [
            { transform: "translateZ(2px) rotateY(0deg)", easing: "cubic-bezier(.55,0,.75,.4)" },
            { transform: "translateZ(2px) rotateY(-9deg)", offset: 0.15, easing: "cubic-bezier(.2,.5,.3,1)" },
            { transform: "translateZ(2px) rotateY(-182deg)", offset: 0.82, easing: "ease-in-out" },
            { transform: "translateZ(2px) rotateY(-176deg)" },
          ],
          { duration: 1900 },
        );
        play(glare, [{ transform: "translate3d(-40%,0,0)" }, { transform: "translate3d(34%,0,0)" }], {
          duration: 2600,
          easing: "cubic-bezier(.3,0,.2,1)",
        });
      });
    },
    // a smart cover wakes the screen as soon as it lifts
    powerOnAt: 1150,
    dive: ({ model, part }, { play }) => {
      play(model, [{ transform: rest }, { transform: body(0, 0, 0, 0) }], { duration: 950, easing: "cubic-bezier(.5,0,.3,1)" });
      play(part!, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, easing: "ease-out" });
    },
  };
}

const PHONE = { w: 300, h: 620, bezel: 10 };
const phoneRest = body(0, 3, 0, -9);

const phone: Choreo = {
  kind: "phone",
  geometry: { w: PHONE.w, h: PHONE.h, screen: { w: PHONE.w - PHONE.bezel * 2, h: PHONE.h - PHONE.bezel * 2, dy: 0 } },
  fit: (vw, vh) => Math.min(1, (vw - 40) / (PHONE.w * 1.25), (vh - 90) / (PHONE.h * 1.12)),
  camStart: (f) => ({ tx: 0, ty: 30 * f, s: 0.82 * f }),
  camRest: (f) => ({ tx: 0, ty: -16 * f, s: f }),
  setup: ({ model, shadow }) => {
    // lying face-down on the table: back up, tilted away, slightly spun
    model.style.transform = body(0, 60, -18, 180);
    shadow!.style.transform = shadowFrames(PHONE.h, true)[0].transform as string;
  },
  intro: ({ model, glare, shadow }, { at, play }) => {
    at(350, () => {
      // Pick-up: a little hesitation, a lift with a half-turn flip, then settle facing us.
      play(
        model,
        [
          { transform: body(0, 60, -18, 180), easing: "cubic-bezier(.5,0,.7,.4)" },
          { transform: body(30, 57, -16, 172), offset: 0.12, easing: "cubic-bezier(.25,.5,.35,1)" },
          { transform: body(170, 24, -6, 40), offset: 0.55, easing: "cubic-bezier(.3,0,.3,1)" },
          { transform: body(16, -4, 1, -14), offset: 0.85, easing: "ease-in-out" },
          { transform: phoneRest },
        ],
        { duration: 2300 },
      );
      play(shadow!, shadowFrames(PHONE.h, true), { duration: 2300, easing: "cubic-bezier(.4,0,.2,1)" });
    });
    at(1250, () =>
      play(glare, [{ transform: "translate3d(-45%,0,0)" }, { transform: "translate3d(40%,0,0)" }], {
        duration: 2000,
        easing: "cubic-bezier(.3,0,.2,1)",
      }),
    );
  },
  powerOnAt: 1550,
  dive: ({ model }, { play }) => {
    play(model, [{ transform: phoneRest }, { transform: body(0, 0, 0, 0) }], { duration: 900, easing: "cubic-bezier(.5,0,.3,1)" });
  },
};

export function choreoFor(kind: DeviceKind, vw: number, vh: number): Choreo {
  if (kind === "phone") return phone;
  if (kind === "tablet") return tabletChoreo(vh > vw);
  return laptop;
}

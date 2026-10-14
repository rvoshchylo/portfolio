import type { ReactNode, RefObject } from "react";
import { BrandMark } from "../components/BrandMark";

export type RigRefs = {
  model: RefObject<HTMLDivElement>;
  part: RefObject<HTMLDivElement>;
  screen: RefObject<HTMLDivElement>;
  glare: RefObject<HTMLDivElement>;
  shadow: RefObject<HTMLDivElement>;
};

/** Screen surface shared by all rigs: content + moving reflection. */
function Screen({ refs, className, children }: { refs: RigRefs; className: string; children: ReactNode }) {
  return (
    <div ref={refs.screen} className={className + " scr-scan"}>
      {children}
      <div ref={refs.glare} className="lt-glare" />
    </div>
  );
}

/* ================================ Laptop ================================ */

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

export function LaptopRig({ refs, children }: { refs: RigRefs; children: ReactNode }) {
  return (
    <div ref={refs.model} className="lt" data-device="laptop">
      {/* Deck (keyboard half) */}
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

      {/* Lid */}
      <div ref={refs.part} className="lt-lid">
        <div className="lt-face lt-back">
          <BrandMark size={54} className="lt-logo" />
        </div>
        <div className="lt-edge top" />
        <div className="lt-edge left" />
        <div className="lt-edge right" />
        <div className="lt-face lt-front">
          <div className="lt-notch" />
          <Screen refs={refs} className="lt-screen">
            {children}
          </Screen>
        </div>
      </div>
    </div>
  );
}

/* ================================ Tablet ================================ */

export function TabletRig({ refs, portrait, children }: { refs: RigRefs; portrait: boolean; children: ReactNode }) {
  return (
    <>
      <div ref={refs.shadow} className="dev-shadow" />
      <div ref={refs.model} className={"dv tb " + (portrait ? "portrait" : "landscape")} data-device="tablet">
        <div className="dv-face tb-back">
          <div className="tb-lens" />
          <BrandMark size={58} className="dv-logo" />
        </div>
        <div className="dv-edge t" />
        <div className="dv-edge b" />
        <div className="dv-edge l" />
        <div className="dv-edge r" />
        <div className="dv-face tb-front">
          <div className="tb-cam" />
          <Screen refs={refs} className="tb-screen">
            {children}
          </Screen>
        </div>

        {/* Folio cover, hinged on the left edge */}
        <div ref={refs.part} className="tb-cover">
          <div className="tb-cover-out">
            <BrandMark size={44} className="tb-cover-logo" />
          </div>
          <div className="tb-cover-in" />
        </div>
      </div>
    </>
  );
}

/* ================================ Phone ================================= */

export function PhoneRig({ refs, children }: { refs: RigRefs; children: ReactNode }) {
  return (
    <>
      <div ref={refs.shadow} className="dev-shadow" />
      <div ref={refs.model} className="dv ph" data-device="phone">
        <div className="dv-face ph-back">
          <div className="ph-module">
            <span className="ph-lens a" />
            <span className="ph-lens b" />
            <span className="ph-flash" />
          </div>
          <BrandMark size={50} className="dv-logo" />
        </div>
        <div className="dv-edge t" />
        <div className="dv-edge b" />
        <div className="dv-edge l" />
        <div className="dv-edge r">
          <span className="ph-btn power" />
          <span className="ph-btn vol" />
        </div>
        <div className="dv-face ph-front">
          <Screen refs={refs} className="ph-screen">
            {children}
            <div className="ph-cam" />
          </Screen>
        </div>
      </div>
    </>
  );
}

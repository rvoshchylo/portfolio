import { useCallback, useState } from "react";
import { BootSequence } from "./boot/BootSequence";
import { Desktop } from "./desktop/Desktop";

const BOOT_KEY = "portos:booted";

function shouldSkipBoot() {
  try {
    const q = new URLSearchParams(window.location.search);
    if (q.has("boot")) return false; // ?boot forces the intro
    if (q.has("skip")) return true;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return true;
    return sessionStorage.getItem(BOOT_KEY) === "1";
  } catch {
    return false;
  }
}

export default function App() {
  const [skip] = useState(shouldSkipBoot);
  const [booting, setBooting] = useState(!skip);
  const [desktop, setDesktop] = useState(skip);
  const [run, setRun] = useState(0);
  const [initialApp] = useState(() => window.location.hash.slice(1) || null);

  const onDive = useCallback(() => setDesktop(true), []);
  const onDone = useCallback(() => {
    setBooting(false);
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      /* private mode */
    }
  }, []);
  const restart = useCallback(() => {
    setDesktop(false);
    setBooting(true);
    setRun((r) => r + 1);
  }, []);

  return (
    <div className="absolute inset-0 bg-black">
      {desktop && <Desktop key={run} onRestart={restart} initialApp={run === 0 ? initialApp : null} />}
      {booting && <BootSequence key={run} onDive={onDive} onDone={onDone} />}
    </div>
  );
}

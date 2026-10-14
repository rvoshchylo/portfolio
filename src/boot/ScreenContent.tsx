import { BrandMark } from "../components/BrandMark";
import { profile } from "../data/profile";
import type { DeviceKind } from "./devices";

export type Stage = "dark" | "brand" | "login" | "auth" | "welcome" | "dive";

export const PWD_LEN = 10;
const PIN_LEN = 6;

/** What the device's screen shows: boot logo → lock screen → hand-off wallpaper. */
export function ScreenContent({ stage, pwd, device }: { stage: Stage; pwd: number; device: DeviceKind }) {
  const touch = device !== "laptop";
  const showWall = stage !== "dark" && stage !== "brand";
  const showLogin = stage === "login" || stage === "auth" || stage === "welcome";
  const now = new Date();
  const time = now.toLocaleTimeString(touch ? "en-GB" : undefined, { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  const timeSize = device === "phone" ? 64 : device === "tablet" ? 60 : 44;
  const padTop = device === "phone" ? 72 : device === "tablet" ? 44 : 34;

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
          <BrandMark size={device === "phone" ? 70 : 78} pulse />
          <div className="boot-progress">
            <i />
          </div>
        </div>
      )}

      {showLogin && (
        <div className="scr-layer flex flex-col items-center fade-in" style={{ paddingTop: padTop }}>
          <div
            className="font-semibold leading-none tracking-tight"
            style={{ fontSize: timeSize, color: "rgba(240,240,246,0.92)" }}
          >
            {time}
          </div>
          <div className="text-[10px] mt-2" style={{ color: "rgba(220,220,230,0.6)" }}>
            {date}
          </div>

          <div className="mt-auto flex flex-col items-center gap-2.5" style={{ marginBottom: device === "phone" ? 64 : 36 }}>
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

            <div className="h-[30px] mt-1 flex items-center">
              {stage === "login" && (touch ? <Passcode pwd={pwd} /> : <PasswordField pwd={pwd} />)}
              {stage === "auth" && (
                <div className="flex items-center gap-2 text-[10px] fade-in" style={{ color: "#cfcfd8" }}>
                  <span className="spinner" /> {touch ? "unlocking…" : "signing in…"}
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

      {touch && stage !== "dark" && (
        // gesture bar
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            bottom: device === "phone" ? 8 : 7,
            width: device === "phone" ? 96 : 140,
            height: 4,
            background: "rgba(255,255,255,0.75)",
            opacity: stage === "dive" ? 0 : 1,
            transition: "opacity .3s",
          }}
        />
      )}
    </>
  );
}

function PasswordField({ pwd }: { pwd: number }) {
  return (
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
  );
}

function Passcode({ pwd }: { pwd: number }) {
  const filled = Math.ceil((pwd / PWD_LEN) * PIN_LEN);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-3">
        {Array.from({ length: PIN_LEN }).map((_, i) => (
          <span
            key={i}
            className={i < filled ? "pwd-dot" : ""}
            style={{
              width: 10,
              height: 10,
              borderRadius: 99,
              border: "1.5px solid rgba(255,255,255,0.75)",
              background: i < filled ? "#f0f0f6" : "transparent",
            }}
          />
        ))}
      </div>
      <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.45)" }}>
        enter passcode
      </span>
    </div>
  );
}

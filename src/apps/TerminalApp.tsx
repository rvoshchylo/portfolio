import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { profile } from "../data/profile";
import { useDesktop } from "../desktop/DesktopContext";
import { complete, runCommand, type Line, type Tone } from "./terminal/commands";

type Entry = { id: number; prompt?: string; lines: Line[] };

const TONE: Record<Tone, string> = {
  default: "#d4d4dc",
  muted: "#6b6b78",
  accent: "#a78bfa",
  ok: "#34d399",
  error: "#ff8a80",
  warn: "#febc2e",
};

const PROMPT = `${profile.handle}@portos ~ %`;

let nextId = 1;

const welcome = (): Entry => ({
  id: nextId++,
  lines: [
    { text: `PortOS terminal — last login: ${new Date().toDateString()} on ttys001`, tone: "muted" },
    { text: "type 'help' to see what's available, or try 'whoami'.", tone: "muted" },
  ],
});

export function TerminalApp() {
  const { open, close, openUrl } = useDesktop();
  const [entries, setEntries] = useState<Entry[]>(() => [welcome()]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [entries]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const exec = (cmd: string) => {
    const res = runCommand(cmd, history);
    if (cmd.trim()) setHistory((h) => [...h, cmd.trim()]);
    setCursor(null);
    if (res.action?.type === "clear") {
      setEntries([]);
      return;
    }
    setEntries((e) => [...e, { id: nextId++, prompt: cmd, lines: res.lines }]);
    const a = res.action;
    if (!a) return;
    if (a.type === "open") window.setTimeout(() => open(a.app), 180);
    if (a.type === "url") openUrl(a.href);
    if (a.type === "exit") window.setTimeout(() => close("terminal"), 250);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      exec(input);
      setInput("");
    } else if (e.key === "Tab") {
      e.preventDefault();
      setInput((v) => complete(v));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const i = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setInput(history[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor === null) return;
      const i = cursor + 1;
      if (i >= history.length) {
        setCursor(null);
        setInput("");
      } else {
        setCursor(i);
        setInput(history[i]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    } else if (e.key === "c" && e.ctrlKey) {
      setEntries((x) => [...x, { id: nextId++, prompt: input + "^C", lines: [] }]);
      setInput("");
    }
  };

  return (
    <div
      className="min-h-full p-4 text-[12px] leading-[1.6] cursor-text"
      style={{ background: "rgba(6,6,9,0.6)", color: "#d4d4dc" }}
      onMouseUp={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true });
      }}
      data-testid="terminal"
    >
      {entries.map((en) => (
        <div key={en.id}>
          {en.prompt !== undefined && (
            <div className="break-all">
              <span style={{ color: "#34d399" }}>{PROMPT}</span> <span style={{ color: "#f0f0f6" }}>{en.prompt}</span>
            </div>
          )}
          {en.lines.map((l, i) => (
            <div key={i} className="whitespace-pre-wrap break-words" style={{ color: l.color ?? TONE[l.tone ?? "default"] }}>
              {l.href ? (
                <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="hover:underline">
                  {l.text}
                </a>
              ) : (
                l.text || " "
              )}
            </div>
          ))}
        </div>
      ))}
      <div className="flex items-center gap-2" ref={endRef}>
        <span className="shrink-0" style={{ color: "#34d399" }}>
          {PROMPT}
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 min-w-0 bg-transparent outline-none border-0 p-0"
          style={{ color: "#f0f0f6", caretColor: "#a78bfa", fontFamily: "inherit", fontSize: 12 }}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          aria-label="terminal input"
        />
      </div>
    </div>
  );
}

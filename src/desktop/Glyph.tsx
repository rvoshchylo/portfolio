export function Glyph({ ch, bg, size = 56 }: { ch: string; bg: string; size?: number }) {
  const isText = /^[\x20-\x7e]+$/.test(ch); // ">_" etc. render as mono text, not emoji
  return (
    <div
      className="grid place-items-center no-select"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        background: bg,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 0 1px rgba(255,255,255,0.06), 0 8px 22px rgba(0,0,0,0.35)",
        color: isText ? "#34d399" : "#fff",
        fontSize: isText ? size * 0.36 : size * 0.46,
        fontWeight: 700,
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      {ch}
    </div>
  );
}

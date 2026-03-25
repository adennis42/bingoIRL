import Link from "next/link";

const BINGO_LETTERS = [
  { letter: "B", bg: "#f5c542", border: "#1a1a1a", shadow: "#c49a00" },
  { letter: "I", bg: "#e84040", border: "#1a1a1a", shadow: "#9e1a1a" },
  { letter: "N", bg: "#4db8ff", border: "#1a1a1a", shadow: "#1a7acc" },
  { letter: "G", bg: "#50e878", border: "#1a1a1a", shadow: "#1a9933" },
  { letter: "O", bg: "#ff6b35", border: "#1a1a1a", shadow: "#b33d00" },
];

export default function HomePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden"
      style={{
        background: "#1a1008",
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px),
          repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)
        `,
      }}
    >
      {/* Halftone dot overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, #f5c542 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top ink splatter accent */}
      <div
        className="absolute top-0 left-0 right-0 h-6"
        style={{
          background: "#f5c542",
          clipPath: "polygon(0 0, 100% 0, 100% 60%, 95% 100%, 88% 60%, 80% 100%, 70% 50%, 60% 100%, 50% 60%, 40% 100%, 30% 50%, 20% 100%, 10% 60%, 0 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">

        {/* BINGO tiles */}
        <div className="flex items-center gap-2 mb-8">
          {BINGO_LETTERS.map(({ letter, bg, border, shadow }) => (
            <div
              key={letter}
              className="w-14 h-14 flex items-center justify-center text-2xl font-black relative"
              style={{
                background: bg,
                border: `3px solid ${border}`,
                boxShadow: `4px 4px 0px ${border}, inset -2px -2px 0px ${shadow}`,
                color: "#1a1a1a",
                fontFamily: "'Arial Black', 'Impact', sans-serif",
                WebkitTextStroke: "0px",
                letterSpacing: "-1px",
                transform: letter === "I" ? "rotate(-3deg)" : letter === "N" ? "rotate(2deg)" : letter === "G" ? "rotate(-1deg)" : "none",
              }}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Main headline */}
        <div className="mb-2 text-center relative">
          <h1
            className="text-6xl font-black leading-none uppercase tracking-tight"
            style={{
              color: "#f5c542",
              WebkitTextStroke: "3px #1a1a1a",
              paintOrder: "stroke fill",
              fontFamily: "'Arial Black', 'Impact', sans-serif",
              textShadow: "5px 5px 0px #1a1a1a",
              filter: "drop-shadow(0 0 20px rgba(245,197,66,0.4))",
            }}
          >
            BINGO
          </h1>
          <h2
            className="text-3xl font-black uppercase tracking-wide"
            style={{
              color: "#ffffff",
              WebkitTextStroke: "2px #1a1a1a",
              paintOrder: "stroke fill",
              fontFamily: "'Arial Black', 'Impact', sans-serif",
              textShadow: "3px 3px 0px #1a1a1a",
            }}
          >
            IRL
          </h2>
        </div>

        {/* Comic panel divider */}
        <div className="w-full flex items-center gap-2 my-6">
          <div className="flex-1 h-1" style={{ background: "#1a1a1a" }} />
          <div
            className="px-3 py-1 text-xs font-black uppercase"
            style={{
              background: "#e84040",
              border: "2px solid #1a1a1a",
              color: "#fff",
              fontFamily: "'Arial Black', sans-serif",
              boxShadow: "2px 2px 0px #1a1a1a",
              WebkitTextStroke: "0.5px #1a1a1a",
            }}
          >
            ★ LIVE ACTION ★
          </div>
          <div className="flex-1 h-1" style={{ background: "#1a1a1a" }} />
        </div>

        {/* Tagline */}
        <p
          className="text-center text-sm font-black uppercase mb-8 tracking-wide leading-relaxed"
          style={{
            color: "#c8c8c8",
            WebkitTextStroke: "0.5px #1a1a1a",
            fontFamily: "'Arial Black', sans-serif",
          }}
        >
          Call numbers · Track rounds<br />Manage winners in real time
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 w-full">
          <Link href="/host/dashboard" className="w-full cel-btn-yellow">
            <span className="cel-btn-inner">🎙️ HOST A GAME</span>
          </Link>

          <Link href="/play" className="w-full cel-btn-blue">
            <span className="cel-btn-inner">🎴 JOIN A GAME</span>
          </Link>
        </div>

        {/* Bottom badge */}
        <div
          className="mt-8 px-4 py-2 text-xs font-black uppercase tracking-widest"
          style={{
            border: "2px solid #f5c542",
            color: "#f5c542",
            fontFamily: "'Arial Black', sans-serif",
            boxShadow: "2px 2px 0px #f5c542",
          }}
        >
          FREE TO PLAY · NO ACCOUNT NEEDED
        </div>
      </div>

      {/* Bottom ink splatter */}
      <div
        className="absolute bottom-0 left-0 right-0 h-5"
        style={{
          background: "#e84040",
          clipPath: "polygon(0 100%, 100% 100%, 100% 40%, 93% 0%, 85% 40%, 75% 0%, 65% 50%, 55% 0%, 45% 40%, 35% 0%, 25% 50%, 15% 0%, 7% 40%, 0 0)",
        }}
      />
    </div>
  );
}

import Link from "next/link";

const BINGO_LETTERS = [
  { letter: "B", color: "var(--col-b)", shadow: "rgba(108,99,255,0.6)" },
  { letter: "I", color: "var(--col-i)", shadow: "rgba(0,212,170,0.6)" },
  { letter: "N", color: "var(--col-n)", shadow: "rgba(255,209,102,0.6)" },
  { letter: "G", color: "var(--col-g)", shadow: "rgba(255,107,107,0.6)" },
  { letter: "O", color: "var(--col-o)", shadow: "rgba(167,139,250,0.6)" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base bg-grid flex flex-col">
      {/* Ambient glow blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-col-o/10 blur-[120px]" />
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* BINGO letter row */}
        <div className="flex items-center gap-3 mb-10">
          {BINGO_LETTERS.map(({ letter, color, shadow }) => (
            <div
              key={letter}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-display font-black text-xl sm:text-2xl border border-white/10"
              style={{
                backgroundColor: `${color}18`,
                color,
                boxShadow: `0 0 20px ${shadow}, inset 0 1px 0 ${color}30`,
              }}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-7xl font-black text-center mb-4 leading-none tracking-tight">
          <span className="gradient-text">Live Bingo,</span>
          <br />
          <span className="text-text-primary">Anywhere.</span>
        </h1>

        <p className="text-text-secondary text-lg md:text-xl text-center max-w-md mb-12 leading-relaxed">
          Call numbers, track rounds, and manage winners — all in real time from any device.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link href="/host/dashboard" className="flex-1">
            <button className="w-full py-4 px-6 rounded-2xl font-display font-bold text-white text-lg bg-primary hover:bg-primary/90 transition-all duration-200 shadow-glow-primary hover:shadow-[0_0_32px_rgba(108,99,255,0.6)] hover:-translate-y-0.5 active:translate-y-0">
              🎙️ Host a Game
            </button>
          </Link>
          <Link href="/play" className="flex-1">
            <button className="w-full py-4 px-6 rounded-2xl font-display font-bold text-text-primary text-lg bg-elevated border border-bg-border hover:border-primary/50 hover:bg-elevated/80 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0">
              🎴 Join a Game
            </button>
          </Link>
        </div>

        {/* Bottom badge */}
        <p className="mt-12 text-text-disabled text-sm font-mono tracking-wider uppercase">
          Real-time · Mobile-first · Free to play
        </p>
      </div>
    </div>
  );
}

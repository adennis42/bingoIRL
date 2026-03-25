import Link from "next/link";

const BINGO_TILES = [
  { letter: "B", bg: "linear-gradient(to bottom, #ffe066 0%, #f5c542 45%, #c49200 100%)", shadow: "#8a6600" },
  { letter: "I", bg: "linear-gradient(to bottom, #ff7070 0%, #e84040 45%, #991a1a 100%)", shadow: "#660000" },
  { letter: "N", bg: "linear-gradient(to bottom, #7dd4ff 0%, #4db8ff 45%, #1a80cc 100%)", shadow: "#004d99" },
  { letter: "G", bg: "linear-gradient(to bottom, #80ffaa 0%, #50e878 45%, #1a9933 100%)", shadow: "#005c1a" },
  { letter: "O", bg: "linear-gradient(to bottom, #ff9060 0%, #ff6b35 45%, #b33400 100%)", shadow: "#7a2000" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center px-6 py-16">
      {/* BINGO tiles */}
      <div className="flex items-center gap-2 mb-8">
        {BINGO_TILES.map(({ letter, bg, shadow }) => (
          <div
            key={letter}
            className="w-14 h-14 flex items-center justify-center font-black text-2xl text-[#111]"
            style={{
              background: bg,
              border: "3px solid #111",
              boxShadow: `4px 4px 0px #111, inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -3px 0 ${shadow}`,
              fontFamily: "'Arial Black', Impact, sans-serif",
              letterSpacing: "-1px",
            }}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Headline */}
      <div className="text-center mb-3">
        <h1
          className="text-6xl font-black uppercase leading-none"
          style={{
            color: "#f5c542",
            fontFamily: "'Arial Black', Impact, sans-serif",
            WebkitTextStroke: "3px #111",
            paintOrder: "stroke fill",
            textShadow: "5px 5px 0px #111",
          }}
        >
          BINGO
        </h1>
        <h2
          className="text-3xl font-black uppercase tracking-widest"
          style={{
            color: "#fff",
            fontFamily: "'Arial Black', Impact, sans-serif",
            WebkitTextStroke: "2px #111",
            paintOrder: "stroke fill",
            textShadow: "3px 3px 0px #111",
          }}
        >
          IRL
        </h2>
      </div>

      {/* Comic divider */}
      <div className="flex items-center gap-3 w-full max-w-xs my-5">
        <div className="flex-1 h-[3px] bg-[#333]" />
        <div
          className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#111] border-[2px] border-[#111]"
          style={{
            background: "linear-gradient(to bottom, #ff7070 0%, #e84040 45%, #991a1a 100%)",
            boxShadow: "2px 2px 0px #111, inset 0 1px 0 rgba(255,255,255,0.35)",
          }}
        >
          ★ LIVE ACTION ★
        </div>
        <div className="flex-1 h-[3px] bg-[#333]" />
      </div>

      {/* Tagline */}
      <p className="text-center text-xs font-black uppercase tracking-wide text-[#888] mb-8 leading-relaxed">
        Call numbers · Track rounds<br />Manage winners in real time
      </p>

      {/* Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link href="/host/dashboard" className="cel-btn-yellow">
          <span className="cel-btn-inner">🎙️ HOST A GAME</span>
        </Link>
        <Link href="/play" className="cel-btn-blue">
          <span className="cel-btn-inner">🎴 JOIN A GAME</span>
        </Link>
      </div>

      {/* Badge */}
      <div
        className="mt-8 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#f5c542] border-[2px] border-[#f5c542]"
        style={{ boxShadow: "2px 2px 0px #f5c542" }}
      >
        FREE TO PLAY · NO ACCOUNT NEEDED
      </div>
    </div>
  );
}

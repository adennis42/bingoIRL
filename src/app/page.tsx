import Link from "next/link";
import { BingoLogo } from "@/components/bingo/BingoLogo";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ background: "#111" }}>
      <BingoLogo size={56} className="mb-8" />

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
          <span className="cel-btn-inner">HOST A GAME</span>
        </Link>
        <Link href="/play" className="cel-btn-blue">
          <span className="cel-btn-inner">JOIN A GAME</span>
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



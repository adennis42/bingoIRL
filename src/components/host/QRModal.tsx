"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRModalProps {
  gameCode: string;
  joinUrl: string;
  onClose: () => void;
}

export function QRModal({ gameCode, joinUrl, onClose }: QRModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <div
        className="border-[3px] border-[#111] p-8 flex flex-col items-center gap-6 w-full max-w-sm"
        style={{ background: "#1a1a1a", boxShadow: "8px 8px 0px #111" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center">
          <h2
            className="font-black text-2xl uppercase text-white"
            style={{ fontFamily: "'Arial Black', Impact, sans-serif", textShadow: "2px 2px 0px #111" }}
          >
            SCAN TO JOIN
          </h2>
          <p className="text-[#555] text-xs font-bold uppercase tracking-widest mt-1">Point your camera here</p>
        </div>

        {/* QR Code */}
        <div
          className="p-4 border-[3px] border-[#111]"
          style={{ background: "#fff", boxShadow: "4px 4px 0px #111" }}
        >
          <QRCodeSVG
            value={joinUrl}
            size={220}
            bgColor="#ffffff"
            fgColor="#111111"
            level="M"
          />
        </div>

        {/* Game Code */}
        <div className="text-center">
          <p className="text-[#555] text-xs font-black uppercase tracking-widest mb-1">Or enter code</p>
          <div
            className="px-6 py-3 border-[3px] border-[#111]"
            style={{
              background: "linear-gradient(to bottom, #ffe066 0%, #f5c542 45%, #c49200 100%)",
              boxShadow: "4px 4px 0px #111, inset 0 1px 0 rgba(255,255,255,0.5)",
            }}
          >
            <span
              className="font-black text-3xl tracking-[0.3em] text-[#111]"
              style={{ fontFamily: "'Arial Black', Impact, monospace" }}
            >
              {gameCode}
            </span>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-3 font-black uppercase text-sm text-white border-[3px] border-[#111] transition-all active:translate-x-[2px] active:translate-y-[2px]"
          style={{
            background: "#333",
            boxShadow: "4px 4px 0px #111",
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}

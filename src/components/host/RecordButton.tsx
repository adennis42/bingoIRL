"use client";
import { useState, useRef } from "react";
import { MicRecorder, RecordingResult } from "@/lib/recorder";

interface RecordButtonProps {
  onRecorded: (result: RecordingResult) => void;
  maxSeconds?: number; // default 15
  disabled?: boolean;
}

export function RecordButton({
  onRecorded,
  maxSeconds = 15,
  disabled,
}: RecordButtonProps) {
  const [state, setState] = useState<"idle" | "recording" | "processing">(
    "idle"
  );
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MicRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState("processing");
    try {
      const result = await recorderRef.current!.stop();
      onRecorded(result);
    } catch (err) {
      console.error("Recording error:", err);
    } finally {
      setState("idle");
      setSeconds(0);
    }
  };

  const startRecording = async () => {
    try {
      const recorder = new MicRecorder();
      recorderRef.current = recorder;
      await recorder.start();
      setState("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= maxSeconds) {
            stopRecording();
            return s + 1;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      alert("Microphone access denied. Please allow mic access and try again.");
    }
  };

  const isRecording = state === "recording";
  const isProcessing = state === "processing";

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled || isProcessing}
      className={isRecording ? "animate-pulse" : ""}
      style={{
        width: "100%",
        padding: "0.75rem",
        border: "3px solid #111",
        background:
          "linear-gradient(to bottom, #ff7070 0%, #e84040 45%, #991a1a 100%)",
        boxShadow: isRecording
          ? "1px 1px 0px #111"
          : "4px 4px 0px #111, inset 0 1px 0 rgba(255,255,255,0.3)",
        color: "#fff",
        fontFamily: "'Arial Black', Impact, sans-serif",
        fontWeight: 900,
        fontSize: "0.85rem",
        textTransform: "uppercase" as const,
        letterSpacing: "0.08em",
        cursor: disabled || isProcessing ? "not-allowed" : "pointer",
        opacity: disabled || isProcessing ? 0.6 : 1,
        transform: isRecording ? "translate(2px, 2px)" : "none",
      }}
    >
      {isProcessing
        ? "⏳ PROCESSING..."
        : isRecording
        ? `⏹ STOP (${seconds}s / ${maxSeconds}s)`
        : " RECORD"}
    </button>
  );
}

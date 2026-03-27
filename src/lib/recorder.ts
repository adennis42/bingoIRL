export interface RecordingResult {
  blob: Blob;
  mimeType: string;
  durationMs: number;
}

export class MicRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private startTime = 0;

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/mp4")
      ? "audio/mp4"
      : "audio/webm";

    this.recorder = new MediaRecorder(this.stream, { mimeType });
    this.chunks = [];
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.startTime = Date.now();
    this.recorder.start(100); // collect in 100ms chunks
  }

  stop(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.recorder) {
        reject(new Error("Not recording"));
        return;
      }
      const durationMs = Date.now() - this.startTime;
      this.recorder.onstop = () => {
        const mimeType = this.recorder!.mimeType;
        const blob = new Blob(this.chunks, { type: mimeType });
        this.stream?.getTracks().forEach((t) => t.stop());
        resolve({ blob, mimeType, durationMs });
      };
      this.recorder.stop();
    });
  }

  cancel(): void {
    this.recorder?.stop();
    this.stream?.getTracks().forEach((t) => t.stop());
  }
}

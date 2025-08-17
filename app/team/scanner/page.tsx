"use client";

import { useEffect, useRef, useState } from "react";
import {
  BrowserQRCodeReader,
  BrowserMultiFormatReader, // only for listVideoInputDevices
  IScannerControls,
} from "@zxing/browser";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);
  const [scanning, setScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [lastText, setLastText] = useState<string>("");
  const [jsonPreview, setJsonPreview] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Ask for permission once so device labels populate
  useEffect(() => {
    (async () => {
      try {
        // Request cam just to unlock labels; immediately stop it
        const temp = await navigator.mediaDevices.getUserMedia({ video: true });
        temp.getTracks().forEach((t) => t.stop());
      } catch {
        // ignore; user can still start and pick device
      }

      try {
        const all = await BrowserMultiFormatReader.listVideoInputDevices();
        setDevices(all);
        const back = all.find((d) => /back|rear|environment/i.test(d.label));
        setDeviceId(back?.deviceId || all[0]?.deviceId);
      } catch (e: any) {
        setErrorMsg(e?.message || "Failed to list video input devices.");
      }
    })();

    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function parseMaybeJson(text: string) {
    try {
      const obj = JSON.parse(text);
      setJsonPreview(JSON.stringify(obj, null, 2));
    } catch {
      setJsonPreview("");
    }
  }

  async function startScanner() {
    if (!videoRef.current) {
      setErrorMsg("Video element missing.");
      return;
    }
    setErrorMsg("");

    const reader = new BrowserQRCodeReader();
    reader.timeBetweenDecodingAttempts = 100; // smooth CPU usage
    readerRef.current = reader;

    try {
      setScanning(true);
      controlsRef.current = await reader.decodeFromVideoDevice(
        deviceId ?? undefined, // let library choose if undefined
        videoRef.current,
        (result, err) => {
          if (result) {
            const txt = result.getText();
            if (txt && txt !== lastText) {
              console.log("QR result:", txt); // <- sanity
              setLastText(txt);
              parseMaybeJson(txt);
            }
            return;
          }
          if (
            err &&
            err.name &&
            !/NotFoundException|ChecksumException|FormatException/.test(err.name)
          ) {
            setErrorMsg(err.message || String(err));
          }
        }
      );
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to start scanner.");
      setScanning(false);
    }
  }

  function stopScanner() {
    try {
      controlsRef.current?.stop();
      controlsRef.current = null;
    } catch {}
    readerRef.current = null;

    try {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch {}

    setScanning(false);
    setTorchOn(false);
  }

  async function toggleTorch() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    const videoTrack = stream?.getVideoTracks()?.[0];
    if (!videoTrack) return;

    const caps: any = videoTrack.getCapabilities?.() || {};
    if (!("torch" in caps)) {
      setErrorMsg("Torch not supported on this device.");
      return;
    }
    try {
      await videoTrack.applyConstraints({
        advanced: [{ torch: !torchOn }],
      } as MediaTrackConstraints);
      setTorchOn((v) => !v);
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to toggle torch.");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide">
            <span className="text-white">Scan a Fan — </span>
            <span className="text-[rgb(205,28,24)]">trueFanz</span>
          </h1>
          <div className="text-sm opacity-70">{scanning ? "Scanning…" : "Idle"}</div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
          <div className="flex-1">
            <label className="block text-sm mb-1 opacity-80">Camera</label>
            <select
              className="w-full bg-white/10 border border-white/10 rounded px-3 py-2"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              disabled={scanning}
            >
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${d.deviceId.slice(-4)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            {!scanning ? (
              <button
                onClick={startScanner}
                className="px-5 py-2 rounded bg-[rgb(205,28,24)] hover:bg-green-500 transition-colors"
              >
                Start
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="px-5 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
              >
                Stop
              </button>
            )}
            <button
              onClick={toggleTorch}
              disabled={!scanning}
              className="px-5 py-2 rounded bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-40"
              title="Toggle flashlight (if supported)"
            >
              {torchOn ? "Torch: On" : "Torch: Off"}
            </button>
          </div>
        </div>

        {/* Video with scanning frame */}
        <div className="relative mx-auto max-w-md">
          <video
            ref={videoRef}
            className="w-full rounded-xl border border-white/10 bg-black"
            muted
            autoPlay
            playsInline
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-56 border-2 border-green-500/70 rounded-xl"></div>
          </div>
        </div>

        {/* Result / Errors */}
        {!!lastText && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Last scan</h2>
              <button
                className="text-sm underline hover:no-underline"
                onClick={() => navigator.clipboard.writeText(lastText)}
              >
                Copy raw
              </button>
            </div>

            <div className="text-xs opacity-70 mb-2">Raw</div>
            <pre className="whitespace-pre-wrap break-words text-sm mb-4">{lastText}</pre>

            {jsonPreview ? (
              <>
                <div className="text-xs opacity-70 mb-2">Parsed JSON</div>
                <pre className="overflow-auto max-h-64 bg-black/40 rounded p-3 text-sm">
                  {jsonPreview}
                </pre>
              </>
            ) : (
              <div className="text-sm opacity-70">
                (Not valid JSON — show raw text above)
              </div>
            )}
          </div>
        )}

        {!!errorMsg && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm">
            {errorMsg}
          </div>
        )}

        <ul className="text-sm opacity-70 list-disc pl-5 space-y-1">
          <li>Use HTTPS or <code>localhost</code> for camera access.</li>
          <li>Hold the QR inside the green square; keep the phone still.</li>
          <li>If nothing scans, try switching cameras in the dropdown.</li>
        </ul>
      </main>
    </div>
  );
}
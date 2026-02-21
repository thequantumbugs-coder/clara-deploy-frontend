import { useState, useEffect, useRef, useCallback } from 'react';

const SILENCE_THRESHOLD_MS = 800;
const RMS_SILENCE_THRESHOLD = 0.008;
const SMOOTHING = 0.25;
const FFT_SIZE = 256;
const MIN_DECIBELS = -60;
const MAX_DECIBELS = -20;

export interface VoiceAnalyserResult {
  rms: number;
  frequencyIntensity: number;
  isSilent: boolean;
  smoothedRms: number;
  smoothedFrequency: number;
  error: string | null;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function useVoiceAnalyser(enabled: boolean) {
  const [result, setResult] = useState<VoiceAnalyserResult>({
    rms: 0,
    frequencyIntensity: 0,
    isSilent: true,
    smoothedRms: 0,
    smoothedFrequency: 0,
    error: null,
  });
  const rafRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const smoothedRmsRef = useRef(0);
  const smoothedFreqRef = useRef(0);
  const silenceStartRef = useRef<number | null>(null);
  const enabledAtRef = useRef<number>(0);

  const updateResult = useCallback(
    (rms: number, freq: number, isSilent: boolean) => {
      const sr = smoothedRmsRef.current;
      const sf = smoothedFreqRef.current;
      setResult({
        rms,
        frequencyIntensity: freq,
        isSilent,
        smoothedRms: sr,
        smoothedFrequency: sf,
        error: null,
      });
    },
    []
  );

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      analyserRef.current = null;
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      smoothedRmsRef.current = 0;
      smoothedFreqRef.current = 0;
      silenceStartRef.current = null;
      setResult((r) => ({ ...r, rms: 0, frequencyIntensity: 0, smoothedRms: 0, smoothedFrequency: 0, isSilent: true }));
      return;
    }

    let cancelled = false;
    const freqData = new Uint8Array(FFT_SIZE / 2);

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const ctx = new AudioContext();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        analyser.smoothingTimeConstant = 0.6;
        analyser.minDecibels = MIN_DECIBELS;
        analyser.maxDecibels = MAX_DECIBELS;
        source.connect(analyser);
        analyserRef.current = analyser;
        enabledAtRef.current = Date.now();
        const timeData = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (cancelled || !analyserRef.current) return;
          const a = analyserRef.current;
          a.getByteTimeDomainData(timeData);
          a.getByteFrequencyData(freqData);

          let sum = 0;
          for (let i = 0; i < timeData.length; i++) {
            const n = (timeData[i] - 128) / 128;
            sum += n * n;
          }
          const rms = Math.sqrt(sum / timeData.length);

          let freqSum = 0;
          for (let i = 0; i < freqData.length; i++) freqSum += freqData[i];
          const frequencyIntensity = freqData.length ? freqSum / freqData.length / 255 : 0;

          smoothedRmsRef.current = lerp(smoothedRmsRef.current, rms, SMOOTHING);
          smoothedFreqRef.current = lerp(smoothedFreqRef.current, frequencyIntensity, SMOOTHING);

          const now = Date.now();
          const gracePeriodMs = 800;
          const pastGracePeriod = now - enabledAtRef.current > gracePeriodMs;
          const isBelowThreshold = rms < RMS_SILENCE_THRESHOLD;
          if (isBelowThreshold && pastGracePeriod) {
            if (silenceStartRef.current === null) silenceStartRef.current = now;
            const silenceDuration = now - (silenceStartRef.current ?? now);
            const isSilent = silenceDuration >= SILENCE_THRESHOLD_MS;
            updateResult(rms, frequencyIntensity, isSilent);
          } else {
            silenceStartRef.current = null;
            updateResult(rms, frequencyIntensity, false);
          }

          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        if (!cancelled) {
          setResult((r) => ({
            ...r,
            error: err instanceof Error ? err.message : 'Microphone access failed',
          }));
        }
      }
    };

    init();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      analyserRef.current = null;
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [enabled, updateResult]);

  return result;
}

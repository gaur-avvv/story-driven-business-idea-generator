
import { useState, useEffect, useRef, useCallback } from 'react';
import { decode, decodeAudioData } from '../utils/audio';

// Singleton AudioContext
let audioContext: AudioContext | null = null;
const getAudioContext = (): AudioContext => {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return audioContext;
};

export const useAudioPlayer = (base64AudioData: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef(0);
  const startedAtRef = useRef(0);
  const progressIntervalRef = useRef<number | null>(null);
  const isDecodingRef = useRef(false);

  useEffect(() => {
    if (!base64AudioData || isDecodingRef.current) return;

    const decodeAndSetup = async () => {
      isDecodingRef.current = true;
      try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }
        const decodedBytes = decode(base64AudioData);
        const buffer = await decodeAudioData(decodedBytes, ctx, 24000, 1);
        audioBufferRef.current = buffer;
        setDuration(buffer.duration);
        setProgress(0);
      } catch (error) {
        console.error('Failed to decode audio data:', error);
      } finally {
        isDecodingRef.current = false;
      }
    };

    decodeAndSetup();
    
    // Cleanup on unmount or when data changes
    return () => {
        if(progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        if(sourceNodeRef.current) {
            try {
                sourceNodeRef.current.stop();
            } catch(e) {/* already stopped */}
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base64AudioData]);
  
  const stopProgressInterval = useCallback(() => {
    if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
    }
  }, []);

  const startProgressInterval = useCallback(() => {
    stopProgressInterval();
    progressIntervalRef.current = window.setInterval(() => {
        const elapsedTime = getAudioContext().currentTime - startedAtRef.current;
        const newProgress = startTimeRef.current + elapsedTime;
        if (newProgress >= duration) {
            setProgress(duration);
            setIsPlaying(false);
            startTimeRef.current = 0;
            stopProgressInterval();
        } else {
            setProgress(newProgress);
        }
    }, 100);
  }, [duration, stopProgressInterval]);

  const play = useCallback(() => {
    if (!audioBufferRef.current || isPlaying) return;
    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(ctx.destination);
    
    source.onended = () => {
        if (progress >= duration - 0.1) {
             startTimeRef.current = 0;
             setProgress(0);
        } else {
             startTimeRef.current = progress;
        }
        setIsPlaying(false);
        stopProgressInterval();
    };

    source.start(0, startTimeRef.current);
    startedAtRef.current = ctx.currentTime;
    sourceNodeRef.current = source;
    setIsPlaying(true);
    startProgressInterval();
  }, [isPlaying, duration, progress, startProgressInterval, stopProgressInterval]);

  const pause = useCallback(() => {
    if (!isPlaying || !sourceNodeRef.current) return;
    
    try {
        sourceNodeRef.current.stop(); // This will trigger the onended event
    } catch(e) {
      console.warn("Could not stop audio source, it might have already stopped.");
    }
    stopProgressInterval();
    const elapsedTime = getAudioContext().currentTime - startedAtRef.current;
    startTimeRef.current += elapsedTime;
    setIsPlaying(false);
  }, [isPlaying, stopProgressInterval]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      if (progress >= duration) {
          startTimeRef.current = 0;
          setProgress(0);
      }
      play();
    }
  }, [isPlaying, pause, play, progress, duration]);

  return { isPlaying, duration, progress, togglePlayPause };
};

import React, { useState, useEffect } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Icon } from './Icon';

interface AudioPlayerProps {
  audioData?: string | null;
  storyText?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioData, storyText }) => {
  const serverPlayer = useAudioPlayer(audioData || '');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleBrowserSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!storyText) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(storyText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Data-URI audio (ElevenLabs MP3): play with a native <audio> element.
  if (audioData && audioData.startsWith('data:audio')) {
    return (
      <div className="flex items-center gap-4 bg-background-tertiary border border-border-subtle p-4 rounded-2xl w-full mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-success text-white shrink-0">
          <Icon name="play" className="w-5 h-5" />
        </div>
        <div className="flex-grow min-w-0">
          <h4 className="text-sm font-bold text-text-primary">Studio Narration</h4>
          <p className="text-xs text-text-secondary mb-2">Voiced by ElevenLabs</p>
          <audio controls src={audioData} className="w-full h-8" preload="metadata" />
        </div>
      </div>
    );
  }

  if (audioData) {
    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage = serverPlayer.duration > 0 ? (serverPlayer.progress / serverPlayer.duration) * 100 : 0;

    return (
      <div className="flex items-center space-x-4 bg-background-tertiary border border-border-subtle p-4 rounded-2xl w-full mb-4">
        <button
          onClick={serverPlayer.togglePlayPause}
          className="p-3 bg-success text-white rounded-xl hover:bg-brand-primary-dark transition-all shadow-lg shadow-success/30 focus:outline-none"
          aria-label={serverPlayer.isPlaying ? 'Pause' : 'Play'}
        >
          <Icon name={serverPlayer.isPlaying ? 'pause' : 'play'} className="w-5 h-5" />
        </button>
        <div className="flex-grow flex items-center space-x-3">
          <span className="text-xs font-mono text-text-secondary w-10 text-center">{formatTime(serverPlayer.progress)}</span>
          <div className="w-full bg-background-tertiary rounded-full h-2 overflow-hidden">
            <div
              className="bg-success h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs font-mono text-text-secondary w-10 text-center">{formatTime(serverPlayer.duration)}</span>
        </div>
      </div>
    );
  }

  // Browser Native Speech Synthesis Fallback / Play Story
  return (
    <div className="flex items-center justify-between bg-background-tertiary border border-border-subtle p-4 rounded-2xl w-full mb-6 backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSpeaking ? 'bg-brand-primary text-white' : 'bg-brand-primary/10 text-brand-primary'}`}>
          <Icon name={isSpeaking ? 'pause' : 'play'} className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-text-primary">Instant Browser Narration</h4>
          <p className="text-xs text-text-secondary">Listen to the business story using native speech synthesis</p>
        </div>
      </div>
      <button
        onClick={handleBrowserSpeech}
        className={`px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border ${
          isSpeaking
            ? 'bg-quadrant-weakness text-white hover:opacity-90 border-quadrant-weakness'
            : 'bg-text-primary text-card hover:bg-text-primary/80 border-text-primary'
        }`}
      >
        <Icon name={isSpeaking ? 'stop' : 'play'} className="w-4 h-4" />
        {isSpeaking ? 'Stop Narration' : 'Play Story'}
      </button>
    </div>
  );
};

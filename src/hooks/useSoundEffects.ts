import { useCallback, useRef } from 'react';

type SoundType = 'success' | 'error' | 'notification' | 'click' | 'send' | 'receive' | 'warning';

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.log('Audio not supported');
    }
  }, [getAudioContext]);

  const playSuccess = useCallback(() => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Play ascending chord - C, E, G, C (major chord)
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.3, 'sine', 0.2), i * 80);
    });
  }, [getAudioContext, playTone]);

  const playError = useCallback(() => {
    // Play descending dissonant tones
    playTone(400, 0.15, 'sawtooth', 0.2);
    setTimeout(() => playTone(300, 0.15, 'sawtooth', 0.2), 100);
    setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.15), 200);
  }, [playTone]);

  const playNotification = useCallback(() => {
    // Gentle notification chime
    playTone(880, 0.1, 'sine', 0.15);
    setTimeout(() => playTone(1100, 0.15, 'sine', 0.12), 100);
  }, [playTone]);

  const playClick = useCallback(() => {
    // Subtle click sound
    playTone(1000, 0.05, 'sine', 0.1);
  }, [playTone]);

  const playSend = useCallback(() => {
    // Whoosh-like send sound
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  }, [getAudioContext]);

  const playReceive = useCallback(() => {
    // Coin drop sound
    playTone(1200, 0.1, 'sine', 0.15);
    setTimeout(() => playTone(1400, 0.1, 'sine', 0.12), 80);
    setTimeout(() => playTone(1600, 0.15, 'sine', 0.1), 160);
  }, [playTone]);

  const playWarning = useCallback(() => {
    // Alert sound
    playTone(600, 0.1, 'square', 0.15);
    setTimeout(() => playTone(600, 0.1, 'square', 0.15), 150);
  }, [playTone]);

  const play = useCallback((type: SoundType) => {
    switch (type) {
      case 'success':
        playSuccess();
        break;
      case 'error':
        playError();
        break;
      case 'notification':
        playNotification();
        break;
      case 'click':
        playClick();
        break;
      case 'send':
        playSend();
        break;
      case 'receive':
        playReceive();
        break;
      case 'warning':
        playWarning();
        break;
    }
  }, [playSuccess, playError, playNotification, playClick, playSend, playReceive, playWarning]);

  return { play, playSuccess, playError, playNotification, playClick, playSend, playReceive, playWarning };
}

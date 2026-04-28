import { useEffect, useRef } from 'react';
import { getMusicVolume } from '../utils/sound';

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/assets/music/background.mp3');
    audio.loop = true;
    audio.volume = getMusicVolume();
    audioRef.current = audio;

    if (audio.volume > 0) {
      audio.play().catch(() => {});
    }

    const updateVolume = () => {
      audio.volume = getMusicVolume();

      if (audio.volume > 0 && audio.paused) {
        audio.play().catch(() => {});
      }
    };

    window.addEventListener('arcs-volume-change', updateVolume);

    return () => {
      window.removeEventListener('arcs-volume-change', updateVolume);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  return null;
}
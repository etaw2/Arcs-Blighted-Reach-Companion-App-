import { useEffect, useRef, useState } from 'react';

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const startMusic = async () => {
      if (!audioRef.current) return;

      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }

      window.removeEventListener('click', startMusic);
    };

    window.addEventListener('click', startMusic);

    return () => {
      window.removeEventListener('click', startMusic);
    };
  }, []);

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    await audioRef.current.play();
    setIsPlaying(true);
  };

  return (
    <div className="music-control">
      <audio
        ref={audioRef}
        src="/assets/music/background.mp3"
        loop
        preload="auto"
      />

      <button onClick={toggleMusic}>
        {isPlaying ? 'Mute Music' : 'Unmute Music'}
      </button>
    </div>
  );
}
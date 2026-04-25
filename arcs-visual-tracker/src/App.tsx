import { useEffect, useRef, useState } from 'react';
import BoardOverlay from './components/BoardOverlay';
import CardsPanel from './components/CardsPanel';
import PlayerBoards from './components/PlayerBoards';
import SelectedSpacePanel from './components/SelectedSpacePanel';
import { useGameStore } from './gameStore';
import { createEmptyPlayer, type GameSetup, type PlayerColor } from './gameState';
import { BackgroundMusic } from './components/BackgroundMusic';
import { getSoundEffectsMuted, playSound, setSoundEffectsMuted } from './utils/sound';
import {
  createSaveFileName,
  deleteSaveFile,
  downloadSaveFile,
  readSaveFileFromInput,
} from './utils/saveFiles';

const allPlayerColors: PlayerColor[] = ['blue', 'red', 'yellow', 'white'];

const flagshipTokenImages: Record<PlayerColor, string> = {
  blue: '/assets/arcs dev_player piece blue flagship.png',
  red: '/assets/arcs dev_player piece red flagship.png',
  yellow: '/assets/arcs dev_player piece yellow flagship.png',
  white: '/assets/arcs dev_player piece white flagship.png',
};

const setupTokenImages = {
  pathfindersPortal: '/assets/portal.png',
  hegemonsBanner: '/assets/banner.png',
  caretakersGolems: '/assets/warrior.png',
  planetBreakersBroken: '/assets/broken.png',
  foundersSeatTokens: '/assets/seat1.png',
};

function SetupIconButton({
  label,
  selected,
  onClick,
  children,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={selected ? 'selected-chip' : ''}
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        minWidth: '4rem',
        minHeight: '3.5rem',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.35rem 0.55rem',
      }}
    >
      {children}
    </button>
  );
}

function SetupIconImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: '2.5rem',
        height: '2.5rem',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
}

export default function App() {
  const players = useGameStore((state) => state.gameState.players);
  const gameSetup = useGameStore((state) => state.gameState.gameSetup);
  const addPlayer = useGameStore((state) => state.addPlayer);
  const resetGame = useGameStore((state) => state.resetGame);
  const updateGameSetup = useGameStore((state) => state.updateGameSetup);
  const setSetupComplete = useGameStore((state) => state.setSetupComplete);
  const exportGameSaveFile = useGameStore((state) => state.exportGameSaveFile);
  const importGameSaveFile = useGameStore((state) => state.importGameSaveFile);

  const [localSetup, setLocalSetup] = useState<GameSetup>(gameSetup);
  const [sfxMuted, setSfxMuted] = useState(getSoundEffectsMuted);
  const [showTitleScreen, setShowTitleScreen] = useState(true);

  const titleMusicRef = useRef<HTMLAudioElement | null>(null);
  const openSaveInputRef = useRef<HTMLInputElement | null>(null);

  const startTitleMusic = () => {
    if (titleMusicRef.current) {
      titleMusicRef.current.play().catch(() => {});
      return;
    }

    const audio = new Audio('/assets/music/title.mp3');
    audio.loop = true;
    audio.volume = 0.45;
    titleMusicRef.current = audio;

    audio.play().catch(() => {});
  };

  useEffect(() => {
    if (players.length === 0) {
      addPlayer(createEmptyPlayer('blue'));
      addPlayer(createEmptyPlayer('red'));
      addPlayer(createEmptyPlayer('yellow'));
      addPlayer(createEmptyPlayer('white'));
    }
  }, [players.length, addPlayer]);

  useEffect(() => {
    if (!gameSetup.setupComplete) {
      setLocalSetup(gameSetup);
    }
  }, [gameSetup]);

  useEffect(() => {
    if (!showTitleScreen && gameSetup.setupComplete) {
      titleMusicRef.current?.pause();
      titleMusicRef.current = null;
      return;
    }

    if (showTitleScreen || !gameSetup.setupComplete) {
      startTitleMusic();
    }
  }, [showTitleScreen, gameSetup.setupComplete]);

  const stopTitleMusic = () => {
    titleMusicRef.current?.pause();
    titleMusicRef.current = null;
  };

  const returnToMainMenu = () => {
    playSound('panelClose');
    setShowTitleScreen(true);
    startTitleMusic();
  };

  const togglePlayer = (color: PlayerColor) => {
    playSound('panelClose');

    setLocalSetup((prev) => {
      const isRemoving = prev.playersInGame.includes(color);

      if (isRemoving && prev.playersInGame.length <= 2) {
        return prev;
      }

      const playersInGame = isRemoving
        ? prev.playersInGame.filter((c) => c !== color)
        : [...prev.playersInGame, color];

      return {
        ...prev,
        playersInGame,
        playersWithFlagships: prev.playersWithFlagships.filter((c) =>
          playersInGame.includes(c)
        ),
      };
    });
  };

  const toggleFlagship = (color: PlayerColor) => {
    playSound('panelClose');

    setLocalSetup((prev) => ({
      ...prev,
      playersWithFlagships: prev.playersWithFlagships.includes(color)
        ? prev.playersWithFlagships.filter((c) => c !== color)
        : [...prev.playersWithFlagships, color],
    }));
  };

  const toggleToken = (key: keyof GameSetup['optionalTokens']) => {
    playSound('panelClose');

    setLocalSetup((prev) => ({
      ...prev,
      optionalTokens: {
        ...prev.optionalTokens,
        [key]: !prev.optionalTokens[key],
      },
    }));
  };

  const toggleStructure = (key: keyof GameSetup['optionalStructures']) => {
    playSound('panelClose');

    setLocalSetup((prev) => ({
      ...prev,
      optionalStructures: {
        ...prev.optionalStructures,
        [key]: !prev.optionalStructures[key],
      },
    }));
  };

  const toggleSfxMuted = () => {
    const nextMuted = !sfxMuted;

    setSoundEffectsMuted(nextMuted);
    setSfxMuted(nextMuted);
  };

  const handleNewSave = () => {
    playSound('panelClose');
    startTitleMusic();
    resetGame();
    setShowTitleScreen(false);
  };

  const handleSaveToFile = async () => {
    playSound('panelClose');

    const saveName = window.prompt('Save file name:', 'arcs-campaign-save');

    if (saveName === null) {
      return;
    }

    const saveFile = exportGameSaveFile();
    const fileName = createSaveFileName(saveName);

    await downloadSaveFile(saveFile, fileName);
  };

  const handleOpenSaveClick = () => {
    playSound('panelClose');
    startTitleMusic();
    openSaveInputRef.current?.click();
  };

  const handleOpenSaveFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      const saveFile = await readSaveFileFromInput(file);

      importGameSaveFile(saveFile);
      stopTitleMusic();
      setShowTitleScreen(false);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not open save file.');
    }
  };

  const handleDeleteSave = async () => {
    playSound('panelClose');

    const result = await deleteSaveFile();

    if (!result.ok) {
      window.alert(result.reason);
    }
  };

  const handleBackToMainMenuFromSetup = () => {
    playSound('panelClose');
    startTitleMusic();
    setShowTitleScreen(true);
  };

  const handleConfirmSetup = () => {
    playSound('panelClose');

    if (localSetup.playersInGame.length < 2) {
      return;
    }

    stopTitleMusic();

    updateGameSetup({
      ...localSetup,
      setupComplete: true,
    });
    setSetupComplete(true);
  };

  return (
    <>
      <input
        ref={openSaveInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={handleOpenSaveFile}
      />

      {showTitleScreen && (
        <div className="title-screen" onClick={startTitleMusic}>
          <div className="title-screen-content">
            <h1>Arcs Blighted Reach Companion</h1>
            <h2>By Ethan Klein</h2>
            <p>
              Track your Blighted Reach Campaign board state, player boards, and cards. With this app you can now play base Arcs while you have a campaign in progress or run mulptiple campaigns at the same time.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              <button
                className="start-title-button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleNewSave();
                }}
              >
                New Save
              </button>

              <button
                className="start-title-button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleOpenSaveClick();
                }}
              >
                Open Previous Save
              </button>

              <button
                className="start-title-button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteSave();
                }}
              >
                Delete Save
              </button>
            </div>
          </div>
        </div>
      )}

      {!showTitleScreen && !gameSetup.setupComplete && (
        <div className="setup-modal" onClick={startTitleMusic}>
          <div className="setup-content">
            <h2>Game Setup</h2>

            <p
              style={{
                maxWidth: '46rem',
                margin: '0.5rem auto 1.5rem',
                color: 'rgba(255, 255, 255, 0.78)',
                lineHeight: 1.45,
                fontSize: '0.98rem',
              }}
            >
              We love the Blighted Reach Campaign for its seemingly endless possibilites. To improve your experince you can hide UI you will not need. This includes players that are out of the game. Flagships, tokens from certain fates, and special strucutres from lore.
            </p>

            <div className="setup-section">
              <strong>Players in Game</strong>
              <p>Choose at least 2 players.</p>
              <div className="chip-row">
                {allPlayerColors.map((color) => (
                  <button
                    key={color}
                    className={localSetup.playersInGame.includes(color) ? 'selected-chip' : ''}
                    onClick={() => togglePlayer(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="setup-section">
              <strong>Players with Flagships</strong>
              <div className="chip-row">
                {localSetup.playersInGame.map((color) => (
                  <SetupIconButton
                    key={color}
                    label={`${color} flagship`}
                    selected={localSetup.playersWithFlagships.includes(color)}
                    onClick={() => toggleFlagship(color)}
                  >
                    <SetupIconImage src={flagshipTokenImages[color]} alt={`${color} flagship`} />
                  </SetupIconButton>
                ))}
              </div>
            </div>

            <div className="setup-section">
              <strong>Special Tokens</strong>
              <div className="chip-row">
                <SetupIconButton
                  label="Pathfinder's Portal"
                  selected={localSetup.optionalTokens.pathfindersPortal}
                  onClick={() => toggleToken('pathfindersPortal')}
                >
                  <SetupIconImage src={setupTokenImages.pathfindersPortal} alt="Pathfinder's Portal" />
                </SetupIconButton>

                <SetupIconButton
                  label="Hegemon's Banner"
                  selected={localSetup.optionalTokens.hegemonsBanner}
                  onClick={() => toggleToken('hegemonsBanner')}
                >
                  <SetupIconImage src={setupTokenImages.hegemonsBanner} alt="Hegemon's Banner" />
                </SetupIconButton>

                <SetupIconButton
                  label="Caretaker's Golems"
                  selected={localSetup.optionalTokens.caretakersGolems}
                  onClick={() => toggleToken('caretakersGolems')}
                >
                  <SetupIconImage src={setupTokenImages.caretakersGolems} alt="Caretaker's Golems" />
                </SetupIconButton>

                <SetupIconButton
                  label="Planet Breaker's Broken"
                  selected={localSetup.optionalTokens.planetBreakersBroken}
                  onClick={() => toggleToken('planetBreakersBroken')}
                >
                  <SetupIconImage src={setupTokenImages.planetBreakersBroken} alt="Planet Breaker's Broken" />
                </SetupIconButton>

                <SetupIconButton
                  label="Founder's Seat Tokens"
                  selected={localSetup.optionalTokens.foundersSeatTokens}
                  onClick={() => toggleToken('foundersSeatTokens')}
                >
                  <SetupIconImage src={setupTokenImages.foundersSeatTokens} alt="Founder's Seat Tokens" />
                </SetupIconButton>
              </div>
            </div>

            <div className="setup-section">
              <strong>Special Structures</strong>
              <div className="chip-row">
                <button
                  className={localSetup.optionalStructures.cloudCities ? 'selected-chip' : ''}
                  onClick={() => toggleStructure('cloudCities')}
                >
                  Cloud Cities
                </button>
                <button
                  className={localSetup.optionalStructures.gatePorts ? 'selected-chip' : ''}
                  onClick={() => toggleStructure('gatePorts')}
                >
                  Gate Ports
                </button>
                <button
                  className={localSetup.optionalStructures.gateStations ? 'selected-chip' : ''}
                  onClick={() => toggleStructure('gateStations')}
                >
                  Gate Stations
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.75rem',
                marginTop: '1.25rem',
                flexWrap: 'wrap',
              }}
            >
              <button
                className="music-button"
                onClick={handleBackToMainMenuFromSetup}
              >
                Back to Main Menu
              </button>

              <button
                className="reset-button"
                onClick={handleConfirmSetup}
                disabled={localSetup.playersInGame.length < 2}
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="app-shell">
        <header className="topbar">
          <div>
            <h1>Arcs Blighted Reach Companion</h1>
            <p>Click the board spaces to edit gates and planets. Cards and Player boards are editable below.</p>
          </div>
          <div className="topbar-actions">
            {gameSetup.setupComplete && (
              <button className="music-button" onClick={returnToMainMenu}>
                Main Menu
              </button>
            )}

            <button className="music-button" onClick={handleSaveToFile}>
              Save
            </button>

            {gameSetup.setupComplete && !showTitleScreen && <BackgroundMusic />}

            <button className="music-button" onClick={toggleSfxMuted}>
              {sfxMuted ? 'Unmute SFX' : 'Mute SFX'}
            </button>

            <button className="reset-button" onClick={resetGame}>
              Reset game
            </button>
          </div>
        </header>

        <section className="main-layout">
          <BoardOverlay />
          <SelectedSpacePanel />
        </section>

        <CardsPanel />

        <PlayerBoards />
      </div>
    </>
  );
}
import { Suspense, lazy, useEffect, useRef, useState, type ReactNode } from 'react';
import { useGameStore } from './gameStore';
import { createEmptyPlayer, type GameSetup, type PlayerColor } from './gameState';
import { BackgroundMusic } from './components/BackgroundMusic';
import {
  getMusicVolume,
  getSfxVolume,
  playSound,
  setMusicVolume,
  setSfxVolume,
} from './utils/sound';


const BoardOverlay = lazy(() => import('./components/BoardOverlay'));
const CardsPanel = lazy(() => import('./components/CardsPanel'));
const PlayerBoards = lazy(() => import('./components/PlayerBoards'));
const SelectedSpacePanel = lazy(() => import('./components/SelectedSpacePanel'));

const allPlayerColors: PlayerColor[] = ['blue', 'red', 'yellow', 'white'];

const APP_VERSION = 'v.1.0';

const formatPlayerColor = (color: PlayerColor) =>
  color.charAt(0).toUpperCase() + color.slice(1);

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
type StoredSaveEntry = {
  name: string;
  fileName: string;
  updatedAt: number;
};

type StoredSaveListResult =
  | {
      ok: true;
      saves: StoredSaveEntry[];
    }
  | {
      ok: false;
      reason?: string;
    };

type StoredSaveResult =
  | {
      ok: true;
      name?: string;
      fileName?: string;
      saveFile?: unknown;
    }
  | {
      ok: false;
      reason?: string;
    };

type WarningModalState = {
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
} | null;

declare global {
  interface Window {
    electronAPI?: {
      platform?: string;
      listGameSaves?: () => Promise<StoredSaveListResult>;
      saveNamedGameFile?: (saveName: string, saveFile: unknown) => Promise<StoredSaveResult>;
      openNamedGameFile?: (fileName: string) => Promise<StoredSaveResult>;
      deleteNamedGameFile?: (fileName: string) => Promise<StoredSaveResult>;
    };
  }
}
function SetupIconButton({
  label,
  selected,
  onClick,
  children,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
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
  const [showTitleScreen, setShowTitleScreen] = useState(true);
  const [soundSettingsOpen, setSoundSettingsOpen] = useState(false);
  const [showHelpPage, setShowHelpPage] = useState(false);
  const [hasOpenedHelpAfterSetup, setHasOpenedHelpAfterSetup] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [musicVolume, setMusicVolumeState] = useState(getMusicVolume);
  const [sfxVolume, setSfxVolumeState] = useState(getSfxVolume);
  const [savePickerMode, setSavePickerMode] = useState<'open' | 'delete' | null>(null);
  const [storedSaves, setStoredSaves] = useState<StoredSaveEntry[]>([]);
  const [savePickerLoading, setSavePickerLoading] = useState(false);
  const [savePickerError, setSavePickerError] = useState('');
  const [saveNameModalOpen, setSaveNameModalOpen] = useState(false);
  const [saveNameDraft, setSaveNameDraft] = useState('Arcs Campaign Save');
  const [currentSaveName, setCurrentSaveName] = useState('Arcs Campaign Save');
  const [saveNameError, setSaveNameError] = useState('');
  const [saveNameSaving, setSaveNameSaving] = useState(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState('');
  const [warningModal, setWarningModal] = useState<WarningModalState>(null);
  const [cardPanelSessionKey, setCardPanelSessionKey] = useState(0);

  const titleMusicRef = useRef<HTMLAudioElement | null>(null);
  const saveNameInputRef = useRef<HTMLInputElement | null>(null);

  const startTitleMusic = () => {
    if (titleMusicRef.current) {
      titleMusicRef.current.volume = getMusicVolume();
      titleMusicRef.current.play().catch(() => {});
      return;
    }

    const audio = new Audio('/assets/music/title.mp3');
    audio.loop = true;
    audio.volume = getMusicVolume();
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

  useEffect(() => {
    if (!titleMusicRef.current) {
      return;
    }

    titleMusicRef.current.volume = musicVolume;

    if (musicVolume > 0 && titleMusicRef.current.paused) {
      titleMusicRef.current.play().catch(() => {});
    }
  }, [musicVolume]);

  useEffect(() => {
    if (!saveStatusMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSaveStatusMessage('');
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [saveStatusMessage]);

  useEffect(() => {
    if (!saveNameModalOpen) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      saveNameInputRef.current?.focus();
      saveNameInputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [saveNameModalOpen]);

  const resetMainAppScroll = () => {
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });

      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  };

  const stopTitleMusic = () => {
    titleMusicRef.current?.pause();
    titleMusicRef.current = null;
  };

  const returnToMainMenu = () => {
    playSound('panelClose');

    setWarningModal({
      title: 'Return to Main Menu?',
      message: 'Make sure you save your campaign first. Returning to the main menu will not automatically save your current progress.',
      confirmText: 'Return to Main Menu',
      onConfirm: () => {
        setShowTitleScreen(true);
        setSoundSettingsOpen(false);
        setShowHelpPage(false);
        startTitleMusic();
      },
    });
  };

  const returnToSetupMenu = () => {
    playSound('panelClose');

    const nextSetup = {
      ...gameSetup,
      setupComplete: false,
    };

    setLocalSetup(nextSetup);
    updateGameSetup(nextSetup);
    setSetupComplete(false);
    setShowTitleScreen(false);
    setSoundSettingsOpen(false);
    setShowHelpPage(false);
    startTitleMusic();
  };

  const togglePlayer = (color: PlayerColor) => {
    playSound('panelClose');

    setLocalSetup((prev) => {
      const isRemoving = prev.playersInGame.includes(color);

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

  const toggleCampaignAct = (campaignAct: GameSetup['campaignAct']) => {
    playSound('panelClose');

    setLocalSetup((prev) => ({
      ...prev,
      campaignAct,
    }));
  };

  const handleMusicVolumeChange = (value: number) => {
    setMusicVolume(value);
    setMusicVolumeState(value);
  };

  const handleSfxVolumeChange = (value: number) => {
    setSfxVolume(value);
    setSfxVolumeState(value);
  };

  const toggleSoundSettings = () => {
    playSound('panelClose');
    setSoundSettingsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!soundSettingsOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest('[data-sound-settings-root="true"]')) {
        return;
      }

      setSoundSettingsOpen(false);
    };

    window.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [soundSettingsOpen]);

  const openHelpPage = () => {
    playSound('panelClose');
    setSoundSettingsOpen(false);
    setShowHelpPage(true);
  };

  const closeHelpPage = () => {
    playSound('panelClose');
    setShowHelpPage(false);
  };

  const handleNewSave = () => {
    playSound('panelClose');
    startTitleMusic();
    resetGame();
    updateGameSetup({
      setupComplete: false,
      playersInGame: [],
      playersWithFlagships: [],
    });
    setLocalSetup((prev) => ({
      ...prev,
      setupComplete: false,
      playersInGame: [],
      playersWithFlagships: [],
    }));
    setCardPanelSessionKey((prev) => prev + 1);
    setHasOpenedHelpAfterSetup(false);
    setCurrentSaveName('Arcs Campaign Save');
    setSaveNameDraft('Arcs Campaign Save');
    setSaveStatusMessage('');
    setShowTitleScreen(false);
    setSoundSettingsOpen(false);
    setShowHelpPage(false);
  };

  const handleSaveToFile = () => {
    playSound('panelClose');
    setSaveNameSaving(false);
    setSaveNameDraft(currentSaveName || 'Arcs Campaign Save');
    setSaveNameError('');
    setSaveStatusMessage('');
    setSaveNameModalOpen(true);
  };

  const closeSaveNameModal = () => {
    if (saveNameSaving) {
      return;
    }

    playSound('panelClose');
    setSaveNameModalOpen(false);
    setSaveNameError('');
  };

  const handleConfirmSaveName = async () => {
    playSound('panelClose');

    const saveName = (saveNameInputRef.current?.value ?? saveNameDraft).trim();

    if (!saveName) {
      setSaveNameError('Enter a save name.');
      return;
    }

    if (!window.electronAPI?.saveNamedGameFile) {
      setSaveNameError('Desktop saving is only available in the app version.');
      return;
    }

    setSaveNameSaving(true);
    setSaveNameError('');

    try {
      const saveFile = exportGameSaveFile(saveName);
      const result = await window.electronAPI.saveNamedGameFile(saveName, saveFile);

      if (!result.ok) {
        setSaveNameError(result.reason ?? 'Could not save campaign.');
        return;
      }

      const savedName = result.name ?? saveName;
      setCurrentSaveName(savedName);
      setSaveNameDraft(savedName);
      setSaveNameModalOpen(false);
      setSaveNameError('');
      setSaveStatusMessage(`Saved: ${savedName}`);
    } catch (error) {
      setSaveNameError(error instanceof Error ? error.message : 'Could not save campaign.');
    } finally {
      setSaveNameSaving(false);
    }
  };

  const openStoredSavePicker = async (mode: 'open' | 'delete') => {
    playSound('panelClose');
    setSavePickerMode(mode);
    setSavePickerLoading(true);
    setSavePickerError('');

    if (!window.electronAPI?.listGameSaves) {
      setStoredSaves([]);
      setSavePickerError('Stored saves are only available in the app version.');
      setSavePickerLoading(false);
      return;
    }

    try {
      const result = await window.electronAPI.listGameSaves();

      if (!result.ok) {
        setStoredSaves([]);
        setSavePickerError(result.reason ?? 'Could not load saves.');
        return;
      }

      setStoredSaves(result.saves);
    } catch (error) {
      setStoredSaves([]);
      setSavePickerError(error instanceof Error ? error.message : 'Could not load saves.');
    } finally {
      setSavePickerLoading(false);
    }
  };

  const handleOpenStoredSave = async (save: StoredSaveEntry) => {
    playSound('panelClose');

    if (!window.electronAPI?.openNamedGameFile) {
      window.alert('Stored saves are only available in the app version.');
      return;
    }

    try {
      const result = await window.electronAPI.openNamedGameFile(save.fileName);

      if (!result.ok || !result.saveFile) {
        window.alert(result.reason ?? 'Could not open save.');
        return;
      }

      importGameSaveFile(result.saveFile as Parameters<typeof importGameSaveFile>[0]);
      setCardPanelSessionKey((prev) => prev + 1);
      setHasOpenedHelpAfterSetup(true);
      setCurrentSaveName(save.name || 'Arcs Campaign Save');
      setSaveNameDraft(save.name || 'Arcs Campaign Save');
      setSaveStatusMessage('');
      stopTitleMusic();
      setShowTitleScreen(false);
      setSoundSettingsOpen(false);
      setShowHelpPage(false);
      setSavePickerMode(null);
      resetMainAppScroll();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not open save.');
    }
  };

  const handleDeleteStoredSave = async (save: StoredSaveEntry) => {
    playSound('panelClose');

    const confirmed = window.confirm(`Delete "${save.name}"? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    if (!window.electronAPI?.deleteNamedGameFile) {
      window.alert('Stored saves are only available in the app version.');
      return;
    }

    try {
      const result = await window.electronAPI.deleteNamedGameFile(save.fileName);

      if (!result.ok) {
        window.alert(result.reason ?? 'Could not delete save.');
        return;
      }

      setStoredSaves((prev) => prev.filter((entry) => entry.fileName !== save.fileName));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not delete save.');
    }
  };

  const closeStoredSavePicker = () => {
    playSound('panelClose');
    setSavePickerMode(null);
    setSavePickerError('');
  };

  const handleResetGame = () => {
    playSound('panelClose');

    setWarningModal({
      title: 'Reset Game?',
      message: 'This will clear the current app state. Make sure you save your campaign first if you want to keep your progress.',
      confirmText: 'Reset Game',
      onConfirm: () => {
        resetGame();
        setCardPanelSessionKey((prev) => prev + 1);
        setSoundSettingsOpen(false);
        setShowHelpPage(false);
      },
    });
  };

  const handleOpenSaveClick = () => {
    startTitleMusic();
    openStoredSavePicker('open');
  };

  const handleDeleteSave = async () => {
    openStoredSavePicker('delete');
  };

  useEffect(() => {
    if (!saveNameModalOpen) {
      return;
    }

    const handleSaveNameKeyDown = (event: KeyboardEvent) => {
      if (!saveNameModalOpen || saveNameSaving) {
        return;
      }

      const input = saveNameInputRef.current;

      if (!input) {
        return;
      }

      input.focus();

      const stopAndPrevent = () => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      };

      const setInputValue = (nextValue: string, nextCursor: number) => {
        input.value = nextValue;
        input.setSelectionRange(nextCursor, nextCursor);
        setSaveNameError('');
      };

      const selectionStart = input.selectionStart ?? input.value.length;
      const selectionEnd = input.selectionEnd ?? selectionStart;
      const left = input.value.slice(0, selectionStart);
      const right = input.value.slice(selectionEnd);

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
        stopAndPrevent();
        input.select();
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        event.stopPropagation();
        return;
      }

      if (event.key === 'Enter') {
        stopAndPrevent();
        handleConfirmSaveName();
        return;
      }

      if (event.key === 'Escape') {
        stopAndPrevent();
        closeSaveNameModal();
        return;
      }

      if (event.key === 'Backspace') {
        stopAndPrevent();

        if (selectionStart !== selectionEnd) {
          setInputValue(left + right, selectionStart);
          return;
        }

        if (selectionStart > 0) {
          setInputValue(
            input.value.slice(0, selectionStart - 1) + input.value.slice(selectionEnd),
            selectionStart - 1
          );
        }

        return;
      }

      if (event.key === 'Delete') {
        stopAndPrevent();

        if (selectionStart !== selectionEnd) {
          setInputValue(left + right, selectionStart);
          return;
        }

        if (selectionStart < input.value.length) {
          setInputValue(
            input.value.slice(0, selectionStart) + input.value.slice(selectionStart + 1),
            selectionStart
          );
        }

        return;
      }

      if (event.key === 'ArrowLeft') {
        stopAndPrevent();
        const nextCursor = Math.max(0, selectionStart - 1);
        input.setSelectionRange(nextCursor, nextCursor);
        return;
      }

      if (event.key === 'ArrowRight') {
        stopAndPrevent();
        const nextCursor = Math.min(input.value.length, selectionEnd + 1);
        input.setSelectionRange(nextCursor, nextCursor);
        return;
      }

      if (event.key === 'Home') {
        stopAndPrevent();
        input.setSelectionRange(0, 0);
        return;
      }

      if (event.key === 'End') {
        stopAndPrevent();
        input.setSelectionRange(input.value.length, input.value.length);
        return;
      }

      if (event.key.length === 1) {
        stopAndPrevent();
        const nextValue = left + event.key + right;
        setInputValue(nextValue, selectionStart + event.key.length);
        return;
      }

      event.stopPropagation();
    };

    window.addEventListener('keydown', handleSaveNameKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleSaveNameKeyDown, true);
    };
  }, [saveNameModalOpen, saveNameSaving]);

  const handleBackToMainMenuFromSetup = () => {
    playSound('panelClose');
    startTitleMusic();
    setShowTitleScreen(true);
    setSoundSettingsOpen(false);
    setShowHelpPage(false);
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
    setSoundSettingsOpen(false);

    resetMainAppScroll();

    if (!hasOpenedHelpAfterSetup) {
      setShowHelpPage(true);
      setHasOpenedHelpAfterSetup(true);
    } else {
      setShowHelpPage(false);
    }
  };

  const closeWarningModal = () => {
    playSound('panelClose');
    setWarningModal(null);
  };

  const confirmWarningModal = () => {
    if (!warningModal) {
      return;
    }

    playSound('panelClose');
    warningModal.onConfirm();
    setWarningModal(null);
  };

  const renderSoundSettingsControl = (align: 'left' | 'right' = 'right') => (
    <div
      data-sound-settings-root="true"
      style={{ position: 'relative' }}
      onClick={(event) => event.stopPropagation()}
    >
      <button className="music-button" onClick={toggleSoundSettings}>
        Sound Settings
      </button>

      {soundSettingsOpen && (
        <div
          style={{
            position: 'absolute',
            right: align === 'right' ? 0 : 'auto',
            left: align === 'left' ? 0 : 'auto',
            top: 'calc(100% + 0.5rem)',
            zIndex: 15000,
            width: '16rem',
            padding: '0.85rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.24)',
            background: 'rgba(5, 5, 5, 0.96)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.55)',
            color: 'white',
            textAlign: 'left',
          }}
        >
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              marginBottom: '0.8rem',
            }}
          >
            <span>Music Volume: {Math.round(musicVolume * 100)}%</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(event) => handleMusicVolumeChange(Number(event.target.value))}
            />
          </label>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            <span>SFX Volume: {Math.round(sfxVolume * 100)}%</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sfxVolume}
              onChange={(event) => handleSfxVolumeChange(Number(event.target.value))}
            />
          </label>
        </div>
      )}
    </div>
  );

  return (
    <>
      {warningModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50000,
            background: 'rgba(0, 0, 0, 0.76)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={closeWarningModal}
        >
          <div
            style={{
              width: 'min(92vw, 30rem)',
              background: '#101010',
              border: '1px solid rgba(255, 255, 255, 0.24)',
              borderRadius: '1rem',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.75)',
              padding: '1.25rem',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  }}
>
  <h2 style={{ margin: 0 }}>{warningModal.title}</h2>
</div>

            <p style={{ margin: 0, lineHeight: 1.5 }}>
              {warningModal.message}
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <button className="music-button" onClick={closeWarningModal}>
                Cancel
              </button>

              <button className="reset-button" onClick={confirmWarningModal}>
                {warningModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {saveNameModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50000,
            background: 'rgba(0, 0, 0, 0.76)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={closeSaveNameModal}
        >
          <div
            style={{
              width: 'min(92vw, 30rem)',
              background: '#101010',
              border: '1px solid rgba(255, 255, 255, 0.24)',
              borderRadius: '1rem',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.75)',
              padding: '1.25rem',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  }}
>
  <h2 style={{ margin: 0 }}>Save Campaign</h2>
</div>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
              }}
            >
              <span>Save name</span>
              <input
                ref={saveNameInputRef}
                defaultValue={saveNameDraft}
                onClick={(event) => event.stopPropagation()}
                onFocus={() => {
                  setSaveNameError('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleConfirmSaveName();
                  }
                }}
                autoFocus
                disabled={saveNameSaving}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'white',
                  padding: '0.7rem 0.8rem',
                  font: 'inherit',
                }}
              />
            </label>

            {saveNameError && <p style={{ color: '#ffb4b4', margin: 0 }}>{saveNameError}</p>}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <button className="music-button" onClick={closeSaveNameModal} disabled={saveNameSaving}>
                Cancel
              </button>
              <button className="music-button" onClick={handleConfirmSaveName} disabled={saveNameSaving}>
                {saveNameSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {savePickerMode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50000,
            background: 'rgba(0, 0, 0, 0.76)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={closeStoredSavePicker}
        >
          <div
            style={{
              width: 'min(92vw, 36rem)',
              maxHeight: 'min(82vh, 42rem)',
              background: '#101010',
              border: '1px solid rgba(255, 255, 255, 0.24)',
              borderRadius: '1rem',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.75)',
              padding: '1.25rem',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <h2 style={{ margin: 0 }}>
                {savePickerMode === 'open' ? 'Open Existing Campaign' : 'Delete Campaign'}
              </h2>

              <button className="music-button" onClick={closeStoredSavePicker}>
                Close
              </button>
            </div>

            {savePickerLoading && <p>Loading saves...</p>}

            {!savePickerLoading && savePickerError && (
              <p style={{ color: '#ffb4b4', margin: 0 }}>{savePickerError}</p>
            )}

            {!savePickerLoading && !savePickerError && storedSaves.length === 0 && (
              <p style={{ margin: 0 }}>No saved campaigns found.</p>
            )}

            {!savePickerLoading && storedSaves.length > 0 && (
              <div
                style={{
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  paddingRight: '0.25rem',
                }}
              >
                {storedSaves.map((save) => (
                  <button
                    key={save.fileName}
                    className="music-button"
                    onClick={() => {
                      if (savePickerMode === 'open') {
                        handleOpenStoredSave(save);
                      } else {
                        handleDeleteStoredSave(save);
                      }
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: '0.25rem',
                      padding: '0.8rem 1rem',
                    }}
                  >
                    <strong>{save.name}</strong>
                    <span style={{ opacity: 0.74, fontSize: '0.85rem' }}>
                      Last saved: {new Date(save.updatedAt).toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {saveStatusMessage && !saveNameModalOpen && !savePickerMode && !showTitleScreen && (
        <div
          style={{
            position: 'fixed',
            right: '1rem',
            bottom: '1rem',
            zIndex: 45000,
            background: 'rgba(0, 0, 0, 0.82)',
            border: '1px solid rgba(255, 255, 255, 0.24)',
            borderRadius: '0.75rem',
            color: 'white',
            padding: '0.75rem 1rem',
            boxShadow: '0 16px 42px rgba(0, 0, 0, 0.55)',
          }}
          onClick={() => setSaveStatusMessage('')}
        >
          {saveStatusMessage}
        </div>
      )}

      {showContactPopup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40000,
            background: 'rgba(0, 0, 0, 0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
          onClick={() => setShowContactPopup(false)}
        >
          <div
            style={{
              width: 'min(92vw, 28rem)',
              background: '#101010',
              border: '1px solid rgba(255, 255, 255, 0.24)',
              borderRadius: '1rem',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.75)',
              padding: '1.25rem',
              color: 'white',
              textAlign: 'center',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Support</h2>

            <p>For help with the Arcs Blighted Reach Companion, email:</p>

            <p
              style={{
                fontWeight: 700,
                fontSize: '1.05rem',
                wordBreak: 'break-word',
              }}
            >
              arcsbrcompanion@gmail.com
            </p>

            <p
              style={{
                marginTop: '0.35rem',
                marginBottom: 0,
                fontSize: '0.75rem',
                opacity: 0.7,
              }}
            >
              {APP_VERSION}
            </p>

            <div
  style={{
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginTop: '1.25rem',
  }}
>
  <button
    className="music-button"
    onClick={() => {
      playSound('panelClose');
      setShowContactPopup(false);
    }}
  >
    Close
  </button>

  <button
    className="music-button"
    onClick={async () => {
      playSound('panelClose');

      try {
        await navigator.clipboard.writeText('arcsbrcompanion@gmail.com');
        window.alert('Email copied: arcsbrcompanion@gmail.com');
      } catch {
        window.prompt('Copy this email:', 'arcsbrcompanion@gmail.com');
      }
    }}
  >
    Copy Email
  </button>
</div>
          </div>
        </div>
      )}

      {showHelpPage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 30000,
            background: 'rgba(0, 0, 0, 0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div
            style={{
              width: 'min(92vw, 70rem)',
              height: 'min(88vh, 52rem)',
              background: '#101010',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '1rem',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.75)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.16)',
                background: 'rgba(0, 0, 0, 0.88)',
                color: 'white',
              }}
            >
              <strong>Help Page</strong>

              <button className="music-button" onClick={closeHelpPage}>
                Close
              </button>
            </div>

            <div
  style={{
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem 2rem 2rem',
    background: 'rgba(12, 12, 12, 0.98)',
    color: 'white',
    lineHeight: 1.55,
  }}
>
  <section
    className="help-writeup"
    style={{
      maxWidth: '58rem',
      margin: '0 auto',
    }}
  >
    
    <h1 style={{ color: '#c09437' }}>Using the Arcs Blighted Reach Companion App</h1>

    <p>
      This app lets you save and rebuild your <strong>Blighted Reach Campaign</strong> game state between acts.
      It is meant to be used after you finish a game and complete Intermission, but before you put the
      physical game away.
    </p>

    <h2 style={{ color: '#c09437' }}>The Basic Flow</h2>

    <p>
      Start by completing all steps outlined in the Intermission Aid found in your Arcs game box. Then begin entering your campaign state into the app. Once you have entered all elements of your game state into the app, save your game state by clickng the save button and giving it a unique name.
      Now you can put the physical game away. At your next session, open the saved app file, rebuild the
      physical game from the app, and then continue with Act II or Act III setup as described in the Arcs Act II & III Set Up Aid in your Arcs game box.

    </p>

    <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem',
    margin: '1rem 0 1.25rem',
  }}
>
  <ol
    style={{
      margin: 0,
      paddingLeft: '1.5rem',
      flex: '1 1 auto',
    }}
  >
    <li>Complete Intermission Aid Steps.</li>
    <li>Complete Initial Campaign Settings Steps.</li>
    <li>Enter the Board State.</li>
    <li>Add Cards from the Available Cards Menu.</li>
    <li>Check Assigned Cards.</li>
    <li>Fill Out Player Areas.</li>
    <li>Save the Campaign File.</li>
    <li>Prepare to Play Your Next Act.</li>
  </ol>

  <img
  src="/assets/help/conspirator.png"
  alt="Conspirator"
  style={{
    width: 'min(28vw, 13rem)',
    maxHeight: '18rem',
    objectFit: 'contain',
    flexShrink: 0,
    transform: 'translateX(-6rem)',
    filter: 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.55))',
  }}
/>
</div>

    <h2 style={{ color: '#c09437' }}>1. Complete Intermission Aid steps</h2>

    <p>
      At the end of a campaign game, complete all steps outlined in the Intermission Aid in your Arcs game box. This includes choosing new Fates
      and resolving any required Intermission steps.
    </p>

    <p>
      Do not fully set up the next game yet. The correct order is to complete Intermission, record the
      campaign state in the app, save the file, and then put the game away.
    </p>

    <h2 style={{ color: '#c09437' }}>2. Complete Initial Campaign Settings Steps</h2>

    <p>
      Start a New Campaign or open an existing one on the title screen. In the Setup Menu, choose the players who are in
      the game, the players who have Flagships, the next act of your campaign (Act II or Act III), and the
      Special Tokens and/or Structures being used.
    </p>

    <p>
      When you have completed the initial campaign settings steps outlined above, click <strong>Next</strong>. If you need to change any game set up choices
      later, use <strong>Edit Setup</strong>.
    </p>

    <h2 style={{ color: '#c09437' }}>3. Enter the Board State</h2>

    <p>
      Look at your physical Arcs game board. Starting with <strong>Cluster 1</strong>, use the app to 
      go System by System to enter your game state 
      until you finish <strong>Cluster 6</strong> (dont forget the gates).
    </p>

    <p>
      You will do this by clicking a space on the board in the app to open the Selected Space Panel. Use that panel to add the pieces
      that are currently in that System on your physical Board.
    </p>

    <p>You can track pieces such as:</p>

    <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem',
    margin: '1rem 0 1.25rem',
  }}
>
  <ul
    style={{
      margin: 0,
      paddingLeft: '1.5rem',
      flex: '1 1 auto',
    }}
  >
    <li>Ships</li>
    <li>Cities</li>
    <li>Starports</li>
    <li>Blight</li>
    <li>Banners</li>
    <li>Broken Tokens</li>
    <li>Portals</li>
    <li>Cloud Cities</li>
    <li>Gate Ports</li>
    <li>Gate Stations</li>
    <li>Flagships</li>
    <li>Seat Tokens, if they are being used</li>
  </ul>

  <img
    src="/assets/help/planetbreaker.png"
    alt="Planet Breaker"
    style={{
      width: 'min(34vw, 18rem)',
      maxHeight: '24rem',
      objectFit: 'contain',
      flexShrink: 0,
      transform: 'translate(-5rem, -2rem)',
      filter: 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.55))',
    }}
  />
</div>

    <p>Continue until the board in the app matches the physical game board.</p>

    <h2 style={{ color: '#c09437' }}>4. Add Cards from the Available Cards Menu</h2>

    <p>
      Next, go to the <strong>Available Cards</strong> menu. This Section contains all the cards that can be added.
    </p>

    <p>
      Cards are organized by either the Base Game group or by the Fate they come from. For convenience,
      the 15 Starting Court Cards already begin in the Court Deck.
    </p>

    <p>You can use the Search Bar to quickly find a Card by Name, Card ID, or Group.</p>

    <p>From Available Cards, cards can be added to:</p>

    <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem',
    margin: '1rem 0 1.25rem',
  }}
>
  <ul
    style={{
      margin: 0,
      paddingLeft: '1.5rem',
      flex: '1 1 auto',
    }}
  >
    <li>Court</li>
    <li>Laws</li>
    <li>Edicts</li>
    <li>Summit</li>
    <li>Action Deck</li>
    <li>A Player Area</li>
  </ul>

  <img
    src="/assets/help/warden.png"
    alt="Warden"
    style={{
      width: 'min(28vw, 14rem)',
maxHeight: '19rem',
      objectFit: 'contain',
      flexShrink: 0,
      transform: 'translate(-5rem, -1rem)',
      filter: 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.55))',
    }}
  />
</div>

    <p>
      Some Cards have an <strong>Add to Player</strong> button. Click it, then choose the Player who
      should receive the Card. Faithful Action Cards can be added to either the Court or the Action Deck.
    </p>

    <h2 style={{ color: '#c09437' }}>5. Check Assigned Cards</h2>

    <p>
      After adding Cards to the Court Deck, Rules Areas, Action Deck, and Scrap, go to <strong>Assigned Cards</strong>. Use this Area to confirm that every card
      is in the correct place. Then check the Player Areas as well.
    </p>

    <p>Assigned Cards includes:</p>

    <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem',
    margin: '1rem 0 1.25rem',
  }}
>
  <ul
    style={{
      margin: 0,
      paddingLeft: '1.5rem',
      flex: '1 1 auto',
    }}
  >
    <li>Court</li>
    <li>Laws</li>
    <li>Edicts</li>
    <li>Summit</li>
    <li>Action Deck</li>
    <li>Scrap Pile</li>
  </ul>

  <img
    src="/assets/help/advocate.png"
    alt="Advocate"
    style={{
      width: 'min(20vw, 10rem)',
maxHeight: '14rem',
      objectFit: 'contain',
      flexShrink: 0,
      transform: 'translate(-5rem, -1rem)',
      filter: 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.55))',
    }}
  />
</div>

    <p>
      If a Court Card was scrapped during your campaign, you can scrap it from the Court in the app.
      If a card was moved to the Scrap Pile by mistake, you can move it back to Available Cards.
    </p>

    <h2 style={{ color: '#c09437' }}>6. Fill Out Player Areas</h2>

    <p>
      Finally, go to the <strong>Player Areas</strong> section. For each player, enter everything from
      that player’s physical area.
    </p>

    <p>You can track:</p>

    <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem',
    margin: '1rem 0 1.25rem',
  }}
>
  <ul
    style={{
      margin: 0,
      paddingLeft: '1.5rem',
      flex: '1 1 auto',
    }}
  >
    <li>Player Name</li>
    <li>Power</li>
    <li>Fate</li>
    <li>Allegiance</li>
    <li>Ships, Cities, and Starports remaining</li>
    <li>Resources</li>
    <li>Favors</li>
    <li>Outrage</li>
    <li>Golems, if they are being used</li>
    <li>Player-Owned Cards</li>
    <li>Flagship Board Pieces, if they are being used</li>
  </ul>

  <img
    src="/assets/help/redeemer.png"
    alt="Redeemer"
    style={{
      width: 'min(28vw, 14rem)',
      maxHeight: '19rem',
      objectFit: 'contain',
      flexShrink: 0,
      transform: 'translate(-4rem, -1rem)',
      filter: 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.55))',
    }}
  />
</div>

    <p>The goal is for each Player Area in the app to match that player’s physical area.</p>

    <h2 style={{ color: '#c09437' }}>7. Save the Campaign File</h2>

    <p>
      When the Board, Cards, and Player Areas are all entered correctly, click <strong>Save</strong>. Choose or
      confirm the unique Save Name for the campaign file.
    </p>

    <p>The app saves the current campaign state, including:</p>

    <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem',
    margin: '1rem 0 1.25rem',
  }}
>
  <ul
    style={{
      margin: 0,
      paddingLeft: '1.5rem',
      flex: '1 1 auto',
    }}
  >
    <li>Board Pieces</li>
    <li>Player Areas</li>
    <li>Court Cards</li>
    <li>Rules Cards</li>
    <li>Action Deck</li>
    <li>Scrap Pile</li>
    <li>Player Cards</li>
    <li>Setup Options</li>
  </ul>

  <img
    src="/assets/help/pathfinder.png"
    alt="Pathfinder"
    style={{
      width: 'min(28vw, 14rem)',
      maxHeight: '19rem',
      objectFit: 'contain',
      flexShrink: 0,
      transform: 'translate(-5rem, -1rem)',
      filter: 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.55))',
    }}
  />
</div>

    <p>After saving, you can safely put the physical game away.</p>

    <h2 style={{ color: '#c09437' }}>8. Prepare to Play Your Next Act</h2>

    <p>
      At the start of your next session, open the app and load the saved campaign file. Rebuild your game state on the physical board as represented in the app.
    </p>

    <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem',
    margin: '1rem 0 1.25rem',
  }}
>
  <ul
    style={{
      margin: 0,
      paddingLeft: '1.5rem',
      flex: '1 1 auto',
    }}
  >
    <li>Rebuild the Board from the app map.</li>
    <li>Rebuild each Player Area from the Player Areas section.</li>
    <li>Rebuild the Court from Assigned Cards.</li>
    <li>Rebuild Laws, Edicts, and Summit Cards.</li>
    <li>Rebuild the Action Deck.</li>
    <li>Rebuild the Scrap Pile.</li>
    <li>Return Available Cards to their correct supply.</li>
  </ul>

  <img
    src="/assets/help/gatewraith.png"
    alt="Gatewraith"
    style={{
      width: 'min(28vw, 14rem)',
      maxHeight: '19rem',
      objectFit: 'contain',
      flexShrink: 0,
      transform: 'translate(-3rem, -1rem)',
      filter: 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.55))',
    }}
  />
</div>

    <p>
      Once the physical game state matches the app, continue with the steps outlined in the <strong>Act II</strong> &
      <strong> Act III</strong> Setup Guide in your Acrs game box.
    </p>

    <p>
      Please note: The app does not replace the campaign rules. It helps you save the campaign state after
      Intermission and rebuild it correctly before the next Act.
    </p>
  </section>
</div>
          </div>
        </div>
      )}

      {showTitleScreen && (
  <div className="title-screen" onClick={startTitleMusic}>
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 20000,
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
      }}
      onClick={(event) => event.stopPropagation()}
    >
      <button className="music-button" onClick={openHelpPage}>
        Help
      </button>

      {renderSoundSettingsControl('right')}
    </div>

    <div className="title-screen-content">
      <h1
  style={{
    transform: 'translateY(1.5rem)',
  }}
>
  <img
    src="/assets/arcs-title-logo.png"
    alt="Arcs"
    style={{
      height: '1.65em',
      width: 'auto',
      display: 'block',
      objectFit: 'contain',
      margin: '0 auto 0.05em',
    }}
  />

  <span
    style={{
      display: 'block',
      fontSize: '0.48em',
      lineHeight: 0.9,
    }}
  >
    Blighted Reach
  </span>

  <span
    style={{
      display: 'block',
      fontSize: '0.48em',
      lineHeight: 0.9,
    }}
  >
    Companion
  </span>

  <span
    style={{
      display: 'block',
      marginTop: '0.45rem',
      fontSize: '0.16em',
      lineHeight: 1,
      opacity: 0.7,
      letterSpacing: '0.08em',
    }}
  >
    {APP_VERSION}
  </span>
</h1>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(10rem, 1fr) minmax(0, 42rem) minmax(10rem, 1fr)',
                alignItems: 'center',
                gap: '2rem',
                width: '100%',
                maxWidth: '88rem',
                margin: '0 auto',
              }}
            >
              <img
                src="/assets/Admiral.png"
                alt="Admiral"
                style={{
                  width: 'min(32vw, 28rem)',
    maxHeight: '36rem',
                  objectFit: 'contain',
                  display: 'block',
                  justifySelf: 'center',
                  transform: 'translateX(-2rem)',
                }}
              />

              <div style={{ textAlign: 'center' }}>
                <h2>By Ethan Klein</h2>

                <p>
                  Use this app to track your Blighted Reach Campaign board state, cards, and player areas. With this app you can now play base Arcs while you have a campaign in progress or track multiple campaigns at once.
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
                    New Campaign
                  </button>

                  <button
                    className="start-title-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenSaveClick();
                    }}
                  >
                    Open Existing Campaign
                  </button>

                  <button
                    className="start-title-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteSave();
                    }}
                  >
                    Delete Campaign
                  </button>
                  <button
                    className="start-title-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      playSound('panelClose');
                      setShowContactPopup(true);
                    }}
                  >
                    Support
                  </button>
                </div>
              </div>

              <img
                src="/assets/survivalist.png"
                alt="Survivalist"
                style={{
                  width: 'min(32vw, 28rem)',
    maxHeight: '36rem',
                  objectFit: 'contain',
                  display: 'block',
                  justifySelf: 'center',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {!showTitleScreen && !gameSetup.setupComplete && (
        <div className="setup-modal" onClick={startTitleMusic}>
          <div className="setup-content" style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                zIndex: 20000,
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <button className="music-button" onClick={openHelpPage}>
                Help
              </button>

              {renderSoundSettingsControl('right')}
            </div>

            <h2 style={{ color: '#c09437' }}> Initial Campaign Settings</h2>

            <p
              style={{
                maxWidth: '46rem',
                margin: '0.5rem auto 1.5rem',
                color: 'rgba(255, 255, 255, 0.78)',
                lineHeight: 1.45,
                fontSize: '0.98rem',
              }}
            >
              We love the Blighted Reach Campaign for its seemingly endless possibilites. To improve your experince you can hide features not in your current campaign. This includes players that are out of the game, flagships, tokens from certain fates, and special strucutres from lore.
            </p>

            <div className="setup-section">
              <strong style={{ color: '#c09437' }}>Campaign Act</strong>
              <p>Select your next act:</p>
              <div className="chip-row">
                <button
                  className={(localSetup.campaignAct ?? 'actII') === 'actII' ? 'selected-chip' : ''}
                  onClick={() => toggleCampaignAct('actII')}
                >
                  Act II
                </button>

                <button
                  className={localSetup.campaignAct === 'actIII' ? 'selected-chip' : ''}
                  onClick={() => toggleCampaignAct('actIII')}
                >
                  Act III
                </button>
              </div>
            </div>

            <div className="setup-section">
  <strong style={{ color: '#c09437' }}>Players in Game</strong>
  <p>Select at least two active players:</p>
  <div className="chip-row">
    {allPlayerColors.map((color) => (
      <button
        key={color}
        className={localSetup.playersInGame.includes(color) ? 'selected-chip' : ''}
        onClick={() => togglePlayer(color)}
      >
        {formatPlayerColor(color)}
      </button>
    ))}
  </div>
</div>

            <div className="setup-section">
              <strong style={{ color: '#c09437' }}>Players with Flagships</strong>
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
              <strong style={{ color: '#c09437' }}>Special Tokens</strong>
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
              <strong style={{ color: '#c09437' }}>Special Structures</strong>
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
  onClick={handleConfirmSetup}
  disabled={localSetup.playersInGame.length < 2}
  style={{
    background:
      localSetup.playersInGame.length < 2
        ? '#5f1f1a'
        : '#2f7d32',
    color: '#ffffff',
    border:
      localSetup.playersInGame.length < 2
        ? '1px solid #d2ae50'
        : '1px solid rgba(255, 255, 255, 0.24)',
    boxShadow:
      localSetup.playersInGame.length < 2
        ? '0 0 0 1px rgba(210, 174, 80, 0.18)'
        : undefined,
    opacity:
      localSetup.playersInGame.length < 2
        ? 0.95
        : 1,
    cursor:
      localSetup.playersInGame.length < 2
        ? 'not-allowed'
        : 'pointer',
  }}
>
  {localSetup.playersInGame.length < 2 ? 'Next: Choose at least two players to proceed' : 'Next'}
</button>
            </div>
          </div>
        </div>
      )}

      <div className="app-shell">
        <header className="topbar">
          <div>
            <h1>
              Arcs Blighted Reach Companion{' '}
              {gameSetup.setupComplete && (
                <span
                  style={{
                    fontSize: '0.55em',
                    opacity: 0.75,
                    marginLeft: '0.6rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {gameSetup.campaignAct === 'actIII' ? 'Act III' : 'Act II'}
                </span>
              )}
            </h1>
            <p>Click the board spaces to edit gates and planets. cards and player areas are editable below.</p>
          </div>

          <div className="topbar-actions">
            {gameSetup.setupComplete && (
              <>
                <button className="music-button" onClick={returnToMainMenu}>
                  Main Menu
                </button>

                <button className="music-button" onClick={returnToSetupMenu}>
                  Edit Setup
                </button>
              </>
            )}

            <button className="music-button" onClick={handleSaveToFile}>
              Save
            </button>

            {gameSetup.setupComplete && (
              <button className="music-button" onClick={openHelpPage}>
                Help
              </button>
            )}

            {gameSetup.setupComplete && !showTitleScreen && <BackgroundMusic />}

            {gameSetup.setupComplete && !showTitleScreen && renderSoundSettingsControl('right')}

            <button className="reset-button" onClick={handleResetGame}>
              Reset game
            </button>
          </div>
        </header>

        <Suspense fallback={<div className="panel">Loading app...</div>}>
          <section className="main-layout">
            <BoardOverlay />
            <SelectedSpacePanel />
          </section>

          <CardsPanel key={cardPanelSessionKey} />

          <PlayerBoards />
        </Suspense>
      </div>
    </>
  );
}

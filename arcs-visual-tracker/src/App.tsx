import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import BoardOverlay from './components/BoardOverlay';
import CardsPanel from './components/CardsPanel';
import PlayerBoards from './components/PlayerBoards';
import SelectedSpacePanel from './components/SelectedSpacePanel';
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
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [musicVolume, setMusicVolumeState] = useState(getMusicVolume);
  const [sfxVolume, setSfxVolumeState] = useState(getSfxVolume);

  const titleMusicRef = useRef<HTMLAudioElement | null>(null);
  const openSaveInputRef = useRef<HTMLInputElement | null>(null);

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

  const stopTitleMusic = () => {
    titleMusicRef.current?.pause();
    titleMusicRef.current = null;
  };

  const returnToMainMenu = () => {
    playSound('panelClose');

    const confirmed = window.confirm(
      'Are you sure you want to return to the main menu? Make sure you save your file first.'
    );

    if (!confirmed) {
      return;
    }

    setShowTitleScreen(true);
    setSoundSettingsOpen(false);
    setShowHelpPage(false);
    startTitleMusic();
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
    setShowTitleScreen(false);
    setSoundSettingsOpen(false);
    setShowHelpPage(false);
  };

  const handleSaveToFile = async () => {
    playSound('panelClose');

    const saveName = window.prompt('Save file name:', 'arcs-campaign-save');

    if (saveName === null) {
      return;
    }

    const saveFile = exportGameSaveFile(saveName);
    const fileName = createSaveFileName(saveName);

    await downloadSaveFile(saveFile, fileName);
  };

  const handleResetGame = () => {
    playSound('panelClose');

    const confirmed = window.confirm(
      'Are you sure you want to reset the game? This will clear the current app state.'
    );

    if (!confirmed) {
      return;
    }

    resetGame();
    setSoundSettingsOpen(false);
    setShowHelpPage(false);
  };

  const handleOpenSaveClick = () => {
    playSound('panelClose');
    startTitleMusic();
    openSaveInputRef.current?.click();
  };

  const handleOpenSaveFile = async (event: ChangeEvent<HTMLInputElement>) => {
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
      setSoundSettingsOpen(false);
      setShowHelpPage(false);
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
    setShowHelpPage(false);
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
            <h2 style={{ marginTop: 0 }}>Help / Contact</h2>

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
              <strong>Help</strong>

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
    <h1>How to Use the Arcs Campaign Companion App</h1>

    <p>
      This app helps you save and rebuild your <strong>Blighted Reach Campaign</strong> between games.
      It is meant to be used after you finish a game and complete Intermission, but before you put the
      physical game away.
    </p>

    <h2>The Basic Flow</h2>

    <p>
      Finish Intermission first. Then enter the campaign state into the app. After that, save the app
      file and put the physical game away. At your next session, open the saved app file, rebuild the
      physical game from the app, and then continue with the normal Act II or Act III setup.
    </p>

    <ol>
      <li>Finish Intermission.</li>
      <li>Enter the campaign state into the app.</li>
      <li>Save the campaign file.</li>
      <li>Put the physical game away.</li>
      <li>At the next session, open the saved file.</li>
      <li>Rebuild the Board, Player Areas, and Card Areas from the app.</li>
      <li>Then complete the normal Act II or Act III Setup.</li>
    </ol>

    <h2>1. Finish Intermission First</h2>

    <p>
      At the end of a campaign game, complete Intermission following Intermission Aid. This includes choosing new Fates
      and resolving any required Intermission steps.
    </p>

    <p>
      Do not fully set up the next game yet. The correct order is to complete Intermission, record the
      campaign state in the app, save the file, and then put the game away.
    </p>

    <h2>2. Set Up the App</h2>

    <p>
      Start a New Save or open an existing one. In the Setup Menu, choose which Players are still in
      the game, which Players have Flagships, whether the next campaign game is Act II or Act III, and which
      Special Tokens or Structures are being used.
    </p>

    <p>
      When everything is selected, click <strong>Start App</strong>. If you need to change these choices
      later, use <strong>Edit Setup</strong>.
    </p>

    <h2>3. Enter the Board State</h2>

    <p>
      Look at your physical campaign Map. Starting with <strong>Cluster 1</strong>, go System by System
      until you reach <strong>Cluster 6</strong>.
    </p>

    <p>
      Click a Space on the app Board to open the Selected Space Panel. Use that Panel to add the Pieces
      that are currently in that System on your physical Board.
    </p>

    <p>You can track Pieces such as:</p>

    <ul>
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

    <p>Continue until the Board in the app matches the physical campaign Board.</p>

    <h2>4. Add Cards from Available Cards</h2>

    <p>
      Next, go to <strong>Available Cards</strong>. This Section contains Cards that can be added to the
      campaign state.
    </p>

    <p>
      Cards are organized by either the Base Game group or by the Fate they come from. For convenience,
      the 15 Starting Court Cards already begin in the Court Deck.
    </p>

    <p>You can use the Search Bar to quickly find a Card by Name, Card ID, or Group.</p>

    <p>From Available Cards, Cards can be added to:</p>

    <ul>
      <li>Court</li>
      <li>Laws</li>
      <li>Edicts</li>
      <li>Summit</li>
      <li>Action Deck</li>
      <li>A Player Area</li>
    </ul>

    <p>
      Some Cards have an <strong>Add to Player</strong> button. Click it, then choose the Player who
      should receive the Card. Faithful Action Cards can be added to either the Court or the Action Deck.
    </p>

    <h2>5. Check Placed Cards</h2>

    <p>
      After adding Cards, go to <strong>Placed Cards</strong>. Use this Area to confirm that every Card
      is in the correct place.
    </p>

    <p>Placed Cards includes:</p>

    <ul>
      <li>Court</li>
      <li>Laws</li>
      <li>Edicts</li>
      <li>Summit</li>
      <li>Action Deck</li>
      <li>Scrap Pile</li>
    </ul>

    <p>
      If a Court Card was scrapped during your campaign, you can scrap it from the Court in the app.
      If a Card was moved to the Scrap Pile by mistake, you can move it back to Available Cards.
    </p>

    <h2>6. Fill Out Player Areas</h2>

    <p>
      Finally, go to the <strong>Player Areas</strong> section. For each Player, enter everything from
      that Player’s physical campaign area.
    </p>

    <p>You can track:</p>

    <ul>
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

    <p>The goal is for each Player Area in the app to match that Player’s physical campaign area.</p>

    <h2>7. Save the Campaign File</h2>

    <p>
      When the Board, Cards, and Player Areas are all entered, click <strong>Save</strong>. Choose or
      confirm the Save Name for the campaign file.
    </p>

    <p>The app saves the current campaign state, including:</p>

    <ul>
      <li>Board Pieces</li>
      <li>Player Areas</li>
      <li>Court Cards</li>
      <li>Rules Cards</li>
      <li>Action Deck</li>
      <li>Scrap Pile</li>
      <li>Player Cards</li>
      <li>Setup Options</li>
    </ul>

    <p>After saving, you can safely put the physical game away.</p>

    <h2>8. Rebuild the Next Game Later</h2>

    <p>
      At the start of your next session, open the app and load the saved campaign file. Use the app as
      your source of truth.
    </p>

    <p>First, reset the physical game Components to match the app:</p>

    <ul>
      <li>Rebuild the Board from the app Map.</li>
      <li>Rebuild each Player Area from the Player Areas section.</li>
      <li>Rebuild the Court from Placed Cards.</li>
      <li>Rebuild Laws, Edicts, and Summit Cards.</li>
      <li>Rebuild the Action Deck.</li>
      <li>Rebuild the Scrap Pile.</li>
      <li>Return Available Cards to their correct supply.</li>
    </ul>

    <p>
      Once the physical game matches the app, continue with the normal <strong>Act II</strong> or
      <strong> Act III</strong> Setup Guide.
    </p>

    <p>
      The app does not replace the campaign rules. It helps you save the campaign state after
      Intermission and rebuild it correctly before the next game.
    </p>
  </section>
</div>
          </div>
        </div>
      )}

      {showTitleScreen && (
  <div className="title-screen" onClick={startTitleMusic}>
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
                  Track your Blighted Reach Campaign board state, player boards, and cards. With this app you can now play base Arcs while you have a campaign in progress or run mulptiple campaigns at once.
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
              <strong>Campaign Act</strong>
              <p>Choose the act you are setting up for.</p>
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
                className="start-app-button"
                onClick={handleConfirmSetup}
                disabled={localSetup.playersInGame.length < 2}
              >
                Start App
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
            <p>Click the board spaces to edit gates and planets. Cards and Player boards are editable below.</p>
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

            <div style={{ position: 'relative' }}>
              <button className="music-button" onClick={toggleSoundSettings}>
                Sound Settings
              </button>

              {soundSettingsOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 0.5rem)',
                    zIndex: 15000,
                    width: '16rem',
                    padding: '0.85rem',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.24)',
                    background: 'rgba(5, 5, 5, 0.96)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.55)',
                    color: 'white',
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

            <button className="reset-button" onClick={handleResetGame}>
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
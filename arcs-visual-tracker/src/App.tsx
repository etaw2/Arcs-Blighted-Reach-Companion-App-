import { useEffect, useState } from 'react';
import BoardOverlay from './components/BoardOverlay';
import CardsPanel from './components/CardsPanel';
import PlayerBoards from './components/PlayerBoards';
import SelectedSpacePanel from './components/SelectedSpacePanel';
import { useGameStore } from './gameStore';
import { createEmptyPlayer, type GameSetup, type PlayerColor } from './gameState';

const allPlayerColors: PlayerColor[] = ['blue', 'red', 'yellow', 'white'];

export default function App() {
  const players = useGameStore((state) => state.gameState.players);
  const gameSetup = useGameStore((state) => state.gameState.gameSetup);
  const addPlayer = useGameStore((state) => state.addPlayer);
  const resetGame = useGameStore((state) => state.resetGame);
  const updateGameSetup = useGameStore((state) => state.updateGameSetup);
  const setSetupComplete = useGameStore((state) => state.setSetupComplete);

  const [localSetup, setLocalSetup] = useState<GameSetup>(gameSetup);

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

  const togglePlayer = (color: PlayerColor) => {
    setLocalSetup((prev) => {
      const playersInGame = prev.playersInGame.includes(color)
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
    setLocalSetup((prev) => ({
      ...prev,
      playersWithFlagships: prev.playersWithFlagships.includes(color)
        ? prev.playersWithFlagships.filter((c) => c !== color)
        : [...prev.playersWithFlagships, color],
    }));
  };

  const toggleToken = (key: keyof GameSetup['optionalTokens']) => {
    setLocalSetup((prev) => ({
      ...prev,
      optionalTokens: {
        ...prev.optionalTokens,
        [key]: !prev.optionalTokens[key],
      },
    }));
  };

  const toggleStructure = (key: keyof GameSetup['optionalStructures']) => {
    setLocalSetup((prev) => ({
      ...prev,
      optionalStructures: {
        ...prev.optionalStructures,
        [key]: !prev.optionalStructures[key],
      },
    }));
  };

  const handleConfirmSetup = () => {
    updateGameSetup({
      ...localSetup,
      setupComplete: true,
    });
    setSetupComplete(true);
  };

  return (
    <>
      {!gameSetup.setupComplete && (
        <div className="setup-modal">
          <div className="setup-content">
            <h2>Game Setup</h2>

            <div className="setup-section">
              <strong>Players in Game</strong>
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
                  <button
                    key={color}
                    className={localSetup.playersWithFlagships.includes(color) ? 'selected-chip' : ''}
                    onClick={() => toggleFlagship(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="setup-section">
              <strong>Special Tokens</strong>
              <div className="chip-row">
                <button
                  className={localSetup.optionalTokens.pathfindersPortal ? 'selected-chip' : ''}
                  onClick={() => toggleToken('pathfindersPortal')}
                >
                  Pathfinder&apos;s Portal
                </button>
                <button
                  className={localSetup.optionalTokens.hegemonsBanner ? 'selected-chip' : ''}
                  onClick={() => toggleToken('hegemonsBanner')}
                >
                  Hegemon&apos;s Banner
                </button>
                <button
                  className={localSetup.optionalTokens.caretakersGolems ? 'selected-chip' : ''}
                  onClick={() => toggleToken('caretakersGolems')}
                >
                  Caretaker&apos;s Golems
                </button>
                <button
                  className={localSetup.optionalTokens.planetBreakersBroken ? 'selected-chip' : ''}
                  onClick={() => toggleToken('planetBreakersBroken')}
                >
                  Planet Breaker&apos;s Broken
                </button>
              </div>
            </div>

            <div className="setup-section">
              <strong>Structures</strong>
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

            <button className="reset-button" onClick={handleConfirmSetup}>
              Start Game
            </button>
          </div>
        </div>
      )}

      <div className="app-shell">
        <header className="topbar">
          <div>
            <h1>Arcs Visual Tracker</h1>
            <p>Click the board spaces to edit gates and planets. Player boards are editable below.</p>
          </div>
          <button className="reset-button" onClick={resetGame}>Reset game</button>
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
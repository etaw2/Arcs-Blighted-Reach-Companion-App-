import { useEffect } from 'react';
import BoardOverlay from './components/BoardOverlay';
import PlayerBoards from './components/PlayerBoards';
import SelectedSpacePanel from './components/SelectedSpacePanel';
import { useGameStore } from './gameStore';
import { createEmptyPlayer } from './gameState';

export default function App() {
  const players = useGameStore((state) => state.gameState.players);
  const addPlayer = useGameStore((state) => state.addPlayer);
  const resetGame = useGameStore((state) => state.resetGame);

  useEffect(() => {
    if (players.length === 0) {
      addPlayer(createEmptyPlayer('blue'));
      addPlayer(createEmptyPlayer('red'));
      addPlayer(createEmptyPlayer('yellow'));
      addPlayer(createEmptyPlayer('white'));
    }
  }, [players.length, addPlayer]);

  return (
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

      <PlayerBoards />
    </div>
  );
}

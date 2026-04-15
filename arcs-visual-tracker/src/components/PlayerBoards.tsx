import { useGameStore } from '../gameStore';
import { playerBoardImageByColor, type PlayerColor, type ResourceType } from '../gameState';

const playerColors: PlayerColor[] = ['blue', 'red', 'yellow', 'white'];
const outrageOptions: ResourceType[] = ['fuel', 'material', 'weapon', 'relic', 'psionic'];

const fateOptions = [
  '',
  'Pathfinder',
  'Hegemon',
  'Planet Breaker',
  'Pirate',
  'Blight Speaker',
  'Pacifist',
  'Peacekeeper',
  'Warden',
  'Overlord',
  'Survivalist',
  'Redeemer',
  'Guardian',
  'Naturalist',
  'Gate Wraith',
  'Conspirator',
  'Judge',
];

export default function PlayerBoards() {
  const players = useGameStore((state) => state.gameState.players);
  const updatePlayer = useGameStore((state) => state.updatePlayer);
  const updatePlayerResources = useGameStore((state) => state.updatePlayerResources);
  const setInitiative = useGameStore((state) => state.setInitiative);

  return (
    <section className="player-section">
      <h2>Player Boards</h2>
      <div className="player-grid">
        {playerColors.map((color) => {
          const player = players.find((p) => p.color === color);
          if (!player) return null;

          const toggleOutrage = (resource: ResourceType) => {
            const next = player.outrage.includes(resource)
              ? player.outrage.filter((r) => r !== resource)
              : [...player.outrage, resource];
            updatePlayer(color, { outrage: next });
          };

          const changeResource = (resource: keyof typeof player.resources, delta: number) => {
            const next = Math.max(0, player.resources[resource] + delta);
            updatePlayerResources(color, { [resource]: next });
          };

          return (
            <div key={color} className="player-card">
              <h3 className={`player-title ${color}`}>{color.toUpperCase()}</h3>
              <img
                className="player-board-image"
                src={playerBoardImageByColor[color]}
                alt={`${color} player board`}
              />

              <div className="player-controls">
                <div className="inline-controls">
                  <label>Power</label>
                  <button onClick={() => updatePlayer(color, { power: Math.max(0, player.power - 1) })}>-</button>
                  <span>{player.power}</span>
                  <button onClick={() => updatePlayer(color, { power: player.power + 1 })}>+</button>
                </div>

                <div className="inline-controls">
                  <label>Ships</label>
                  <span>{player.ships}</span>
                </div>

                <div className="inline-controls">
                  <label>Cities</label>
                  <span>{player.cities}</span>
                </div>

                <div className="inline-controls">
                  <label>Starports</label>
                  <span>{player.starports}</span>
                </div>

                <div className="inline-controls">
                  <label>Favors</label>
                  <button onClick={() => updatePlayer(color, { favors: Math.max(0, player.favors - 1) })}>-</button>
                  <span>{player.favors}</span>
                  <button onClick={() => updatePlayer(color, { favors: player.favors + 1 })}>+</button>
                </div>

                <div className="inline-controls">
                  <label>Initiative</label>
                  <button onClick={() => setInitiative(color)}>
                    {player.initiative ? 'On' : 'Off'}
                  </button>
                </div>

                <div className="inline-controls">
                  <label>Flagship</label>
                  <button onClick={() => updatePlayer(color, { flagship: !player.flagship })}>
                    {player.flagship ? 'On' : 'Off'}
                  </button>
                </div>

                <div className="inline-controls grow">
                  <label>Fate</label>
                  <select
                    value={player.fate ?? ''}
                    onChange={(event) =>
                      updatePlayer(color, { fate: event.target.value || null })
                    }
                  >
                    {fateOptions.map((fate) => (
                      <option key={fate} value={fate}>
                        {fate === '' ? 'None' : fate}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="resource-grid">
                  {Object.entries(player.resources).map(([resource, value]) => (
                    <div className="resource-box" key={resource}>
                      <span>{resource}</span>
                      <div>
                        <button onClick={() => changeResource(resource as keyof typeof player.resources, -1)}>
                          -
                        </button>
                        <strong>{value}</strong>
                        <button onClick={() => changeResource(resource as keyof typeof player.resources, 1)}>
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <strong>Outrage</strong>
                  <div className="chip-row">
                    {outrageOptions.map((resource) => (
                      <button
                        key={resource}
                        className={player.outrage.includes(resource) ? 'selected-chip' : ''}
                        onClick={() => toggleOutrage(resource)}
                      >
                        {resource}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
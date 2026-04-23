import { useState } from 'react';
import { useGameStore } from '../gameStore';
import {
  flagshipBoardImage,
  playerBoardImageByColor,
  type PlayerColor,
  type ResourceType,
} from '../gameState';

const playerColors: PlayerColor[] = ['blue', 'red', 'yellow', 'white'];
const outrageOptions: ResourceType[] = ['fuel', 'material', 'weapon', 'relic', 'psionic'];

const resourceImageByType: Partial<Record<ResourceType, string>> = {
  fuel: '/assets/fuel.png',
  material: '/assets/material.png',
  weapon: '/assets/weapon.png',
  relic: '/assets/relic.png',
  psionic: '/assets/psionic.png',
};

const favorImageByColor: Record<PlayerColor, string> = {
  blue: '/assets/blue agent.png',
  red: '/assets/red agent.png',
  yellow: '/assets/yellow agent.png',
  white: '/assets/white agent.png',
};

const cityImageByColor: Record<PlayerColor, string> = {
  blue: '/assets/arcs dev_player piece blue city.png',
  red: '/assets/arcs dev_player piece red city.png',
  yellow: '/assets/arcs dev_player piece yellow city.png',
  white: '/assets/arcs dev_player piece white city.png',
};

const starportImageByColor: Record<PlayerColor, string> = {
  blue: '/assets/arcs dev_player piece blue starport.png',
  red: '/assets/arcs dev_player piece red starport.png',
  yellow: '/assets/arcs dev_player piece yellow starport.png',
  white: '/assets/arcs dev_player piece white starport.png',
};

const shipImageByColor: Record<PlayerColor, string> = {
  blue: '/assets/arcs dev_player piece blue ship.png',
  red: '/assets/arcs dev_player piece red ship.png',
  yellow: '/assets/arcs dev_player piece yellow ship.png',
  white: '/assets/arcs dev_player piece white ship.png',
};

const flagshipImageByColor: Record<PlayerColor, string> = {
  blue: '/assets/arcs dev_player piece blue flagship.png',
  red: '/assets/arcs dev_player piece red flagship.png',
  yellow: '/assets/arcs dev_player piece yellow flagship.png',
  white: '/assets/arcs dev_player piece white flagship.png',
};

const initiativeMarkerImage = '/assets/initiative marker.png';

const fateOptions = [
  '',
  'Steward',
  'Founder',
  'Magnate',
  'Advocate',
  'Caretaker',
  'Partisan',
  'Admiral',
  'Believer',
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

  const [powerInputs, setPowerInputs] = useState<Record<PlayerColor, string>>({
    blue: '',
    red: '',
    yellow: '',
    white: '',
  });

  const highestPower = players.length > 0 ? Math.max(...players.map((player) => player.power)) : 0;
  const highestPowerPlayers = players.filter((player) => player.power === highestPower);
  const hasTieForHighest = highestPower > 0 && highestPowerPlayers.length > 1;

  return (
    <section className="player-section">
      <h2>Player Boards</h2>
      <div className="player-grid">
        {playerColors.map((color) => {
          const player = players.find((p) => p.color === color);
          if (!player) return null;

          const isTiedForHighest = hasTieForHighest && player.power === highestPower;

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

          const changeFavor = (favorColor: PlayerColor, delta: number) => {
            const next = Math.max(0, player.favors[favorColor] + delta);
            updatePlayer(color, {
              favors: {
                ...player.favors,
                [favorColor]: next,
              },
            });
          };

          return (
            <div key={color} className="player-card">
              <h3 className={`player-title ${color}`}>{color.toUpperCase()}</h3>

              <img
                className="player-board-image"
                src={playerBoardImageByColor[color]}
                alt={`${color} player board`}
              />

              {player.flagship && (
                <img
                  className="player-board-image"
                  src={flagshipBoardImage}
                  alt="flagship board"
                />
              )}

              <div className="player-controls">
                <div className="inline-controls">
                  <label>Power</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={powerInputs[color] !== '' ? powerInputs[color] : String(player.power)}
                    onChange={(event) => {
                      const value = event.target.value;

                      if (/^\d*$/.test(value)) {
                        setPowerInputs((prev) => ({
                          ...prev,
                          [color]: value,
                        }));

                        if (value !== '') {
                          updatePlayer(color, { power: Math.max(0, Number(value)) });
                        }
                      }
                    }}
                    onFocus={(event) => {
                      setPowerInputs((prev) => ({
                        ...prev,
                        [color]: String(player.power),
                      }));
                      event.target.select();
                    }}
                    onBlur={() => {
                      const value = powerInputs[color];

                      if (value === '') {
                        updatePlayer(color, { power: 0 });
                      }

                      setPowerInputs((prev) => ({
                        ...prev,
                        [color]: '',
                      }));
                    }}
                    className="power-input"
                  />

                  {player.initiative && (
                    <img
                      className="initiative-icon"
                      src={initiativeMarkerImage}
                      alt="initiative marker"
                    />
                  )}

                  {isTiedForHighest && !player.initiative && (
                    <button onClick={() => setInitiative(color)}>
                      Take Initiative
                    </button>
                  )}
                </div>

                <div className="inline-controls grow">
                  <label>Fate</label>
                  <select
                    value={player.fate ?? ''}
                    onChange={(event) => updatePlayer(color, { fate: event.target.value || null })}
                  >
                    {fateOptions.map((fate) => (
                      <option key={fate} value={fate}>
                        {fate === '' ? 'None' : fate}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="subsection">
                  <strong>Allegiance</strong>
                  <div className="chip-row">
                    <button
                      className={player.allegiance === 'regent' ? 'selected-chip' : ''}
                      onClick={() => updatePlayer(player.color, { allegiance: 'regent' })}
                    >
                      Regent
                    </button>
                    <button
                      className={player.allegiance === 'outlaw' ? 'selected-chip' : ''}
                      onClick={() => updatePlayer(player.color, { allegiance: 'outlaw' })}
                    >
                      Outlaw
                    </button>
                  </div>
                </div>

                <div className="inline-controls">
                  <img
                    className="player-piece-icon"
                    src={flagshipImageByColor[color]}
                    alt={`${color} flagship`}
                  />
                  <button onClick={() => updatePlayer(color, { flagship: !player.flagship })}>
                    {player.flagship ? 'On' : 'Off'}
                  </button>
                </div>

                <div className="inline-controls">
                  <img
                    className="player-piece-icon"
                    src={shipImageByColor[color]}
                    alt={`${color} ship`}
                  />
                  <span>{player.ships}</span>
                </div>

                <div className="inline-controls">
                  <img
                    className="player-piece-icon"
                    src={cityImageByColor[color]}
                    alt={`${color} city`}
                  />
                  <span>{player.cities}</span>
                </div>

                <div className="inline-controls">
                  <img
                    className="player-piece-icon"
                    src={starportImageByColor[color]}
                    alt={`${color} starport`}
                  />
                  <span>{player.starports}</span>
                </div>

                <div className="subsection">
                  <strong>Resources</strong>
                  <div className="resource-grid">
                    {Object.entries(player.resources)
                      .filter(([resource]) => resource !== 'golem')
                      .map(([resource, value]) => (
                        <div className="resource-box" key={resource}>
                          {resourceImageByType[resource as ResourceType] ? (
                            <img
                              className="resource-icon"
                              src={resourceImageByType[resource as ResourceType]}
                              alt={resource}
                            />
                          ) : (
                            <span>{resource}</span>
                          )}
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
                </div>

                <div className="subsection">
                  <strong>Favors</strong>
                  <div className="resource-grid">
                    {playerColors
                      .filter((favorColor) => favorColor !== color)
                      .map((favorColor) => (
                        <div className="resource-box" key={favorColor}>
                          <img
                            className="favor-icon"
                            src={favorImageByColor[favorColor]}
                            alt={`${favorColor} favor`}
                          />
                          <div>
                            <button onClick={() => changeFavor(favorColor, -1)}>-</button>
                            <strong>{player.favors[favorColor]}</strong>
                            <button onClick={() => changeFavor(favorColor, 1)}>+</button>
                          </div>
                        </div>
                      ))}
                  </div>
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
                        {resourceImageByType[resource] ? (
                          <img
                            className="resource-chip-icon"
                            src={resourceImageByType[resource]}
                            alt={resource}
                          />
                        ) : (
                          resource
                        )}
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
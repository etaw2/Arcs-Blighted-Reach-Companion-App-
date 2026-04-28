import { useState } from 'react';
import { useGameStore } from '../gameStore';
import { playSound } from '../utils/sound';
import GameCardView from './GameCardView';
import {
  flagshipBoardImage,
  flagshipUpgrades,
  playerBoardImageByColor,
  type BuildingType,
  type FlagshipBoardSlotType,
  type FlagshipUpgradeId,
  type GolemType,
  type PlayerColor,
  type ResourceType,
} from '../gameState';

const playerColors: PlayerColor[] = ['blue', 'red', 'yellow', 'white'];
const outrageOptions: ResourceType[] = ['fuel', 'material', 'weapon', 'relic', 'psionic'];
const golemTypes: GolemType[] = ['warrior', 'seeker', 'protector', 'harvester'];
const flagshipBoardSlots: {
  upgradeId: FlagshipUpgradeId;
  slotType: FlagshipBoardSlotType;
  left: string;
  top: string;
}[] = [
  { upgradeId: 'slipstreamDrive', slotType: 'upgrade', left: '7.3%', top: '41%' },
  { upgradeId: 'slipstreamDrive', slotType: 'armor', left: '7.31%', top: '15.5%' },

  { upgradeId: 'tractorBeam', slotType: 'upgrade', left: '20.8%', top: '41%' },
  { upgradeId: 'tractorBeam', slotType: 'armor', left: '20.8%', top: '15.5%' },

  { upgradeId: 'controlArray', slotType: 'upgrade', left: '34.4%', top: '41%' },
  { upgradeId: 'controlArray', slotType: 'armor', left: '34.4%', top: '15.5%' },

  { upgradeId: 'defenseArray', slotType: 'upgrade', left: '65.5%', top: '41%' },
  { upgradeId: 'defenseArray', slotType: 'armor', left: '65.5%', top: '15.5%' },

  { upgradeId: 'shipCrane', slotType: 'upgrade', left: '79.01%', top: '41%' },
  { upgradeId: 'shipCrane', slotType: 'armor', left: '79.01%', top: '15.5%' },

  { upgradeId: 'hull', slotType: 'upgrade', left: '92.65%', top: '41%' },
  { upgradeId: 'hull', slotType: 'armor', left: '92.65%', top: '15.5%' },
];

const resourceImageByType: Partial<Record<ResourceType, string>> = {
  fuel: '/assets/fuel.png',
  material: '/assets/material.png',
  weapon: '/assets/weapon.png',
  relic: '/assets/relic.png',
  psionic: '/assets/psionic.png',
};

const golemImageByType: Record<GolemType, string> = {
  warrior: '/assets/warrior.png',
  seeker: '/assets/seeker.png',
  protector: '/assets/protector.png',
  harvester: '/assets/harvester.png',
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
  const gameSetup = useGameStore((state) => state.gameState.gameSetup);
  const updatePlayer = useGameStore((state) => state.updatePlayer);
  const updatePlayerResources = useGameStore((state) => state.updatePlayerResources);
  const removePlayerCardFromPlayer = useGameStore((state) => state.removePlayerCardFromPlayer);
  const scrapPlayerCardFromPlayer = useGameStore((state) => state.scrapPlayerCardFromPlayer);
  const setInitiative = useGameStore((state) => state.setInitiative);
  const placeFlagshipBoardBuilding = useGameStore(
    (state) => state.placeFlagshipBoardBuilding
  );
  const removeFlagshipBoardBuilding = useGameStore(
    (state) => state.removeFlagshipBoardBuilding
  );

  const activePlayerColors = gameSetup.playersInGame;
  const activePlayers = players.filter((player) => activePlayerColors.includes(player.color));

  const [powerInputs, setPowerInputs] = useState<Record<PlayerColor, string>>({
    blue: '',
    red: '',
    yellow: '',
    white: '',
  });

  const [selectedFlagshipBuilding, setSelectedFlagshipBuilding] = useState<
    Partial<Record<PlayerColor, BuildingType>>
  >({});

  const highestPower =
    activePlayers.length > 0 ? Math.max(...activePlayers.map((player) => player.power)) : 0;
  const highestPowerPlayers = activePlayers.filter((player) => player.power === highestPower);
  const hasTieForHighest = highestPower > 0 && highestPowerPlayers.length > 1;
  const flagshipSlotVerticalOffset =
    activePlayerColors.length === 2 ? '2%' : activePlayerColors.length === 3 ? '1.5%' : '0%';

  return (
    <section className="player-section">
      <h2>Player Boards</h2>
      <div className="player-grid">
        {playerColors
          .filter((color) => activePlayerColors.includes(color))
          .map((color) => {
            const player = players.find((p) => p.color === color);
            if (!player) return null;

            const isTiedForHighest = hasTieForHighest && player.power === highestPower;

            const toggleOutrage = (resource: ResourceType) => {
              const hasOutrage = player.outrage.includes(resource);
              const next = hasOutrage
                ? player.outrage.filter((item) => item !== resource)
                : [...player.outrage, resource];

              playSound(hasOutrage ? 'cheer' : 'outrage');

              updatePlayer(color, { outrage: next });
            };

            const changeResource = (resource: ResourceType, delta: number) => {
              const current = player.resources[resource];
              const next = Math.max(0, current + delta);

              if (next === current) {
                return;
              }

              playSound(delta > 0 ? 'resources' : 'panelClose');

              updatePlayerResources(color, { [resource]: next });
            };

            const changeFavor = (favorColor: PlayerColor, delta: number) => {
              const current = player.favors[favorColor];
              const next = Math.max(0, current + delta);

              if (next === current) {
                return;
              }

              playSound(delta > 0 ? 'panelOpen' : 'panelClose');
              updatePlayer(color, {
                favors: {
                  ...player.favors,
                  [favorColor]: next,
                },
              });
            };

            const toggleGolem = (golemType: GolemType) => {
              const isTurningOn = !player.golems[golemType];

              if (!isTurningOn) {
                playSound('tokenRemove');

                updatePlayer(color, {
                  golems: {
                    ...player.golems,
                    [golemType]: false,
                  },
                });
                return;
              }

              playSound('golemAdd');

              activePlayerColors.forEach((otherColor) => {
                const otherPlayer = players.find((p) => p.color === otherColor);
                if (!otherPlayer) return;

                updatePlayer(otherColor, {
                  golems: {
                    ...otherPlayer.golems,
                    [golemType]: otherColor === color,
                  },
                });
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

                <div className="player-controls">
                  {gameSetup.playersWithFlagships.includes(color) && (
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        display: 'inline-block',
                      }}
                    >
                      <img
                        className="player-board-image"
                        src={flagshipBoardImage}
                        alt="flagship board"
                        style={{
                          display: 'block',
                          width: '100%',
                          height: 'auto',
                        }}
                      />

                      {flagshipBoardSlots.map((slot) => {
                        const flagshipBoard = player.flagshipBoard;
                        const upgradeState = flagshipBoard[slot.upgradeId];
                        const placedBuilding = upgradeState[slot.slotType];
                        const selectedBuilding = selectedFlagshipBuilding[color];
                        const armorIsUnlocked =
                          slot.slotType === 'upgrade' || Boolean(upgradeState.upgrade);
                        const isSelectable =
                          Boolean(selectedBuilding) && !placedBuilding && armorIsUnlocked;

                        return (
                          <button
                            key={`${slot.upgradeId}-${slot.slotType}`}
                            title={`${
                              flagshipUpgrades.find((upgrade) => upgrade.id === slot.upgradeId)
                                ?.name
                            } ${slot.slotType}`}
                            onClick={() => {
                              if (placedBuilding) {
                                playSound('tokenRemove');

                                removeFlagshipBoardBuilding(
                                  color,
                                  slot.upgradeId,
                                  slot.slotType
                                );
                                return;
                              }

                              if (!selectedBuilding || !armorIsUnlocked) {
                                return;
                              }

                              playSound('buildingAdd');

                              placeFlagshipBoardBuilding(
                                color,
                                slot.upgradeId,
                                slot.slotType,
                                selectedBuilding
                              );

                              setSelectedFlagshipBuilding((prev) => ({
                                ...prev,
                                [color]: undefined,
                              }));
                            }}
                            style={{
                              position: 'absolute',
                              left: slot.left,
                              top: `calc(${slot.top} + ${flagshipSlotVerticalOffset})`,
                              transform: 'translate(-50%, -50%)',
                              width: '9%',
                              aspectRatio: '1 / 1',
                              height: 'auto',
                              border: 'none',
                              background: 'transparent',
                              padding: 0,
                              cursor: placedBuilding || isSelectable ? 'pointer' : 'default',
                              opacity: slot.slotType === 'armor' && !armorIsUnlocked ? 0.35 : 1,
                            }}
                          >
                            {isSelectable && selectedBuilding && (
                              <img
                                src={
                                  selectedBuilding === 'city'
                                    ? cityImageByColor[color]
                                    : starportImageByColor[color]
                                }
                                alt=""
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  opacity: 0.45,
                                  filter: 'brightness(2) drop-shadow(0 0 8px white) drop-shadow(0 0 14px white)',
                                  pointerEvents: 'none',
                                }}
                              />
                            )}

                            {placedBuilding && (
                              <img
                                className="space-token-icon"
                                src={
                                  placedBuilding.type === 'city'
                                    ? cityImageByColor[color]
                                    : starportImageByColor[color]
                                }
                                alt={`${color} ${placedBuilding.type}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {gameSetup.playersWithFlagships.includes(color) && (
                    <div className="subsection">
                      <strong>Add Flagship Upgrades</strong>
                      <div className="chip-row">
                        <button
                          className={
                            selectedFlagshipBuilding[color] === 'city'
                              ? 'selected-chip'
                              : ''
                          }
                          onClick={() =>
                            setSelectedFlagshipBuilding((prev) => {
                              const isTurningOff = prev[color] === 'city';

                              playSound(isTurningOff ? 'panelClose' : 'panelOpen');

                              return {
                                ...prev,
                                [color]: isTurningOff ? undefined : 'city',
                              };
                            })
                          }
                          disabled={player.cities <= 0}
                        >
                          Add City
                        </button>

                        <button
                          className={
                            selectedFlagshipBuilding[color] === 'starport'
                              ? 'selected-chip'
                              : ''
                          }
                          onClick={() =>
                            setSelectedFlagshipBuilding((prev) => {
                              const isTurningOff = prev[color] === 'starport';

                              playSound(isTurningOff ? 'panelClose' : 'panelOpen');

                              return {
                                ...prev,
                                [color]: isTurningOff ? undefined : 'starport',
                              };
                            })
                          }
                          disabled={player.starports <= 0}
                        >
                          Add Starport
                        </button>
                      </div>
                    </div>
                  )}
<div className="inline-controls grow">
  <label>Player</label>
  <input
    type="text"
    value={player.name ?? ''}
    onChange={(event) => updatePlayer(color, { name: event.target.value })}
    placeholder="Player name"
    style={{
      minWidth: '10rem',
      maxWidth: '14rem',
      textAlign: 'center',
    }}
  />
</div>
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
                      {fateOptions.map((fate) => {
                        const isPickedByAnotherPlayer =
                          fate !== '' &&
                          activePlayers.some(
                            (otherPlayer) =>
                              otherPlayer.color !== color && otherPlayer.fate === fate
                          );

                        return (
                          <option
                            key={fate}
                            value={fate}
                            disabled={isPickedByAnotherPlayer}
                          >
                            {fate === '' ? 'None' : fate}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                <div className="subsection">
  <strong>Favors</strong>
  <div className="favor-grid">
    {playerColors
      .filter((favorColor) => favorColor !== color)
      .filter((favorColor) => activePlayerColors.includes(favorColor))
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

                  <div className="subsection">
                    <strong>Player Cards</strong>
                    {(player.cards ?? []).length === 0 ? (
                      <p>No player cards.</p>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.75rem',
                          alignItems: 'flex-start',
                          marginTop: '0.6rem',
                        }}
                      >
                        {player.cards.map((card) => (
                          <div
                            key={card.id}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.35rem',
                              width: '7.9rem',
                            }}
                          >
                            <div className="card-picture-only">
                              <GameCardView card={card} size="small" />
                            </div>
                            <button
  onClick={() => {
    playSound('cardMove');
    scrapPlayerCardFromPlayer(color, card.id);
  }}
>
  Scrap
</button>

<button
  onClick={() => {
    playSound('cardMove');
    removePlayerCardFromPlayer(color, card.id);
  }}
>
  Remove
</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="subsection">
                    <strong>Allegiance</strong>
                    <div className="chip-row">
                      <button
                        className={player.allegiance === 'regent' ? 'selected-chip' : ''}
                        onClick={() => {
                          if (player.allegiance !== 'regent') {
                            playSound('panelOpen');
                          }

                          updatePlayer(player.color, { allegiance: 'regent' });
                        }}
                      >
                        Regent
                      </button>
                      <button
                        className={player.allegiance === 'outlaw' ? 'selected-chip' : ''}
                        onClick={() => {
                          if (player.allegiance !== 'outlaw') {
                            playSound('panelOpen');
                          }

                          updatePlayer(player.color, { allegiance: 'outlaw' });
                        }}
                      >
                        Outlaw
                      </button>
                    </div>
                  </div>

                  <div
  style={{
    display: 'flex',
    flexDirection: 'row',
    gap: '0.75rem',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  }}
>
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
                              <button onClick={() => changeResource(resource as ResourceType, -1)}>
                                -
                              </button>
                              <strong>{value}</strong>
                              <button onClick={() => changeResource(resource as ResourceType, 1)}>
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                 {gameSetup.optionalTokens.caretakersGolems && (
  <div className="subsection">
    <strong>Golems</strong>
    <div className="golem-grid">
      {golemTypes.map((golemType) => (
        <div className="golem-box" key={golemType}>
          <img
            className="resource-icon"
            src={golemImageByType[golemType]}
            alt={golemType}
          />
          <div>
            <button onClick={() => toggleGolem(golemType)}>
              {player.golems[golemType] ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

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
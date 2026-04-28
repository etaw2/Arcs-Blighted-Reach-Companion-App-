import { useGameStore } from '../gameStore';
import { playSound } from '../utils/sound';
import type { Building, PlayerColor, ShipColor } from '../gameState';

const shipColors: ShipColor[] = ['blue', 'red', 'yellow', 'white', 'imperial'];
const playerColors: PlayerColor[] = ['blue', 'red', 'yellow', 'white'];

const shipImageByColor: Record<ShipColor, string> = {
  blue: '/assets/arcs dev_player piece blue ship.png',
  red: '/assets/arcs dev_player piece red ship.png',
  yellow: '/assets/arcs dev_player piece yellow ship.png',
  white: '/assets/arcs dev_player piece white ship.png',
  imperial: '/assets/arcs dev_imperial ship.png',
};

const cityImageByColor: Record<PlayerColor | 'free', string> = {
  free: '/assets/arcs dev_free city.png',
  blue: '/assets/arcs dev_player piece blue city.png',
  red: '/assets/arcs dev_player piece red city.png',
  yellow: '/assets/arcs dev_player piece yellow city.png',
  white: '/assets/arcs dev_player piece white city.png',
};

const starportImageByColor: Record<PlayerColor | 'free', string> = {
  free: '/assets/arcs dev_free starport.png',
  blue: '/assets/arcs dev_player piece blue starport.png',
  red: '/assets/arcs dev_player piece red starport.png',
  yellow: '/assets/arcs dev_player piece yellow starport.png',
  white: '/assets/arcs dev_player piece white starport.png',
};

const flagshipImageByColor: Record<PlayerColor, string> = {
  blue: '/assets/arcs dev_player piece blue flagship.png',
  red: '/assets/arcs dev_player piece red flagship.png',
  yellow: '/assets/arcs dev_player piece yellow flagship.png',
  white: '/assets/arcs dev_player piece white flagship.png',
};

const blightImage = '/assets/arcs dev_punchboard blight front.png';
const bannerImage = '/assets/banner.png';
const brokenImage = '/assets/broken.png';
const portalImage = '/assets/portal.png';

export default function SelectedSpacePanel() {
  const selectedSpace = useGameStore((state) => state.selectedSpace);
  const map = useGameStore((state) => state.gameState.map);
  const players = useGameStore((state) => state.gameState.players);
  const gameSetup = useGameStore((state) => state.gameState.gameSetup);
  const clearSelection = useGameStore((state) => state.clearSelection);
  const addShipToGate = useGameStore((state) => state.addShipToGate);
  const removeShipFromGate = useGameStore((state) => state.removeShipFromGate);
  const changeGateBlight = useGameStore((state) => state.changeGateBlight);
  const toggleGateFlagship = useGameStore((state) => state.toggleGateFlagship);
  const setGatePort = useGameStore((state) => state.setGatePort);
  const setGateStation = useGameStore((state) => state.setGateStation);
  const toggleGateStationSeat = useGameStore((state) => state.toggleGateStationSeat);
  const addShipToPlanet = useGameStore((state) => state.addShipToPlanet);
  const removeShipFromPlanet = useGameStore((state) => state.removeShipFromPlanet);
  const changePlanetBlight = useGameStore((state) => state.changePlanetBlight);
  const togglePlanetFlagship = useGameStore((state) => state.togglePlanetFlagship);
  const addBuildingToPlanet = useGameStore((state) => state.addBuildingToPlanet);
  const removeBuildingFromPlanet = useGameStore((state) => state.removeBuildingFromPlanet);
  const setPlanetPortal = useGameStore((state) => state.setPlanetPortal);
  const setPlanetBanner = useGameStore((state) => state.setPlanetBanner);
  const setPlanetBroken = useGameStore((state) => state.setPlanetBroken);
  const setPlanetCloudCity = useGameStore((state) => state.setPlanetCloudCity);
  const setSeatOnCloudCity = useGameStore((state) => state.setSeatOnCloudCity);
  const setSeatOnBuilding = useGameStore((state) => state.setSeatOnBuilding);

  const activeFlagshipColors: PlayerColor[] = gameSetup.playersWithFlagships;

  if (!selectedSpace) {
    return (
      <aside className="panel">
        <h2>Selected Space</h2>
        <p>Click a gate or planet on the board to edit it.</p>
      </aside>
    );
  }

  if (selectedSpace.kind === 'gate') {
    const gate = map[selectedSpace.clusterId].gate;
    const gateSeatNumber = Number(selectedSpace.clusterId.replace('cluster', ''));

    return (
      <aside className="panel">
        <div className="panel-header">
          <h2>Gate {gate.number}</h2>
          <button className="ghost-button" onClick={() => { playSound('panelClose'); clearSelection(); }}>Close</button>
        </div>

        <p>{selectedSpace.clusterId}</p>

        <div className="counter-row">
          <span>
            <img className="space-token-icon" src={blightImage} alt="blight" /> {gate.blight}
          </span>
          <button onClick={() => { if (gate.blight > 0) playSound('tokenRemove'); changeGateBlight(selectedSpace.clusterId, -1); }}>-</button>
          <button onClick={() => { playSound('blightAdd'); changeGateBlight(selectedSpace.clusterId, 1); }}>+</button>
        </div>

        {activeFlagshipColors.length > 0 && (
          <div className="subsection">
            <strong>Flagships</strong>
            <div className="chip-row">
              {activeFlagshipColors.map((color) => {
                const isHere = gate.flagships.includes(color);

                return (
                  <button
                    key={color}
                    className={isHere ? 'selected-chip' : ''}
                    onClick={() => { playSound(isHere ? 'tokenRemove' : 'shipAdd'); toggleGateFlagship(selectedSpace.clusterId, color); }}
                  >
                    <img
                      className="space-token-icon"
                      src={flagshipImageByColor[color]}
                      alt={`${color} flagship`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {gameSetup.optionalStructures.gatePorts && (
          <div className="subsection">
            <strong>Gate Port</strong>

            {gate.port === null ? (
              <>
                <p>One starport may be placed on this gate.</p>
                <div className="chip-row">
                  {playerColors.map((color) => (
                    <button
                      key={`gate-port-${color}`}
                      onClick={() => { playSound('buildingAdd'); setGatePort(selectedSpace.clusterId, color); }}
                    >
                      <img
                        className="space-token-icon"
                        src={starportImageByColor[color]}
                        alt={`${color} gate port`}
                      />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="list-row">
                <span>
                  <img
                    className="space-token-icon"
                    src={starportImageByColor[gate.port.color as PlayerColor]}
                    alt={`${gate.port.color} gate port`}
                  />
                  Gate Port
                </span>

                <button onClick={() => { playSound('tokenRemove'); setGatePort(selectedSpace.clusterId, null); }}>
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {gameSetup.optionalStructures.gateStations && (
          <div className="subsection">
            <strong>Gate Station</strong>

            {gate.station === null ? (
              <>
                <p>One city may be placed on this gate.</p>
                <div className="chip-row">
                  {playerColors.map((color) => (
                    <button
                      key={`gate-station-${color}`}
                      onClick={() => { playSound('buildingAdd'); setGateStation(selectedSpace.clusterId, color); }}
                    >
                      <img
                        className="space-token-icon"
                        src={cityImageByColor[color]}
                        alt={`${color} gate station`}
                      />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="list-row">
                <span>
                  <img
                    className="space-token-icon"
                    src={cityImageByColor[gate.station.color as PlayerColor]}
                    alt={`${gate.station.color} gate station`}
                  />
                  Gate Station{gate.station.seat ? ` · Seat ${gate.station.seatNumber}` : ''}
                </span>

                <div className="chip-row">
                  <button
                    onClick={() => { playSound(gate.station?.seat ? 'tokenRemove' : 'seatAdd'); toggleGateStationSeat(selectedSpace.clusterId, !gate.station?.seat); }}
                  >
                    {gate.station.seat
                      ? `Remove Seat ${gateSeatNumber}`
                      : `Add Seat ${gateSeatNumber}`}
                  </button>

                  <button onClick={() => { playSound('tokenRemove'); setGateStation(selectedSpace.clusterId, null); }}>
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="subsection">
          <strong>Ships</strong>
          <div className="stacked-counter-list">
            {shipColors.map((color) => {
              const count = gate.ships.filter((ship) => ship.color === color).length;

              return (
                <div className="counter-row" key={color}>
                  <span>
                    <img
                      className="space-token-icon"
                      src={shipImageByColor[color]}
                      alt={`${color} ship`}
                    />{' '}
                    {count}
                  </span>
                  <button
                    onClick={() => {
                      const indexToRemove = gate.ships.findIndex((ship) => ship.color === color);
                      if (indexToRemove !== -1) {
                        playSound('tokenRemove');
                        removeShipFromGate(selectedSpace.clusterId, indexToRemove);
                      }
                    }}
                  >
                    -
                  </button>
                  <button onClick={() => { playSound('shipAdd'); addShipToGate(selectedSpace.clusterId, color); }}>
                    +
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    );
  }

  const planet = map[selectedSpace.clusterId][selectedSpace.planetKey];
  const seatNumber = Number(selectedSpace.clusterId.replace('cluster', ''));

  const addOwnedBuilding = (type: 'city' | 'starport', color: PlayerColor) => {
    const building: Building = {
      type,
      color,
      seat: false,
      seatNumber: null,
    };

    playSound('buildingAdd');
    addBuildingToPlanet(selectedSpace.clusterId, selectedSpace.planetKey, building);
  };

  const addFreeBuilding = (type: 'city' | 'starport') => {
    const building: Building = {
      type,
      color: 'free',
      seat: false,
      seatNumber: null,
    };

    playSound('buildingAdd');
    addBuildingToPlanet(selectedSpace.clusterId, selectedSpace.planetKey, building);
  };

  return (
    <aside className="panel">
      <div className="panel-header">
        <h2>
  Cluster {selectedSpace.clusterId.replace('cluster', '')} Planet{' '}
  {planet.id.split('_')[1]}
</h2>
        <button className="ghost-button" onClick={() => { playSound('panelClose'); clearSelection(); }}>Close</button>
      </div>

      <div className="counter-row">
        <span>
          <img className="space-token-icon" src={blightImage} alt="blight" /> {planet.blight}
        </span>
        <button onClick={() => { if (planet.blight > 0) playSound('tokenRemove'); changePlanetBlight(selectedSpace.clusterId, selectedSpace.planetKey, -1); }}>
          -
        </button>
        <button onClick={() => { playSound('blightAdd'); changePlanetBlight(selectedSpace.clusterId, selectedSpace.planetKey, 1); }}>
          +
        </button>
      </div>

      {activeFlagshipColors.length > 0 && (
        <div className="subsection">
          <strong>Flagships</strong>
          <div className="chip-row">
            {activeFlagshipColors.map((color) => {
              const isHere = planet.flagships.includes(color);

              return (
                <button
                  key={color}
                  className={isHere ? 'selected-chip' : ''}
                  onClick={() => { playSound(isHere ? 'tokenRemove' : 'shipAdd'); togglePlanetFlagship(selectedSpace.clusterId, selectedSpace.planetKey, color); }}
                >
                  <img
                    className="space-token-icon"
                    src={flagshipImageByColor[color]}
                    alt={`${color} flagship`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameSetup.optionalTokens.pathfindersPortal && (
        <div className="counter-row">
          <span>
            <img className="space-token-icon" src={portalImage} alt="portal" />{' '}
            {planet.portal ? 'Yes' : 'No'}
          </span>
          <button onClick={() => { playSound(planet.portal ? 'tokenRemove' : 'portalAdd'); setPlanetPortal(selectedSpace.clusterId, selectedSpace.planetKey, !planet.portal); }}>
            Toggle
          </button>
        </div>
      )}

      {gameSetup.optionalTokens.hegemonsBanner && (
        <div className="counter-row">
          <span>
            <img className="space-token-icon" src={bannerImage} alt="banner" />{' '}
            {planet.banner ? 'Yes' : 'No'}
          </span>
          <button onClick={() => { playSound(planet.banner ? 'tokenRemove' : 'bannerAdd'); setPlanetBanner(selectedSpace.clusterId, selectedSpace.planetKey, !planet.banner); }}>
            Toggle
          </button>
        </div>
      )}

      {gameSetup.optionalTokens.planetBreakersBroken && (
        <div className="counter-row">
          <span>
            <img className="space-token-icon" src={brokenImage} alt="broken" />{' '}
            {planet.broken ? 'Yes' : 'No'}
          </span>
          <button onClick={() => { playSound(planet.broken ? 'tokenRemove' : 'brokenAdd'); setPlanetBroken(selectedSpace.clusterId, selectedSpace.planetKey, !planet.broken); }}>
            Toggle
          </button>
        </div>
      )}

      {gameSetup.optionalStructures.cloudCities && (
        <div className="subsection">
          <strong>Cloud City</strong>

          {planet.cloudCity === null ? (
            <>
              <p>One cloud city may be placed in this planet system.</p>
              <div className="chip-row">
                {playerColors.map((color) => (
                  <button
                    key={`cloud-city-${color}`}
                    onClick={() => { playSound('buildingAdd'); setPlanetCloudCity(selectedSpace.clusterId, selectedSpace.planetKey, color); }}
                  >
                    <img
                      className="space-token-icon"
                      src={cityImageByColor[color]}
                      alt={`${color} cloud city`}
                    />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="list-row">
              <span>
  <img
    className="space-token-icon"
    src={cityImageByColor[planet.cloudCity.color]}
    alt={`${planet.cloudCity.color} cloud city`}
  />
</span>

              <div className="chip-row">
                {gameSetup.optionalTokens.foundersSeatTokens && (
  <button
    onClick={() => { playSound(planet.cloudCity?.seat ? 'tokenRemove' : 'seatAdd'); setSeatOnCloudCity(
        selectedSpace.clusterId,
        selectedSpace.planetKey,
        !planet.cloudCity?.seat
      ); }}
  >
    {planet.cloudCity.seat
      ? `Remove Seat ${seatNumber}`
      : `Add Seat ${seatNumber}`}
  </button>
)}

                <button
                  onClick={() => { playSound('tokenRemove'); setPlanetCloudCity(selectedSpace.clusterId, selectedSpace.planetKey, null); }}
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="subsection">
        <strong>Ships</strong>
        <div className="stacked-counter-list">
          {shipColors.map((color) => {
            const count = planet.ships.filter((ship) => ship.color === color).length;

            return (
              <div className="counter-row" key={color}>
                <span>
                  <img
                    className="space-token-icon"
                    src={shipImageByColor[color]}
                    alt={`${color} ship`}
                  />{' '}
                  {count}
                </span>
                <button
                  onClick={() => {
                    const indexToRemove = planet.ships.findIndex((ship) => ship.color === color);
                    if (indexToRemove !== -1) {
                      playSound('tokenRemove');
                      removeShipFromPlanet(selectedSpace.clusterId, selectedSpace.planetKey, indexToRemove);
                    }
                  }}
                >
                  -
                </button>
                <button
                  onClick={() => { playSound('shipAdd'); addShipToPlanet(selectedSpace.clusterId, selectedSpace.planetKey, color); }}
                >
                  +
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="subsection">
        <strong>Buildings ({planet.buildings.length}/{planet.buildingSpaces})</strong>

        <div style={{ marginBottom: '0.75rem' }}>
          <strong>Add free building</strong>
          <div className="chip-row">
            <button onClick={() => addFreeBuilding('city')}>
              <img
                className="space-token-icon"
                src={cityImageByColor.free}
                alt="free city"
              />
            </button>
            <button onClick={() => addFreeBuilding('starport')}>
              <img
                className="space-token-icon"
                src={starportImageByColor.free}
                alt="free starport"
              />
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
  <strong>Add city from player supply</strong>
  <div className="chip-row">
    {playerColors
      .filter((color) => !activeFlagshipColors.includes(color))
      .map((color) => (
        <button
          key={`city-${color}`}
          onClick={() => addOwnedBuilding('city', color)}
        >
          <img
            className="space-token-icon"
            src={cityImageByColor[color]}
            alt={`${color} city`}
          />
        </button>
      ))}
  </div>
</div>

        <div style={{ marginBottom: '0.75rem' }}>
  <strong>Add starport from player supply</strong>
  <div className="chip-row">
    {playerColors
      .filter((color) => !activeFlagshipColors.includes(color))
      .map((color) => (
        <button
          key={`starport-${color}`}
          onClick={() => addOwnedBuilding('starport', color)}
        >
          <img
            className="space-token-icon"
            src={starportImageByColor[color]}
            alt={`${color} starport`}
          />
        </button>
      ))}
  </div>
</div>

        {planet.buildings.length === 0 ? (
          <p>No buildings.</p>
        ) : (
          planet.buildings.map((building, index) => (
            <div className="list-row" key={`${building.color}-${building.type}-${index}`}>
              <span>
                <img
                  className="space-token-icon"
                  src={
                    building.type === 'city'
                      ? cityImageByColor[building.color as PlayerColor | 'free']
                      : starportImageByColor[building.color as PlayerColor | 'free']
                  }
                  alt={`${building.color} ${building.type}`}
                />
              </span>

              <div className="chip-row">
                {gameSetup.optionalTokens.foundersSeatTokens &&
  building.type === 'city' &&
  building.color !== 'free' && (
                  <button
                    onClick={() => { playSound(building.seat ? 'tokenRemove' : 'seatAdd'); setSeatOnBuilding(
                        selectedSpace.clusterId,
                        selectedSpace.planetKey,
                        index,
                        !building.seat
                      ); }}
                  >
                    {building.seat ? `Remove Seat ${seatNumber}` : `Add Seat ${seatNumber}`}
                  </button>
                )}

                <button onClick={() => { playSound('tokenRemove'); removeBuildingFromPlanet(selectedSpace.clusterId, selectedSpace.planetKey, index); }}>
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
import { useGameStore } from '../gameStore';
import type { Building, PlayerColor, ShipColor } from '../gameState';

const shipColors: ShipColor[] = ['blue', 'red', 'yellow', 'white', 'imperial'];
const playerColors: PlayerColor[] = ['blue', 'red', 'yellow', 'white'];

export default function SelectedSpacePanel() {
  const selectedSpace = useGameStore((state) => state.selectedSpace);
  const map = useGameStore((state) => state.gameState.map);
  const players = useGameStore((state) => state.gameState.players);
  const clearSelection = useGameStore((state) => state.clearSelection);
  const addShipToGate = useGameStore((state) => state.addShipToGate);
  const removeShipFromGate = useGameStore((state) => state.removeShipFromGate);
  const changeGateBlight = useGameStore((state) => state.changeGateBlight);
  const toggleGateFlagship = useGameStore((state) => state.toggleGateFlagship);
  const addShipToPlanet = useGameStore((state) => state.addShipToPlanet);
  const removeShipFromPlanet = useGameStore((state) => state.removeShipFromPlanet);
  const changePlanetBlight = useGameStore((state) => state.changePlanetBlight);
  const togglePlanetFlagship = useGameStore((state) => state.togglePlanetFlagship);
  const addBuildingToPlanet = useGameStore((state) => state.addBuildingToPlanet);
  const removeBuildingFromPlanet = useGameStore((state) => state.removeBuildingFromPlanet);
  const setPlanetPortal = useGameStore((state) => state.setPlanetPortal);
  const setPlanetBanner = useGameStore((state) => state.setPlanetBanner);
  const setPlanetBroken = useGameStore((state) => state.setPlanetBroken);

  const activeFlagshipColors: PlayerColor[] = players
    .filter((player) => player.flagship)
    .map((player) => player.color);

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

    return (
      <aside className="panel">
        <div className="panel-header">
          <h2>Gate {gate.number}</h2>
          <button className="ghost-button" onClick={clearSelection}>Close</button>
        </div>

        <p>{selectedSpace.clusterId}</p>

        <div className="counter-row">
          <span>Blight: {gate.blight}</span>
          <button onClick={() => changeGateBlight(selectedSpace.clusterId, -1)}>-</button>
          <button onClick={() => changeGateBlight(selectedSpace.clusterId, 1)}>+</button>
        </div>

        <div className="subsection">
          <strong>Flagships</strong>
          {activeFlagshipColors.length === 0 ? (
            <p>No active flagships.</p>
          ) : (
            <div className="chip-row">
              {activeFlagshipColors.map((color) => {
                const isHere = gate.flagships.includes(color);

                return (
                  <button
                    key={color}
                    className={isHere ? 'selected-chip' : ''}
                    onClick={() => toggleGateFlagship(selectedSpace.clusterId, color)}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="subsection">
          <strong>Add ship</strong>
          <div className="chip-row">
            {shipColors.map((color) => (
              <button key={color} onClick={() => addShipToGate(selectedSpace.clusterId, color)}>
                {color}
              </button>
            ))}
          </div>
        </div>

        <div className="subsection">
          <strong>Ships</strong>
          {gate.ships.length === 0 ? (
            <p>No ships.</p>
          ) : (
            gate.ships.map((ship, index) => (
              <div className="list-row" key={`${ship.color}-${index}`}>
                <span>{ship.color}</span>
                <button onClick={() => removeShipFromGate(selectedSpace.clusterId, index)}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    );
  }

  const planet = map[selectedSpace.clusterId][selectedSpace.planetKey];

  const addOwnedBuilding = (type: 'city' | 'starport', color: PlayerColor) => {
    const building: Building = {
      type,
      color,
      seat: false,
      seatNumber: null,
    };

    addBuildingToPlanet(selectedSpace.clusterId, selectedSpace.planetKey, building);
  };

  const addFreeBuilding = (type: 'city' | 'starport') => {
    const building: Building = {
      type,
      color: 'free',
      seat: false,
      seatNumber: null,
    };

    addBuildingToPlanet(selectedSpace.clusterId, selectedSpace.planetKey, building);
  };

  return (
    <aside className="panel">
      <div className="panel-header">
        <h2>{planet.id}</h2>
        <button className="ghost-button" onClick={clearSelection}>Close</button>
      </div>

      <p>{selectedSpace.clusterId} · {planet.slot} · {planet.resource}</p>

      <div className="counter-row">
        <span>Blight: {planet.blight}</span>
        <button onClick={() => changePlanetBlight(selectedSpace.clusterId, selectedSpace.planetKey, -1)}>
          -
        </button>
        <button onClick={() => changePlanetBlight(selectedSpace.clusterId, selectedSpace.planetKey, 1)}>
          +
        </button>
      </div>

      <div className="subsection">
        <strong>Flagships</strong>
        {activeFlagshipColors.length === 0 ? (
          <p>No active flagships.</p>
        ) : (
          <div className="chip-row">
            {activeFlagshipColors.map((color) => {
              const isHere = planet.flagships.includes(color);

              return (
                <button
                  key={color}
                  className={isHere ? 'selected-chip' : ''}
                  onClick={() =>
                    togglePlanetFlagship(selectedSpace.clusterId, selectedSpace.planetKey, color)
                  }
                >
                  {color}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="counter-row">
        <span>Portal: {planet.portal ? 'Yes' : 'No'}</span>
        <button onClick={() => setPlanetPortal(selectedSpace.clusterId, selectedSpace.planetKey, !planet.portal)}>
          Toggle
        </button>
      </div>

      <div className="counter-row">
        <span>Banner: {planet.banner ? 'Yes' : 'No'}</span>
        <button onClick={() => setPlanetBanner(selectedSpace.clusterId, selectedSpace.planetKey, !planet.banner)}>
          Toggle
        </button>
      </div>

      <div className="counter-row">
        <span>Broken: {planet.broken ? 'Yes' : 'No'}</span>
        <button onClick={() => setPlanetBroken(selectedSpace.clusterId, selectedSpace.planetKey, !planet.broken)}>
          Toggle
        </button>
      </div>

      <div className="subsection">
        <strong>Add ship</strong>
        <div className="chip-row">
          {shipColors.map((color) => (
            <button
              key={color}
              onClick={() => addShipToPlanet(selectedSpace.clusterId, selectedSpace.planetKey, color)}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div className="subsection">
        <strong>Ships</strong>
        {planet.ships.length === 0 ? (
          <p>No ships.</p>
        ) : (
          planet.ships.map((ship, index) => (
            <div className="list-row" key={`${ship.color}-${index}`}>
              <span>{ship.color}</span>
              <button onClick={() => removeShipFromPlanet(selectedSpace.clusterId, selectedSpace.planetKey, index)}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <div className="subsection">
  <strong>Buildings ({planet.buildings.length}/{planet.buildingSpaces})</strong>

  <div style={{ marginBottom: '0.75rem' }}>
    <strong>Add free building</strong>
    <div className="chip-row">
      <button onClick={() => addFreeBuilding('city')}>Add free city</button>
      <button onClick={() => addFreeBuilding('starport')}>Add free starport</button>
    </div>
  </div>

  <div style={{ marginBottom: '0.75rem' }}>
    <strong>Add city from player supply</strong>
    <div className="chip-row">
      {playerColors.map((color) => (
        <button
          key={`city-${color}`}
          onClick={() => addOwnedBuilding('city', color)}
        >
          {color}
        </button>
      ))}
    </div>
  </div>

  <div style={{ marginBottom: '0.75rem' }}>
    <strong>Add starport from player supply</strong>
    <div className="chip-row">
      {playerColors.map((color) => (
        <button
          key={`starport-${color}`}
          onClick={() => addOwnedBuilding('starport', color)}
        >
          {color}
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
                {building.color} {building.type}
              </span>
              <button onClick={() => removeBuildingFromPlanet(selectedSpace.clusterId, selectedSpace.planetKey, index)}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
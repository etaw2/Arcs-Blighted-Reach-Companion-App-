import { create } from 'zustand';
import {
  type ActionCard,
  type Building,
  type BuildingType,
  type ClusterId,
  type FlagshipBoardSlotType,
  type FlagshipUpgradeId,
  type CourtCard,
  type GameSetup,
  type GameState,
  type PlanetKey,
  type PlayerCard,
  type PlayerColor,
  type PlayerState,
  type ResourceInventory,
  type RuleCard,
  type RuleCollection,
  type SaveGameNumber,
  type ShipColor,
  createEmptyFlagshipBoard,
  createInitialGameState,
  defaultGameSetup,
} from './gameState';

const applyInitiativeRules = (players: PlayerState[]): PlayerState[] => {
  const highestPower = Math.max(...players.map((player) => player.power));
  const leaders = players.filter((player) => player.power === highestPower);

  if (leaders.length === 1) {
    const leaderColor = leaders[0].color;

    return players.map((player) => ({
      ...player,
      initiative: player.color === leaderColor,
    }));
  }

  return players;
};

const getClusterSeatNumber = (clusterId: ClusterId): number =>
  Number(clusterId.replace('cluster', ''));

const normalizeGameSetup = (gameSetup?: Partial<GameSetup>): GameSetup => ({
  setupComplete: gameSetup?.setupComplete ?? defaultGameSetup.setupComplete,
  playersInGame: gameSetup?.playersInGame ?? defaultGameSetup.playersInGame,
  playersWithFlagships:
    gameSetup?.playersWithFlagships ?? defaultGameSetup.playersWithFlagships,
  optionalTokens: {
    ...defaultGameSetup.optionalTokens,
    ...gameSetup?.optionalTokens,
  },
  optionalStructures: {
    ...defaultGameSetup.optionalStructures,
    ...gameSetup?.optionalStructures,
  },
});

const clearSeatsFromMap = (map: GameState['map']): GameState['map'] =>
  Object.fromEntries(
    Object.entries(map).map(([clusterId, cluster]) => [
      clusterId,
      {
        ...cluster,
        gate: {
          ...cluster.gate,
          station: cluster.gate.station
            ? {
                ...cluster.gate.station,
                seat: false,
                seatNumber: null,
              }
            : null,
        },
        planetTri: {
          ...cluster.planetTri,
          cloudCity: cluster.planetTri.cloudCity
            ? {
                ...cluster.planetTri.cloudCity,
                seat: false,
                seatNumber: null,
              }
            : null,
          buildings: cluster.planetTri.buildings.map((building) => ({
            ...building,
            seat: false,
            seatNumber: null,
          })),
        },
        planetMoon: {
          ...cluster.planetMoon,
          cloudCity: cluster.planetMoon.cloudCity
            ? {
                ...cluster.planetMoon.cloudCity,
                seat: false,
                seatNumber: null,
              }
            : null,
          buildings: cluster.planetMoon.buildings.map((building) => ({
            ...building,
            seat: false,
            seatNumber: null,
          })),
        },
        planetHex: {
          ...cluster.planetHex,
          cloudCity: cluster.planetHex.cloudCity
            ? {
                ...cluster.planetHex.cloudCity,
                seat: false,
                seatNumber: null,
              }
            : null,
          buildings: cluster.planetHex.buildings.map((building) => ({
            ...building,
            seat: false,
            seatNumber: null,
          })),
        },
      },
    ])
  ) as GameState['map'];

const removeFlagshipColorFromMap = (
  map: GameState['map'],
  color: PlayerColor
): GameState['map'] => ({
  cluster1: {
    ...map.cluster1,
    gate: {
      ...map.cluster1.gate,
      flagships: map.cluster1.gate.flagships.filter((entry) => entry !== color),
    },
    planetTri: {
      ...map.cluster1.planetTri,
      flagships: map.cluster1.planetTri.flagships.filter((entry) => entry !== color),
    },
    planetMoon: {
      ...map.cluster1.planetMoon,
      flagships: map.cluster1.planetMoon.flagships.filter((entry) => entry !== color),
    },
    planetHex: {
      ...map.cluster1.planetHex,
      flagships: map.cluster1.planetHex.flagships.filter((entry) => entry !== color),
    },
  },
  cluster2: {
    ...map.cluster2,
    gate: {
      ...map.cluster2.gate,
      flagships: map.cluster2.gate.flagships.filter((entry) => entry !== color),
    },
    planetTri: {
      ...map.cluster2.planetTri,
      flagships: map.cluster2.planetTri.flagships.filter((entry) => entry !== color),
    },
    planetMoon: {
      ...map.cluster2.planetMoon,
      flagships: map.cluster2.planetMoon.flagships.filter((entry) => entry !== color),
    },
    planetHex: {
      ...map.cluster2.planetHex,
      flagships: map.cluster2.planetHex.flagships.filter((entry) => entry !== color),
    },
  },
  cluster3: {
    ...map.cluster3,
    gate: {
      ...map.cluster3.gate,
      flagships: map.cluster3.gate.flagships.filter((entry) => entry !== color),
    },
    planetTri: {
      ...map.cluster3.planetTri,
      flagships: map.cluster3.planetTri.flagships.filter((entry) => entry !== color),
    },
    planetMoon: {
      ...map.cluster3.planetMoon,
      flagships: map.cluster3.planetMoon.flagships.filter((entry) => entry !== color),
    },
    planetHex: {
      ...map.cluster3.planetHex,
      flagships: map.cluster3.planetHex.flagships.filter((entry) => entry !== color),
    },
  },
  cluster4: {
    ...map.cluster4,
    gate: {
      ...map.cluster4.gate,
      flagships: map.cluster4.gate.flagships.filter((entry) => entry !== color),
    },
    planetTri: {
      ...map.cluster4.planetTri,
      flagships: map.cluster4.planetTri.flagships.filter((entry) => entry !== color),
    },
    planetMoon: {
      ...map.cluster4.planetMoon,
      flagships: map.cluster4.planetMoon.flagships.filter((entry) => entry !== color),
    },
    planetHex: {
      ...map.cluster4.planetHex,
      flagships: map.cluster4.planetHex.flagships.filter((entry) => entry !== color),
    },
  },
  cluster5: {
    ...map.cluster5,
    gate: {
      ...map.cluster5.gate,
      flagships: map.cluster5.gate.flagships.filter((entry) => entry !== color),
    },
    planetTri: {
      ...map.cluster5.planetTri,
      flagships: map.cluster5.planetTri.flagships.filter((entry) => entry !== color),
    },
    planetMoon: {
      ...map.cluster5.planetMoon,
      flagships: map.cluster5.planetMoon.flagships.filter((entry) => entry !== color),
    },
    planetHex: {
      ...map.cluster5.planetHex,
      flagships: map.cluster5.planetHex.flagships.filter((entry) => entry !== color),
    },
  },
  cluster6: {
    ...map.cluster6,
    gate: {
      ...map.cluster6.gate,
      flagships: map.cluster6.gate.flagships.filter((entry) => entry !== color),
    },
    planetTri: {
      ...map.cluster6.planetTri,
      flagships: map.cluster6.planetTri.flagships.filter((entry) => entry !== color),
    },
    planetMoon: {
      ...map.cluster6.planetMoon,
      flagships: map.cluster6.planetMoon.flagships.filter((entry) => entry !== color),
    },
    planetHex: {
      ...map.cluster6.planetHex,
      flagships: map.cluster6.planetHex.flagships.filter((entry) => entry !== color),
    },
  },
});

interface GameStore {
  gameState: GameState;
  selectedSpace:
    | { kind: 'gate'; clusterId: ClusterId }
    | { kind: 'planet'; clusterId: ClusterId; planetKey: PlanetKey }
    | null;

  resetGame: () => void;
  setGameState: (gameState: GameState) => void;
  setGameNumber: (gameNumber: SaveGameNumber) => void;
  updateGameSetup: (updates: Partial<GameSetup>) => void;
  setSetupComplete: (setupComplete: boolean) => void;
  setInitiative: (color: PlayerColor) => void;
  selectGate: (clusterId: ClusterId) => void;
  selectPlanet: (clusterId: ClusterId, planetKey: PlanetKey) => void;
  clearSelection: () => void;

  addShipToGate: (clusterId: ClusterId, color: ShipColor) => void;
  removeShipFromGate: (clusterId: ClusterId, shipIndex: number) => void;
  changeGateBlight: (clusterId: ClusterId, delta: number) => void;
  toggleGateFlagship: (clusterId: ClusterId, color: PlayerColor) => void;
  setGatePort: (clusterId: ClusterId, color: PlayerColor | null) => void;
  setGateStation: (clusterId: ClusterId, color: PlayerColor | null) => void;
  toggleGateStationSeat: (clusterId: ClusterId, seat: boolean) => void;

  addShipToPlanet: (clusterId: ClusterId, planetKey: PlanetKey, color: ShipColor) => void;
  removeShipFromPlanet: (clusterId: ClusterId, planetKey: PlanetKey, shipIndex: number) => void;
  changePlanetBlight: (clusterId: ClusterId, planetKey: PlanetKey, delta: number) => void;
  togglePlanetFlagship: (clusterId: ClusterId, planetKey: PlanetKey, color: PlayerColor) => void;
  addBuildingToPlanet: (clusterId: ClusterId, planetKey: PlanetKey, building: Building) => boolean;
  removeBuildingFromPlanet: (clusterId: ClusterId, planetKey: PlanetKey, buildingIndex: number) => void;
  setPlanetPortal: (clusterId: ClusterId, planetKey: PlanetKey, portal: boolean) => void;
  setPlanetBanner: (clusterId: ClusterId, planetKey: PlanetKey, banner: boolean) => void;
  setPlanetBroken: (clusterId: ClusterId, planetKey: PlanetKey, broken: boolean) => void;
  setPlanetCloudCity: (clusterId: ClusterId, planetKey: PlanetKey, color: PlayerColor | null) => void;
  setSeatOnCloudCity: (clusterId: ClusterId, planetKey: PlanetKey, seat: boolean) => void;
  setSeatOnBuilding: (
    clusterId: ClusterId,
    planetKey: PlanetKey,
    buildingIndex: number,
    seat: boolean
  ) => void;

  addCourtCardToDeck: (card: CourtCard) => void;
  removeCourtCardFromDeck: (cardId: string) => void;
  scrapCourtCard: (cardId: string) => void;
  addRuleCard: (collection: RuleCollection, card: RuleCard) => void;
  removeRuleCard: (collection: RuleCollection, cardId: string) => void;
  scrapRuleCard: (collection: RuleCollection, cardId: string) => void;
  addActionCardToDeck: (card: ActionCard) => void;
  removeActionCardFromDeck: (cardId: string) => void;
  scrapActionCard: (cardId: string) => void;

  addPlayer: (player: PlayerState) => void;
  removePlayer: (color: PlayerColor) => void;
    updatePlayerResources: (color: PlayerColor, resourceUpdates: Partial<ResourceInventory>) => void;
  placeFlagshipBoardBuilding: (
    color: PlayerColor,
    upgradeId: FlagshipUpgradeId,
    slotType: FlagshipBoardSlotType,
    buildingType: BuildingType
  ) => void;
  removeFlagshipBoardBuilding: (
    color: PlayerColor,
    upgradeId: FlagshipUpgradeId,
    slotType: FlagshipBoardSlotType
  ) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: createInitialGameState(1),
  selectedSpace: null,

  resetGame: () =>
    set((state) => ({
      gameState: createInitialGameState(state.gameState.gameNumber),
      selectedSpace: null,
    })),

  setGameState: (gameState) =>
    set({
      gameState: {
        ...gameState,
        gameSetup: normalizeGameSetup(gameState.gameSetup),
      },
    }),

  setGameNumber: (gameNumber) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        gameNumber,
      },
    })),

  updateGameSetup: (updates) =>
    set((state) => {
      const nextGameSetup = normalizeGameSetup({
        ...state.gameState.gameSetup,
        ...updates,
        optionalTokens: {
          ...state.gameState.gameSetup.optionalTokens,
          ...updates.optionalTokens,
        },
        optionalStructures: {
          ...state.gameState.gameSetup.optionalStructures,
          ...updates.optionalStructures,
        },
      });

      return {
        gameState: {
          ...state.gameState,
          gameSetup: nextGameSetup,
          map: nextGameSetup.optionalTokens.foundersSeatTokens
            ? state.gameState.map
            : clearSeatsFromMap(state.gameState.map),
        },
      };
    }),

  setSetupComplete: (setupComplete) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        gameSetup: {
          ...state.gameState.gameSetup,
          setupComplete,
        },
      },
    })),

  setInitiative: (color) =>
    set((state) => {
      const highestPower = Math.max(...state.gameState.players.map((player) => player.power));
      const leaders = state.gameState.players.filter((player) => player.power === highestPower);

      if (!leaders.some((player) => player.color === color)) {
        return state;
      }

      if (leaders.length <= 1) {
        return {
          gameState: {
            ...state.gameState,
            players: applyInitiativeRules(state.gameState.players),
          },
        };
      }

      return {
        gameState: {
          ...state.gameState,
          players: state.gameState.players.map((player) => ({
            ...player,
            initiative: player.color === color,
          })),
        },
      };
    }),

  selectGate: (clusterId) => set({ selectedSpace: { kind: 'gate', clusterId } }),

  selectPlanet: (clusterId, planetKey) =>
    set({ selectedSpace: { kind: 'planet', clusterId, planetKey } }),

  clearSelection: () => set({ selectedSpace: null }),

  addShipToGate: (clusterId, color) =>
    set((state) => {
      if (color !== 'imperial') {
        const owner = state.gameState.players.find((player) => player.color === color);

        if (!owner || owner.ships <= 0) {
          return state;
        }
      }

      return {
        gameState: {
          ...state.gameState,
          map: {
            ...state.gameState.map,
            [clusterId]: {
              ...state.gameState.map[clusterId],
              gate: {
                ...state.gameState.map[clusterId].gate,
                ships: [...state.gameState.map[clusterId].gate.ships, { color }],
              },
            },
          },
          players:
            color === 'imperial'
              ? state.gameState.players
              : state.gameState.players.map((player) =>
                  player.color === color ? { ...player, ships: player.ships - 1 } : player
                ),
        },
      };
    }),

  removeShipFromGate: (clusterId, shipIndex) =>
    set((state) => {
      const removedShip = state.gameState.map[clusterId].gate.ships[shipIndex];

      if (!removedShip) {
        return state;
      }

      return {
        gameState: {
          ...state.gameState,
          map: {
            ...state.gameState.map,
            [clusterId]: {
              ...state.gameState.map[clusterId],
              gate: {
                ...state.gameState.map[clusterId].gate,
                ships: state.gameState.map[clusterId].gate.ships.filter((_, index) => index !== shipIndex),
              },
            },
          },
          players:
            removedShip.color === 'imperial'
              ? state.gameState.players
              : state.gameState.players.map((player) =>
                  player.color === removedShip.color
                    ? { ...player, ships: player.ships + 1 }
                    : player
                ),
        },
      };
    }),

  changeGateBlight: (clusterId, delta) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        map: {
          ...state.gameState.map,
          [clusterId]: {
            ...state.gameState.map[clusterId],
            gate: {
              ...state.gameState.map[clusterId].gate,
              blight: Math.max(0, state.gameState.map[clusterId].gate.blight + delta),
            },
          },
        },
      },
    })),

  toggleGateFlagship: (clusterId, color) =>
    set((state) => {
      const gate = state.gameState.map[clusterId].gate;
      const hasFlagshipInTarget = gate.flagships.includes(color);
      const nextMap = removeFlagshipColorFromMap(state.gameState.map, color);

      return {
        gameState: {
          ...state.gameState,
          map: {
            ...nextMap,
            [clusterId]: {
              ...nextMap[clusterId],
              gate: {
                ...nextMap[clusterId].gate,
                flagships: hasFlagshipInTarget
                  ? nextMap[clusterId].gate.flagships
                  : [...nextMap[clusterId].gate.flagships, color],
              },
            },
          },
        },
      };
    }),

  setGatePort: (clusterId, color) =>
    set((state) => {
      if (!state.gameState.gameSetup.optionalStructures.gatePorts) {
        return state;
      }

      const cluster = state.gameState.map[clusterId];
      const gate = cluster.gate;

      if (color === null) {
        const removedPort = gate.port;

        if (!removedPort || removedPort.color === 'free') {
          return state;
        }

        return {
          gameState: {
            ...state.gameState,
            players: state.gameState.players.map((player) =>
              player.color === removedPort.color
                ? { ...player, starports: player.starports + 1 }
                : player
            ),
            map: {
              ...state.gameState.map,
              [clusterId]: {
                ...cluster,
                gate: {
                  ...gate,
                  port: null,
                },
              },
            },
          },
        };
      }

      if (gate.port !== null) {
        return state;
      }

      const owner = state.gameState.players.find((player) => player.color === color);

      if (!owner || owner.starports <= 0) {
        return state;
      }

      return {
        gameState: {
          ...state.gameState,
          players: state.gameState.players.map((player) =>
            player.color === color ? { ...player, starports: player.starports - 1 } : player
          ),
          map: {
            ...state.gameState.map,
            [clusterId]: {
              ...cluster,
              gate: {
                ...gate,
                port: {
                  type: 'starport',
                  color,
                  seat: false,
                  seatNumber: null,
                },
              },
            },
          },
        },
      };
    }),

  setGateStation: (clusterId, color) =>
    set((state) => {
      if (!state.gameState.gameSetup.optionalStructures.gateStations) {
        return state;
      }

      const cluster = state.gameState.map[clusterId];
      const gate = cluster.gate;

      if (color === null) {
        const removedStation = gate.station;

        if (!removedStation || removedStation.color === 'free') {
          return state;
        }

        return {
          gameState: {
            ...state.gameState,
            players: state.gameState.players.map((player) =>
              player.color === removedStation.color
                ? { ...player, cities: player.cities + 1 }
                : player
            ),
            map: {
              ...state.gameState.map,
              [clusterId]: {
                ...cluster,
                gate: {
                  ...gate,
                  station: null,
                },
              },
            },
          },
        };
      }

      if (gate.station !== null) {
        return state;
      }

      const owner = state.gameState.players.find((player) => player.color === color);

      if (!owner || owner.cities <= 0) {
        return state;
      }

      return {
        gameState: {
          ...state.gameState,
          players: state.gameState.players.map((player) =>
            player.color === color ? { ...player, cities: player.cities - 1 } : player
          ),
          map: {
            ...state.gameState.map,
            [clusterId]: {
              ...cluster,
              gate: {
                ...gate,
                station: {
                  type: 'city',
                  color,
                  seat: false,
                  seatNumber: null,
                },
              },
            },
          },
        },
      };
    }),

  toggleGateStationSeat: (clusterId, seat) =>
    set((state) => {
      if (!state.gameState.gameSetup.optionalTokens.foundersSeatTokens) {
        return state;
      }

      const cluster = state.gameState.map[clusterId];

      if (!cluster.gate.station) {
        return state;
      }

      const seatNumber = getClusterSeatNumber(clusterId);

      const updatedCluster = {
        ...cluster,
        gate: {
          ...cluster.gate,
          station: {
            ...cluster.gate.station,
            seat,
            seatNumber: seat ? seatNumber : null,
          },
        },
        planetTri: {
          ...cluster.planetTri,
          cloudCity: cluster.planetTri.cloudCity
            ? {
                ...cluster.planetTri.cloudCity,
                seat: false,
                seatNumber: null,
              }
            : null,
          buildings: cluster.planetTri.buildings.map((building) => ({
            ...building,
            seat: false,
            seatNumber: null,
          })),
        },
        planetMoon: {
          ...cluster.planetMoon,
          cloudCity: cluster.planetMoon.cloudCity
            ? {
                ...cluster.planetMoon.cloudCity,
                seat: false,
                seatNumber: null,
              }
            : null,
          buildings: cluster.planetMoon.buildings.map((building) => ({
            ...building,
            seat: false,
            seatNumber: null,
          })),
        },
        planetHex: {
          ...cluster.planetHex,
          cloudCity: cluster.planetHex.cloudCity
            ? {
                ...cluster.planetHex.cloudCity,
                seat: false,
                seatNumber: null,
              }
            : null,
          buildings: cluster.planetHex.buildings.map((building) => ({
            ...building,
            seat: false,
            seatNumber: null,
          })),
        },
      };

      return {
        gameState: {
          ...state.gameState,
          map: {
            ...state.gameState.map,
            [clusterId]: updatedCluster,
          },
        },
      };
    }),

  addShipToPlanet: (clusterId, planetKey, color) =>
    set((state) => {
      if (color !== 'imperial') {
        const owner = state.gameState.players.find((player) => player.color === color);

        if (!owner || owner.ships <= 0) {
          return state;
        }
      }

      return {
        gameState: {
          ...state.gameState,
          map: {
            ...state.gameState.map,
            [clusterId]: {
              ...state.gameState.map[clusterId],
              [planetKey]: {
                ...state.gameState.map[clusterId][planetKey],
                ships: [...state.gameState.map[clusterId][planetKey].ships, { color }],
              },
            },
          },
          players:
            color === 'imperial'
              ? state.gameState.players
              : state.gameState.players.map((player) =>
                  player.color === color ? { ...player, ships: player.ships - 1 } : player
                ),
        },
      };
    }),

  removeShipFromPlanet: (clusterId, planetKey, shipIndex) =>
    set((state) => {
      const removedShip = state.gameState.map[clusterId][planetKey].ships[shipIndex];

      if (!removedShip) {
        return state;
      }

      return {
        gameState: {
          ...state.gameState,
          map: {
            ...state.gameState.map,
            [clusterId]: {
              ...state.gameState.map[clusterId],
              [planetKey]: {
                ...state.gameState.map[clusterId][planetKey],
                ships: state.gameState.map[clusterId][planetKey].ships.filter((_, index) => index !== shipIndex),
              },
            },
          },
          players:
            removedShip.color === 'imperial'
              ? state.gameState.players
              : state.gameState.players.map((player) =>
                  player.color === removedShip.color
                    ? { ...player, ships: player.ships + 1 }
                    : player
                ),
        },
      };
    }),

  changePlanetBlight: (clusterId, planetKey, delta) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        map: {
          ...state.gameState.map,
          [clusterId]: {
            ...state.gameState.map[clusterId],
            [planetKey]: {
              ...state.gameState.map[clusterId][planetKey],
              blight: Math.max(0, state.gameState.map[clusterId][planetKey].blight + delta),
            },
          },
        },
      },
    })),

  togglePlanetFlagship: (clusterId, planetKey, color) =>
    set((state) => {
      const planet = state.gameState.map[clusterId][planetKey];
      const hasFlagshipInTarget = planet.flagships.includes(color);
      const nextMap = removeFlagshipColorFromMap(state.gameState.map, color);

      return {
        gameState: {
          ...state.gameState,
          map: {
            ...nextMap,
            [clusterId]: {
              ...nextMap[clusterId],
              [planetKey]: {
                ...nextMap[clusterId][planetKey],
                flagships: hasFlagshipInTarget
                  ? nextMap[clusterId][planetKey].flagships
                  : [...nextMap[clusterId][planetKey].flagships, color],
              },
            },
          },
        },
      };
    }),

    addBuildingToPlanet: (clusterId, planetKey, building) => {
    let added = false;

    set((state) => {
      const planet = state.gameState.map[clusterId][planetKey];

      if (planet.broken) {
        return state;
      }

      if (planet.buildings.length >= planet.buildingSpaces) {
        return state;
      }

      if (
        building.color !== 'free' &&
        state.gameState.gameSetup.playersWithFlagships.includes(building.color)
      ) {
        return state;
      }

      const owningPlayer =
        building.color === 'free'
          ? null
          : state.gameState.players.find((player) => player.color === building.color);

      if (building.type === 'city' && building.color !== 'free') {
        if (!owningPlayer || owningPlayer.cities <= 0) {
          return state;
        }
      }

      if (building.type === 'starport' && building.color !== 'free') {
        if (!owningPlayer || owningPlayer.starports <= 0) {
          return state;
        }
      }

      const updatedPlayers =
        building.color === 'free'
          ? state.gameState.players
          : state.gameState.players.map((player) => {
              if (player.color !== building.color) {
                return player;
              }

              if (building.type === 'city') {
                return {
                  ...player,
                  cities: player.cities - 1,
                };
              }

              if (building.type === 'starport') {
                return {
                  ...player,
                  starports: player.starports - 1,
                };
              }

              return player;
            });

      added = true;

      return {
        gameState: {
          ...state.gameState,
          players: updatedPlayers,
          map: {
            ...state.gameState.map,
            [clusterId]: {
              ...state.gameState.map[clusterId],
              [planetKey]: {
                ...planet,
                buildings: [...planet.buildings, building],
              },
            },
          },
        },
      };
    });

    return added;
  },

  removeBuildingFromPlanet: (clusterId, planetKey, buildingIndex) =>
    set((state) => {
      const planet = state.gameState.map[clusterId][planetKey];
      const removedBuilding = planet.buildings[buildingIndex];

      if (!removedBuilding) {
        return state;
      }

      return {
        gameState: {
          ...state.gameState,
          map: {
            ...state.gameState.map,
            [clusterId]: {
              ...state.gameState.map[clusterId],
              [planetKey]: {
                ...planet,
                buildings: planet.buildings.filter((_, index) => index !== buildingIndex),
              },
            },
          },
          players:
            removedBuilding.color === 'free'
              ? state.gameState.players
              : state.gameState.players.map((player) => {
                  if (player.color !== removedBuilding.color) {
                    return player;
                  }

                  if (removedBuilding.type === 'city') {
                    return {
                      ...player,
                      cities: player.cities + 1,
                    };
                  }

                  return {
                    ...player,
                    starports: player.starports + 1,
                  };
                }),
        },
      };
    }),

  setPlanetPortal: (clusterId, planetKey, portal) =>
    set((state) => {
      if (!portal) {
        return {
          gameState: {
            ...state.gameState,
            map: {
              ...state.gameState.map,
              [clusterId]: {
                ...state.gameState.map[clusterId],
                [planetKey]: {
                  ...state.gameState.map[clusterId][planetKey],
                  portal: false,
                },
              },
            },
          },
        };
      }

      const nextMap = Object.fromEntries(
        Object.entries(state.gameState.map).map(([currentClusterId, cluster]) => {
          const nextCluster = { ...cluster };

          for (const key of Object.keys(cluster)) {
            if (key === 'gate') {
              continue;
            }

            const typedKey = key as PlanetKey;
            nextCluster[typedKey] = {
              ...cluster[typedKey],
              portal: currentClusterId === clusterId && typedKey === planetKey,
            };
          }

          return [currentClusterId, nextCluster];
        })
      ) as typeof state.gameState.map;

      return {
        gameState: {
          ...state.gameState,
          map: nextMap,
        },
      };
    }),

  setPlanetBanner: (clusterId, planetKey, banner) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        map: {
          ...state.gameState.map,
          [clusterId]: {
            ...state.gameState.map[clusterId],
            [planetKey]: {
              ...state.gameState.map[clusterId][planetKey],
              banner,
            },
          },
        },
      },
    })),

  setPlanetBroken: (clusterId, planetKey, broken) =>
    set((state) => {
      const planet = state.gameState.map[clusterId][planetKey];
      const removedBuildings = broken ? planet.buildings : [];
      const removedCloudCity = broken ? planet.cloudCity : null;

      const updatedPlayers = broken
        ? state.gameState.players.map((player) => {
            let cityReturns = removedCloudCity?.color === player.color ? 1 : 0;
            let starportReturns = 0;

            removedBuildings.forEach((building) => {
              if (building.color !== player.color) {
                return;
              }

              if (building.type === 'city') {
                cityReturns += 1;
              } else if (building.type === 'starport') {
                starportReturns += 1;
              }
            });

            if (cityReturns === 0 && starportReturns === 0) {
              return player;
            }

            return {
              ...player,
              cities: player.cities + cityReturns,
              starports: player.starports + starportReturns,
            };
          })
        : state.gameState.players;

      return {
        gameState: {
          ...state.gameState,
          players: updatedPlayers,
          map: {
            ...state.gameState.map,
            [clusterId]: {
              ...state.gameState.map[clusterId],
              [planetKey]: {
                ...planet,
                broken,
                buildings: broken ? [] : planet.buildings,
                cloudCity: planet.cloudCity,
              },
            },
          },
        },
      };
    }),

  setPlanetCloudCity: (clusterId, planetKey, color) =>
    set((state) => {
      if (!state.gameState.gameSetup.optionalStructures.cloudCities) {
        return state;
      }

      const planet = state.gameState.map[clusterId][planetKey];

      if (color === null) {
        const removedCloudCity = planet.cloudCity;

        if (!removedCloudCity) {
          return state;
        }

        return {
          gameState: {
            ...state.gameState,
            players: state.gameState.players.map((player) =>
              player.color === removedCloudCity.color
                ? { ...player, cities: player.cities + 1 }
                : player
            ),
            map: {
              ...state.gameState.map,
              [clusterId]: {
                ...state.gameState.map[clusterId],
                [planetKey]: {
                  ...planet,
                  cloudCity: null,
                },
              },
            },
          },
        };
      }

      if (planet.cloudCity !== null) {
        return state;
      }

      const owner = state.gameState.players.find((player) => player.color === color);

      if (!owner || owner.cities <= 0) {
        return state;
      }

      return {
        gameState: {
          ...state.gameState,
          players: state.gameState.players.map((player) =>
            player.color === color ? { ...player, cities: player.cities - 1 } : player
          ),
          map: {
            ...state.gameState.map,
            [clusterId]: {
              ...state.gameState.map[clusterId],
              [planetKey]: {
                ...planet,
                cloudCity: {
                  color,
                  seat: false,
                  seatNumber: null,
                },
              },
            },
          },
        },
      };
    }),

  setSeatOnCloudCity: (clusterId, planetKey, seat) =>
    set((state) => {
      if (!state.gameState.gameSetup.optionalTokens.foundersSeatTokens) {
        return state;
      }

      const cluster = state.gameState.map[clusterId];
      const planet = cluster[planetKey];

      if (!planet.cloudCity) {
        return state;
      }

      const seatNumber = getClusterSeatNumber(clusterId);

      const updatedCluster = {
        ...cluster,
        gate: {
          ...cluster.gate,
          station: cluster.gate.station
            ? {
                ...cluster.gate.station,
                seat: false,
                seatNumber: null,
              }
            : null,
        },
        planetTri: {
          ...cluster.planetTri,
          cloudCity:
            planetKey === 'planetTri'
              ? {
                  ...planet.cloudCity,
                  seat,
                  seatNumber: seat ? seatNumber : null,
                }
              : cluster.planetTri.cloudCity
                ? { ...cluster.planetTri.cloudCity, seat: false, seatNumber: null }
                : null,
          buildings: cluster.planetTri.buildings.map((building) => ({
            ...building,
            seat: false,
            seatNumber: null,
          })),
        },
        planetMoon: {
          ...cluster.planetMoon,
          cloudCity:
            planetKey === 'planetMoon'
              ? {
                  ...planet.cloudCity,
                  seat,
                  seatNumber: seat ? seatNumber : null,
                }
              : cluster.planetMoon.cloudCity
                ? { ...cluster.planetMoon.cloudCity, seat: false, seatNumber: null }
                : null,
          buildings: cluster.planetMoon.buildings.map((building) => ({
            ...building,
            seat: false,
            seatNumber: null,
          })),
        },
        planetHex: {
          ...cluster.planetHex,
          cloudCity:
            planetKey === 'planetHex'
              ? {
                  ...planet.cloudCity,
                  seat,
                  seatNumber: seat ? seatNumber : null,
                }
              : cluster.planetHex.cloudCity
                ? { ...cluster.planetHex.cloudCity, seat: false, seatNumber: null }
                : null,
          buildings: cluster.planetHex.buildings.map((building) => ({
            ...building,
            seat: false,
            seatNumber: null,
          })),
        },
      };

      return {
        gameState: {
          ...state.gameState,
          map: {
            ...state.gameState.map,
            [clusterId]: updatedCluster,
          },
        },
      };
    }),

  setSeatOnBuilding: (clusterId, planetKey, buildingIndex, seat) =>
    set((state) => {
      if (!state.gameState.gameSetup.optionalTokens.foundersSeatTokens) {
        return state;
      }

      const cluster = state.gameState.map[clusterId];
      const targetPlanet = cluster[planetKey];
      const targetBuilding = targetPlanet.buildings[buildingIndex];

      if (!targetBuilding) {
        return state;
      }

      if (targetBuilding.type !== 'city' || targetBuilding.color === 'free') {
        return state;
      }

      const seatNumber = getClusterSeatNumber(clusterId);

      const updatedCluster = {
        ...cluster,
        gate: {
          ...cluster.gate,
          station: cluster.gate.station
            ? {
                ...cluster.gate.station,
                seat: false,
                seatNumber: null,
              }
            : null,
        },
        planetTri: {
          ...cluster.planetTri,
          cloudCity: cluster.planetTri.cloudCity
            ? {
                ...cluster.planetTri.cloudCity,
                seat: false,
                seatNumber: null,
              }
            : null,
          buildings: cluster.planetTri.buildings.map((building) => ({
            ...building,
            seat: false,
            seatNumber: null,
          })),
        },
        planetMoon: {
          ...cluster.planetMoon,
          cloudCity: cluster.planetMoon.cloudCity
            ? {
                ...cluster.planetMoon.cloudCity,
                seat: false,
                seatNumber: null,
              }
            : null,
          buildings: cluster.planetMoon.buildings.map((building) => ({
            ...building,
            seat: false,
            seatNumber: null,
          })),
        },
        planetHex: {
          ...cluster.planetHex,
          cloudCity: cluster.planetHex.cloudCity
            ? {
                ...cluster.planetHex.cloudCity,
                seat: false,
                seatNumber: null,
              }
            : null,
          buildings: cluster.planetHex.buildings.map((building) => ({
            ...building,
            seat: false,
            seatNumber: null,
          })),
        },
      };

      if (seat) {
        updatedCluster[planetKey] = {
          ...updatedCluster[planetKey],
          buildings: updatedCluster[planetKey].buildings.map((building, index) => {
            if (index !== buildingIndex) {
              return building;
            }

            return {
              ...building,
              seat: true,
              seatNumber,
            };
          }),
        };
      }

      return {
        gameState: {
          ...state.gameState,
          map: {
            ...state.gameState.map,
            [clusterId]: updatedCluster,
          },
        },
      };
    }),

  addCourtCardToDeck: (card) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        court: {
          ...state.gameState.court,
          inDeck: [...state.gameState.court.inDeck, card],
        },
      },
    })),

  removeCourtCardFromDeck: (cardId) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        court: {
          ...state.gameState.court,
          inDeck: state.gameState.court.inDeck.filter((card) => card.id !== cardId),
        },
      },
    })),

  scrapCourtCard: (cardId) =>
    set((state) => {
      const card = state.gameState.court.inDeck.find((c) => c.id === cardId);

      if (!card) {
        return state;
      }

      return {
        gameState: {
          ...state.gameState,
          court: {
            ...state.gameState.court,
            inDeck: state.gameState.court.inDeck.filter((c) => c.id !== cardId),
          },
          scrapPile: {
            ...state.gameState.scrapPile,
            scrap: [...state.gameState.scrapPile.scrap, card],
          },
        },
      };
    }),

  addRuleCard: (collection, card) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        rules: {
          ...state.gameState.rules,
          [collection]: [...state.gameState.rules[collection], card],
        },
      },
    })),

  removeRuleCard: (collection, cardId) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        rules: {
          ...state.gameState.rules,
          [collection]: state.gameState.rules[collection].filter((card) => card.id !== cardId),
        },
      },
    })),

  scrapRuleCard: (collection, cardId) =>
    set((state) => {
      const card = state.gameState.rules[collection].find((c) => c.id === cardId);

      if (!card) {
        return state;
      }

      return {
        gameState: {
          ...state.gameState,
          rules: {
            ...state.gameState.rules,
            [collection]: state.gameState.rules[collection].filter((c) => c.id !== cardId),
          },
          scrapPile: {
            ...state.gameState.scrapPile,
            scrap: [...state.gameState.scrapPile.scrap, card],
          },
        },
      };
    }),

  addActionCardToDeck: (card) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        actionDeck: {
          ...state.gameState.actionDeck,
          inDeck: [...state.gameState.actionDeck.inDeck, card],
        },
      },
    })),

  removeActionCardFromDeck: (cardId) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        actionDeck: {
          ...state.gameState.actionDeck,
          inDeck: state.gameState.actionDeck.inDeck.filter((card) => card.id !== cardId),
        },
      },
    })),

  scrapActionCard: (cardId) =>
    set((state) => {
      const card = state.gameState.actionDeck.inDeck.find((c) => c.id === cardId);

      if (!card) {
        return state;
      }

      return {
        gameState: {
          ...state.gameState,
          actionDeck: {
            ...state.gameState.actionDeck,
            inDeck: state.gameState.actionDeck.inDeck.filter((c) => c.id !== cardId),
          },
          scrapPile: {
            ...state.gameState.scrapPile,
            scrap: [...state.gameState.scrapPile.scrap, card],
          },
        },
      };
    }),

  addPlayer: (player) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        players: [...state.gameState.players, player],
      },
    })),

  removePlayer: (color) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        players: state.gameState.players.filter((player) => player.color !== color),
      },
    })),

  updatePlayer: (color, updates) =>
    set((state) => {
      let nextPlayers = state.gameState.players.map((player) =>
        player.color === color ? { ...player, ...updates } : player
      );

      if ('power' in updates) {
        nextPlayers = applyInitiativeRules(nextPlayers);
      }

      return {
        gameState: {
          ...state.gameState,
          players: nextPlayers,
        },
      };
    }),

    updatePlayerResources: (color, resourceUpdates) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        players: state.gameState.players.map((player) =>
          player.color === color
            ? { ...player, resources: { ...player.resources, ...resourceUpdates } }
            : player
        ),
      },
    })),

  placeFlagshipBoardBuilding: (color, upgradeId, slotType, buildingType) =>
    set((state) => {
      if (!state.gameState.gameSetup.playersWithFlagships.includes(color)) {
        return state;
      }

      return {
        gameState: {
          ...state.gameState,
          players: state.gameState.players.map((player) => {
            if (player.color !== color) {
              return player;
            }

            const fallbackFlagshipBoard = createEmptyFlagshipBoard();
            const flagshipBoard = player.flagshipBoard ?? fallbackFlagshipBoard;
            const upgradeState = flagshipBoard[upgradeId] ?? fallbackFlagshipBoard[upgradeId];

            if (upgradeState[slotType]) {
              return player;
            }

            if (slotType === 'armor' && !upgradeState.upgrade) {
              return player;
            }

            if (buildingType === 'city' && player.cities <= 0) {
              return player;
            }

            if (buildingType === 'starport' && player.starports <= 0) {
              return player;
            }

            return {
              ...player,
              cities: buildingType === 'city' ? player.cities - 1 : player.cities,
              starports:
                buildingType === 'starport' ? player.starports - 1 : player.starports,
              flagshipBoard: {
                ...fallbackFlagshipBoard,
                ...flagshipBoard,
                [upgradeId]: {
                  ...upgradeState,
                  [slotType]: {
                    type: buildingType,
                  },
                },
              },
            };
          }),
        },
      };
    }),

  removeFlagshipBoardBuilding: (color, upgradeId, slotType) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        players: state.gameState.players.map((player) => {
          if (player.color !== color) {
            return player;
          }

          const fallbackFlagshipBoard = createEmptyFlagshipBoard();
          const flagshipBoard = player.flagshipBoard ?? fallbackFlagshipBoard;
          const upgradeState = flagshipBoard[upgradeId] ?? fallbackFlagshipBoard[upgradeId];
          const removedBuilding = upgradeState[slotType];

          if (!removedBuilding) {
            return player;
          }

          if (slotType === 'upgrade' && upgradeState.armor) {
            return player;
          }

          return {
            ...player,
            cities:
              removedBuilding.type === 'city' ? player.cities + 1 : player.cities,
            starports:
              removedBuilding.type === 'starport'
                ? player.starports + 1
                : player.starports,
            flagshipBoard: {
              ...fallbackFlagshipBoard,
              ...flagshipBoard,
              [upgradeId]: {
                ...upgradeState,
                [slotType]: null,
              },
            },
          };
        }),
      },
    })),
}));
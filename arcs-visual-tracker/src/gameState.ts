import {
  availablePlayerAreaCards,
  initialActionDeck,
  initialCourtCards,
  initialEdictCards,
  initialLawCards,
  initialSummitCards,
} from './CardData';

export type SaveGameNumber = 1 | 2;

export type PlayerColor = 'blue' | 'red' | 'yellow' | 'white';
export type ShipColor = PlayerColor | 'imperial';
export type ResourceType = 'fuel' | 'material' | 'weapon' | 'relic' | 'psionic';
export type PlanetSlot = 'triangle' | 'moon' | 'hexagon';
export type BuildingType = 'city' | 'starport';
export type BuildingColor = PlayerColor | 'free';
export type CourtCardType = 'guild' | 'vox' | 'lore';
export type RuleCardType = 'edict' | 'law' | 'summit';
export type PlayerCardType = 'title' | 'ability';
export type ActionCardType =
  | 'mobilization'
  | 'construction'
  | 'administration'
  | 'aggression'
  | 'event'
  | 'faithful';
export type GolemType = 'warrior' | 'protector' | 'seeker' | 'harvester';

export type ClusterId =
  | 'cluster1'
  | 'cluster2'
  | 'cluster3'
  | 'cluster4'
  | 'cluster5'
  | 'cluster6';

export type PlanetId =
  | 'planet1_1'
  | 'planet1_2'
  | 'planet1_3'
  | 'planet2_1'
  | 'planet2_2'
  | 'planet2_3'
  | 'planet3_1'
  | 'planet3_2'
  | 'planet3_3'
  | 'planet4_1'
  | 'planet4_2'
  | 'planet4_3'
  | 'planet5_1'
  | 'planet5_2'
  | 'planet5_3'
  | 'planet6_1'
  | 'planet6_2'
  | 'planet6_3';

export type PlanetKey = 'planetTri' | 'planetMoon' | 'planetHex';
export type RuleCollection = 'edicts' | 'laws' | 'summit';

export interface Ship {
  color: ShipColor;
}

export interface Building {
  type: BuildingType;
  color: BuildingColor;
  seat: boolean;
  seatNumber: number | null;
}

export interface GateState {
  number: number;
  ships: Ship[];
  flagships: PlayerColor[];
  blight: number;
}

export interface PlanetState {
  id: PlanetId;
  slot: PlanetSlot;
  ships: Ship[];
  flagships: PlayerColor[];
  blight: number;
  resource: ResourceType;
  buildingSpaces: 1 | 2;
  buildings: Building[];
  portal: boolean;
  banner: boolean;
  broken: boolean;
}

export interface ClusterState {
  gate: GateState;
  planetTri: PlanetState;
  planetMoon: PlanetState;
  planetHex: PlanetState;
}

export interface MapState {
  cluster1: ClusterState;
  cluster2: ClusterState;
  cluster3: ClusterState;
  cluster4: ClusterState;
  cluster5: ClusterState;
  cluster6: ClusterState;
}

interface BaseCardWithImage {
  name: string;
  id: string;
  image: string;
}

export interface CourtCard extends BaseCardWithImage {
  category: 'court';
  type: CourtCardType;
  number: number;
}

export interface RuleCard extends BaseCardWithImage {
  category: 'rule';
  type: RuleCardType;
  number: number;
}

export interface PlayerCard extends BaseCardWithImage {
  category: 'player';
  type: PlayerCardType;
  number?: number;
}

export interface ActionCard extends BaseCardWithImage {
  category: 'action';
  type: ActionCardType;
  number: number;
}

export type GameCard = CourtCard | RuleCard | PlayerCard | ActionCard;

export interface CourtState {
  inDeck: CourtCard[];
}

export interface RulesState {
  edicts: RuleCard[];
  laws: RuleCard[];
  summit: RuleCard[];
}

export interface ScrapPileState {
  scrap: GameCard[];
}

export interface PlayerCardPoolState {
  available: PlayerCard[];
}

export interface ActionDeckState {
  inDeck: ActionCard[];
}

export interface Golem {
  type: GolemType;
}

export interface FlagshipUpgrade {
  id: string;
  name: string;
}

export interface ResourceInventory {
  fuel: number;
  material: number;
  weapon: number;
  relic: number;
  psionic: number;
  golem: number;
}

export type Allegiance = 'regent' | 'outlaw';

export interface FavorInventory {
  blue: number;
  red: number;
  yellow: number;
  white: number;
}

export interface GameSetup {
  setupComplete: boolean;
  playersInGame: PlayerColor[];
  playersWithFlagships: PlayerColor[];
  optionalTokens: {
    pathfindersPortal: boolean;
    hegemonsBanner: boolean;
    caretakersGolems: boolean;
    planetBreakersBroken: boolean;
  };
  optionalStructures: {
    cloudCities: boolean;
    gatePorts: boolean;
    gateStations: boolean;
  };
}

export interface PlayerState {
  color: PlayerColor;
  fate: string | null;
  power: number;
  initiative: boolean;
  allegiance: Allegiance;
  outrage: ResourceType[];
  flagship: boolean;
  flagshipUpgrades: FlagshipUpgrade[];
  cards: PlayerCard[];
  resources: ResourceInventory;
  ships: number;
  cities: number;
  starports: number;
  favors: FavorInventory;
  trophies: number;
  captives: number;
}

export interface GameState {
  gameNumber: SaveGameNumber;
  map: MapState;
  court: CourtState;
  rules: RulesState;
  scrapPile: ScrapPileState;
  playerCardPool: PlayerCardPoolState;
  actionDeck: ActionDeckState;
  players: PlayerState[];
  gameSetup: GameSetup;
}

export interface GameSaveFile {
  version: 1;
  savedAt: string;
  data: GameState;
}

const createEmptyGate = (number: number): GateState => ({
  number,
  ships: [],
  flagships: [],
  blight: 0,
});

const createPlanet = (
  id: PlanetId,
  slot: PlanetSlot,
  resource: ResourceType,
  buildingSpaces: 1 | 2
): PlanetState => ({
  id,
  slot,
  ships: [],
  flagships: [],
  blight: 0,
  resource,
  buildingSpaces,
  buildings: [],
  portal: false,
  banner: false,
  broken: false,
});

export const initialMapState: MapState = {
  cluster1: {
    gate: createEmptyGate(1),
    planetTri: createPlanet('planet1_1', 'triangle', 'weapon', 2),
    planetMoon: createPlanet('planet1_2', 'moon', 'fuel', 1),
    planetHex: createPlanet('planet1_3', 'hexagon', 'material', 2),
  },
  cluster2: {
    gate: createEmptyGate(2),
    planetTri: createPlanet('planet2_1', 'triangle', 'psionic', 1),
    planetMoon: createPlanet('planet2_2', 'moon', 'weapon', 1),
    planetHex: createPlanet('planet2_3', 'hexagon', 'relic', 2),
  },
  cluster3: {
    gate: createEmptyGate(3),
    planetTri: createPlanet('planet3_1', 'triangle', 'material', 1),
    planetMoon: createPlanet('planet3_2', 'moon', 'fuel', 1),
    planetHex: createPlanet('planet3_3', 'hexagon', 'weapon', 2),
  },
  cluster4: {
    gate: createEmptyGate(4),
    planetTri: createPlanet('planet4_1', 'triangle', 'relic', 2),
    planetMoon: createPlanet('planet4_2', 'moon', 'fuel', 2),
    planetHex: createPlanet('planet4_3', 'hexagon', 'material', 1),
  },
  cluster5: {
    gate: createEmptyGate(5),
    planetTri: createPlanet('planet5_1', 'triangle', 'weapon', 1),
    planetMoon: createPlanet('planet5_2', 'moon', 'relic', 1),
    planetHex: createPlanet('planet5_3', 'hexagon', 'psionic', 2),
  },
  cluster6: {
    gate: createEmptyGate(6),
    planetTri: createPlanet('planet6_1', 'triangle', 'material', 1),
    planetMoon: createPlanet('planet6_2', 'moon', 'fuel', 2),
    planetHex: createPlanet('planet6_3', 'hexagon', 'psionic', 1),
  },
};

export const initialCourtState: CourtState = {
  inDeck: [...initialCourtCards],
};

export const initialRulesState: RulesState = {
  edicts: [...initialEdictCards],
  laws: [...initialLawCards],
  summit: [...initialSummitCards],
};

export const initialScrapPileState: ScrapPileState = {
  scrap: [],
};

export const initialPlayerCardPoolState: PlayerCardPoolState = {
  available: [...availablePlayerAreaCards],
};

export const initialActionDeckState: ActionDeckState = {
  inDeck: [...initialActionDeck],
};

export const defaultGameSetup: GameSetup = {
  setupComplete: false,
  playersInGame: ['blue', 'red', 'yellow', 'white'],
  playersWithFlagships: [],
  optionalTokens: {
    pathfindersPortal: false,
    hegemonsBanner: false,
    caretakersGolems: false,
    planetBreakersBroken: false,
  },
  optionalStructures: {
    cloudCities: false,
    gatePorts: false,
    gateStations: false,
  },
};

export const initialGameState: GameState = {
  gameNumber: 1,
  map: initialMapState,
  court: initialCourtState,
  rules: initialRulesState,
  scrapPile: initialScrapPileState,
  playerCardPool: initialPlayerCardPoolState,
  actionDeck: initialActionDeckState,
  players: [],
  gameSetup: defaultGameSetup,
};

export const createEmptyPlayer = (color: PlayerColor): PlayerState => ({
  color,
  fate: null,
  power: 0,
  initiative: false,
  allegiance: 'regent',
  outrage: [],
  flagship: false,
  flagshipUpgrades: [],
  cards: [],
  resources: {
    fuel: 0,
    material: 0,
    weapon: 0,
    relic: 0,
    psionic: 0,
    golem: 0,
  },
  ships: 15,
  cities: 5,
  starports: 5,
  favors: {
    blue: 0,
    red: 0,
    yellow: 0,
    white: 0,
  },
  trophies: 0,
  captives: 0,
});

export const createInitialPlayers = (): PlayerState[] => [
  createEmptyPlayer('blue'),
  createEmptyPlayer('red'),
  createEmptyPlayer('yellow'),
  createEmptyPlayer('white'),
];

export const createInitialGameState = (gameNumber: SaveGameNumber = 1): GameState => ({
  gameNumber,
  map: structuredClone(initialMapState),
  court: structuredClone(initialCourtState),
  rules: structuredClone(initialRulesState),
  scrapPile: structuredClone(initialScrapPileState),
  playerCardPool: structuredClone(initialPlayerCardPoolState),
  actionDeck: structuredClone(initialActionDeckState),
  players: createInitialPlayers(),
  gameSetup: structuredClone(defaultGameSetup),
});

export const createGameSaveFile = (state: GameState): GameSaveFile => ({
  version: 1,
  savedAt: new Date().toISOString(),
  data: state,
});

export const playerBoardImageByColor: Record<PlayerColor, string> = {
  blue: '/assets/blue-player-board.png',
  red: '/assets/red-player-board.png',
  yellow: '/assets/yellow-player-board.png',
  white: '/assets/white-player-board.png',
};

export const flagshipBoardImage = '/assets/FlagshipBoard.jpg';
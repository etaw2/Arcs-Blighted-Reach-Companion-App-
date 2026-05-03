import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../gameStore';
import {
  allActionCards,
  allCourtCards,
  allEdictCards,
  allLawCards,
  allPlayerAreaCards,
  allSummitCards,
} from '../CardData';
import type {
  ActionCard,
  CourtCard,
  GameCard,
  PlayerCard,
  PlayerColor,
  RuleCard,
} from '../gameState';
import GameCardView from './GameCardView';
import { playSound } from '../utils/sound';

const EMPTY_COURT_CARDS: CourtCard[] = [];
const EMPTY_RULE_CARDS: RuleCard[] = [];
const EMPTY_PLAYER_CARDS: PlayerCard[] = [];
const EMPTY_ACTION_CARDS: ActionCard[] = [];
const EMPTY_SCRAP_CARDS: GameCard[] = [];

type AvailableCardMoveLogEntry = {
  id: string;
  card: GameCard;
  cardLabel: string;
  destination: string;
  destinationType: 'court' | 'player' | 'laws' | 'edicts' | 'summit' | 'actionDeck' | 'scrapPile' | 'available';
  playerColor?: PlayerColor;
  sourceType?: 'court' | 'player' | 'laws' | 'edicts' | 'summit' | 'actionDeck' | 'scrapPile' | 'available';
  sourcePlayerColor?: PlayerColor;
};

type CardMovedLogEventDetail = {
  card: GameCard;
  destination: string;
  destinationType: AvailableCardMoveLogEntry['destinationType'];
  playerColor?: PlayerColor;
  sourceType?: AvailableCardMoveLogEntry['sourceType'];
  sourcePlayerColor?: PlayerColor;
};

const COURT_GROUP_LABELS: Record<string, string> = {
  cc: 'Base Court',
  l: 'Base Lore Cards',
  F1: 'Steward',
  F2: 'Founder',
  F3: 'Magnate',
  F4: 'Advocate',
  F5: 'Caretaker',
  F6: 'Partisan',
  F7: 'Admiral',
  F8: 'Believer',
  F9: 'Pathfinder',
  F10: 'Hegemon',
  F11: 'Planet Breaker',
  F12: 'Pirate',
  F13: 'Blight Speaker',
  F14: 'Pacifist',
  F15: 'Peacekeeper',
  F16: 'Warden',
};

const COURT_GROUP_ORDER = [
  'cc',
  'l',
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12',
  'F13',
  'F14',
  'F15',
  'F16',
];

const PLAYER_BUTTON_TEXT_COLORS: Record<PlayerColor, string> = {
  blue: '#1697aa',
  red: '#e0513c',
  yellow: '#fdb414',
  white: '#ffffff',
};

const COURT_BUTTON_STYLE = {
  color: '#d2ae50',
  fontWeight: 700,
};

const RULE_BUTTON_STYLE = {
  color: '#8c479a',
  fontWeight: 700,
};

const SCRAP_BUTTON_STYLE = {
  color: '#903326',
  fontWeight: 700,
};

function sortById<T extends { id: string }>(cards: T[]): T[] {
  const parseId = (id: string) => {
    const [left, right] = id.split('-');
    const rightNumber = Number(right);

    return {
      left,
      right: Number.isNaN(rightNumber) ? 0 : rightNumber,
    };
  };

  return [...cards].sort((a, b) => {
    const aParsed = parseId(a.id);
    const bParsed = parseId(b.id);

    const leftCompare = aParsed.left.localeCompare(bParsed.left);
    if (leftCompare !== 0) {
      return leftCompare;
    }

    return aParsed.right - bParsed.right;
  });
}

function getCourtGroupKey(card: GameCard) {
  return card.id.split('-')[0];
}

function isFaithfulActionCard(card: ActionCard) {
  return /^F\d+-/.test(card.id) && !card.id.startsWith('F5-');
}
function isVoxCard(card: CourtCard | PlayerCard) {
  return card.category === 'court' && card.type === 'vox';
}

function groupCardsByCourtKey<T extends GameCard>(cards: T[]) {
  return cards.reduce<Record<string, T[]>>((groups, card) => {
    const groupKey = getCourtGroupKey(card);

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(card);
    return groups;
  }, {});
}

function capitalizePlayerColor(color: PlayerColor) {
  return color.charAt(0).toUpperCase() + color.slice(1);
}

function getMoveDestinationTextStyle(entry: AvailableCardMoveLogEntry) {
  if (entry.destinationType === 'player' && entry.playerColor) {
    return {
      color: PLAYER_BUTTON_TEXT_COLORS[entry.playerColor],
      opacity: 1,
      fontWeight: 700,
    };
  }

  if (entry.destinationType === 'court') {
  return {
    color: '#d2ae50',
    opacity: 1,
    fontWeight: 700,
  };
}

if (entry.destinationType === 'scrapPile') {
  return {
    color: '#903326',
    opacity: 1,
    fontWeight: 700,
  };
}

if (
  entry.destinationType === 'laws' ||
  entry.destinationType === 'edicts' ||
  entry.destinationType === 'summit'
) {
  return {
    color: '#8c479a',
    opacity: 1,
    fontWeight: 700,
  };
}

  return {
    color: 'rgba(255, 255, 255, 0.95)',
    opacity: 1,
    fontWeight: 700,
  };
}

function getCardSearchText(card: GameCard) {
  const searchableCard = card as GameCard & {
    name?: string;
    title?: string;
    suit?: string;
    type?: string;
  };

  return [
    searchableCard.id,
    searchableCard.name,
    searchableCard.title,
    searchableCard.suit,
    searchableCard.type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function getCardDisplayName(card: GameCard) {
  const displayCard = card as GameCard & {
    name?: string;
    title?: string;
  };

  return displayCard.name ?? displayCard.title ?? card.id;
}

function SectionToggle({
  title,
  isOpen,
  onToggle,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <button
        onClick={() => {
          playSound(isOpen ? 'panelClose' : 'panelOpen');
          onToggle();
        }}
      >
        {isOpen ? `Hide ${title}` : `View ${title}`}
      </button>
    </div>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.9rem',
        alignItems: 'flex-start',
      }}
    >
      {children}
    </div>
  );
}

function CardPicture({ card }: { card: GameCard }) {
  return (
    <div className="card-picture-only">
      <GameCardView card={card} size="small" />
    </div>
  );
}

function CardTile({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        alignItems: 'stretch',
        width: '7.9rem',
      }}
    >
      {children}
      {actions ? <div className="card-tile-actions">{actions}</div> : null}
    </div>
  );
}

function AddToPlayerMenu({
  card,
  activePlayerColors,
  onAdd,
}: {
  card: CourtCard | PlayerCard;
  activePlayerColors: PlayerColor[];
  onAdd: (color: PlayerColor, card: CourtCard | PlayerCard) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
      }}
    >
      <button onClick={() => setIsOpen((prev) => !prev)}>
        {isOpen ? 'Cancel' : 'Add to Player'}
      </button>

      {isOpen &&
  activePlayerColors.map((color) => (
    <button
      key={color}
      style={{
        color: PLAYER_BUTTON_TEXT_COLORS[color],
        fontWeight: 700,
      }}
      onClick={() => {
        onAdd(color, card);
        setIsOpen(false);
      }}
    >
      Add to {capitalizePlayerColor(color)}
    </button>
  ))}
    </div>
  );
}

export default function CardsPanel() {
  const gameState = useGameStore((state) => state.gameState);

  const addCourtCardToDeck = useGameStore((state) => state.addCourtCardToDeck);
  const removeCourtCardFromDeck = useGameStore((state) => state.removeCourtCardFromDeck);
  const scrapCourtCard = useGameStore((state) => state.scrapCourtCard);

  const addRuleCard = useGameStore((state) => state.addRuleCard);
  const removeRuleCard = useGameStore((state) => state.removeRuleCard);
  const scrapRuleCard = useGameStore((state) => state.scrapRuleCard);

  const addActionCardToDeck = useGameStore((state) => state.addActionCardToDeck);
  const removeActionCardFromDeck = useGameStore((state) => state.removeActionCardFromDeck);
  const scrapActionCard = useGameStore((state) => state.scrapActionCard);
  const removeCardFromScrapPile = useGameStore((state) => state.removeCardFromScrapPile);
  const addPlayerCardToPlayer = useGameStore((state) => state.addPlayerCardToPlayer);
  const removePlayerCardFromPlayer = useGameStore((state) => state.removePlayerCardFromPlayer);

  const [showAvailableCourt, setShowAvailableCourt] = useState(false);

  const [showCourt, setShowCourt] = useState(false);
  const [showLaws, setShowLaws] = useState(false);
  const [showEdicts, setShowEdicts] = useState(false);
  const [showSummit, setShowSummit] = useState(false);
  const [showActionDeck, setShowActionDeck] = useState(false);
  const [showScrapPile, setShowScrapPile] = useState(false);

  const [availableCourtSearch, setAvailableCourtSearch] = useState('');
  const [availableCardMoveLog, setAvailableCardMoveLog] = useState<AvailableCardMoveLogEntry[]>([]);
  const [clearLogWarningOpen, setClearLogWarningOpen] = useState(false);

  const courtDeck = gameState.court?.inDeck ?? EMPTY_COURT_CARDS;
  const laws = gameState.rules?.laws ?? EMPTY_RULE_CARDS;
  const edicts = gameState.rules?.edicts ?? EMPTY_RULE_CARDS;
  const summit = gameState.rules?.summit ?? EMPTY_RULE_CARDS;
  const actionDeck = gameState.actionDeck?.inDeck ?? EMPTY_ACTION_CARDS;
  const scrapPile = gameState.scrapPile?.scrap ?? EMPTY_SCRAP_CARDS;
  const playerCardPool = gameState.playerCardPool?.available ?? allPlayerAreaCards ?? EMPTY_PLAYER_CARDS;
  const activePlayerColors = gameState.gameSetup.playersInGame;

  const scrappedIds = useMemo(() => new Set(scrapPile.map((card) => card.id)), [scrapPile]);
  const courtIds = useMemo(() => new Set(courtDeck.map((card) => card.id)), [courtDeck]);
  const lawIds = useMemo(() => new Set(laws.map((card) => card.id)), [laws]);
  const edictIds = useMemo(() => new Set(edicts.map((card) => card.id)), [edicts]);
  const summitIds = useMemo(() => new Set(summit.map((card) => card.id)), [summit]);
  const actionDeckIds = useMemo(() => new Set(actionDeck.map((card) => card.id)), [actionDeck]);
  const playerAreaCardIds = useMemo(
    () => new Set(gameState.players.flatMap((player) => (player.cards ?? []).map((card) => card.id))),
    [gameState.players]
  );

  const availableCourtCards = useMemo(
    () =>
      sortById(
        allCourtCards.filter(
          (card) =>
            !courtIds.has(card.id) &&
            !scrappedIds.has(card.id) &&
            !playerAreaCardIds.has(card.id)
        )
      ),
    [courtIds, scrappedIds, playerAreaCardIds]
  );

  const availablePlayerCards = useMemo(
    () =>
      sortById(
        playerCardPool.filter(
          (card) => !scrappedIds.has(card.id) && !playerAreaCardIds.has(card.id)
        )
      ),
    [playerCardPool, scrappedIds, playerAreaCardIds]
  );

  const filteredAvailableCourtCards = useMemo(() => {
    const searchText = availableCourtSearch.trim().toLowerCase();

    if (!searchText) {
      return availableCourtCards;
    }

    return availableCourtCards.filter((card) => getCardSearchText(card).includes(searchText));
  }, [availableCourtCards, availableCourtSearch]);

  const filteredAvailablePlayerCards = useMemo(() => {
    const searchText = availableCourtSearch.trim().toLowerCase();

    if (!searchText) {
      return availablePlayerCards;
    }

    return availablePlayerCards.filter((card) => getCardSearchText(card).includes(searchText));
  }, [availablePlayerCards, availableCourtSearch]);

  const availableCourtCardsByGroup = useMemo(
    () => groupCardsByCourtKey(filteredAvailableCourtCards),
    [filteredAvailableCourtCards]
  );

  const availablePlayerCardsByGroup = useMemo(
    () => groupCardsByCourtKey(filteredAvailablePlayerCards),
    [filteredAvailablePlayerCards]
  );

  const availableCourtGroupOrder = useMemo(() => {
    const availableGroupKeys = new Set([
      ...Object.keys(availableCourtCardsByGroup),
      ...Object.keys(availablePlayerCardsByGroup),
    ]);
    const unknownGroups = [...availableGroupKeys]
      .filter((groupKey) => !COURT_GROUP_ORDER.includes(groupKey))
      .sort((a, b) => a.localeCompare(b));

    return [
      ...COURT_GROUP_ORDER.filter((groupKey) => availableGroupKeys.has(groupKey)),
      ...unknownGroups,
    ];
  }, [availableCourtCardsByGroup, availablePlayerCardsByGroup]);

  const availableLawCards = useMemo(
    () =>
      sortById(allLawCards.filter((card) => !lawIds.has(card.id) && !scrappedIds.has(card.id))),
    [lawIds, scrappedIds]
  );

  const availableEdictCards = useMemo(
    () =>
      sortById(
        allEdictCards.filter((card) => !edictIds.has(card.id) && !scrappedIds.has(card.id))
      ),
    [edictIds, scrappedIds]
  );

  const availableSummitCards = useMemo(
    () =>
      sortById(
        allSummitCards.filter((card) => !summitIds.has(card.id) && !scrappedIds.has(card.id))
      ),
    [summitIds, scrappedIds]
  );

  const availableFaithfulActionCards = useMemo(
    () =>
      sortById(
        allActionCards.filter(
          (card) =>
            isFaithfulActionCard(card) &&
            !courtIds.has(card.id) &&
            !actionDeckIds.has(card.id) &&
            !scrappedIds.has(card.id)
        )
      ),
    [courtIds, actionDeckIds, scrappedIds]
  );

  const availableActionCards = useMemo(
    () =>
      sortById(
        allActionCards.filter(
          (card) =>
            !isFaithfulActionCard(card) &&
            !actionDeckIds.has(card.id) &&
            !scrappedIds.has(card.id)
        )
      ),
    [actionDeckIds, scrappedIds]
  );

  const logAvailableCardMove = (
  card: GameCard,
  destination: string,
  destinationType: AvailableCardMoveLogEntry['destinationType'],
  playerColor?: PlayerColor,
  sourceType?: AvailableCardMoveLogEntry['sourceType'],
  sourcePlayerColor?: PlayerColor
) => {
  setAvailableCardMoveLog((prev) => [
    {
      id: `${card.id}-${destination}-${Date.now()}-${prev.length}`,
      card,
      cardLabel: `${card.id} · ${getCardDisplayName(card)}`,
      destination,
      destinationType,
      playerColor,
      sourceType,
      sourcePlayerColor,
    },
    ...prev,
  ]);
};

const undoAvailableCardMove = (entry: AvailableCardMoveLogEntry) => {
  playSound('cardMove');

  if (entry.destinationType === 'court') {
    removeCourtCardFromDeck(entry.card.id);
  }

  if (entry.destinationType === 'player' && entry.playerColor) {
    removePlayerCardFromPlayer(entry.playerColor, entry.card.id);
  }

  if (entry.destinationType === 'laws') {
    removeRuleCard('laws', entry.card.id);
  }

  if (entry.destinationType === 'edicts') {
    removeRuleCard('edicts', entry.card.id);
  }

  if (entry.destinationType === 'summit') {
    removeRuleCard('summit', entry.card.id);
  }

  if (entry.destinationType === 'actionDeck') {
    removeActionCardFromDeck(entry.card.id);
  }

  if (entry.destinationType === 'scrapPile') {
    removeCardFromScrapPile(entry.card.id);
  }

  if (entry.sourceType === 'court') {
    addCourtCardToDeck(entry.card as CourtCard);
  }

  if (entry.sourceType === 'player' && entry.sourcePlayerColor) {
    addPlayerCardToPlayer(entry.sourcePlayerColor, entry.card as CourtCard | PlayerCard);
  }

  if (entry.sourceType === 'laws') {
    addRuleCard('laws', entry.card as RuleCard);
  }

  if (entry.sourceType === 'edicts') {
    addRuleCard('edicts', entry.card as RuleCard);
  }

  if (entry.sourceType === 'summit') {
    addRuleCard('summit', entry.card as RuleCard);
  }

  if (entry.sourceType === 'actionDeck') {
    addActionCardToDeck(entry.card as ActionCard);
  }

  setAvailableCardMoveLog((prev) => prev.filter((item) => item.id !== entry.id));
};

useEffect(() => {
  const handleCardMovedLog = (event: Event) => {
    const customEvent = event as CustomEvent<CardMovedLogEventDetail>;
    const detail = customEvent.detail;

    if (!detail?.card) {
      return;
    }

    logAvailableCardMove(
      detail.card,
      detail.destination,
      detail.destinationType,
      detail.playerColor,
      detail.sourceType,
      detail.sourcePlayerColor
    );
  };

  window.addEventListener('arcs-card-moved-log', handleCardMovedLog);

  return () => {
    window.removeEventListener('arcs-card-moved-log', handleCardMovedLog);
  };
}, []);

 const renderAddToPlayerButtons = (card: CourtCard | PlayerCard) => {
  if (isVoxCard(card)) {
    return null;
  }

  return (
    <AddToPlayerMenu
      card={card}
      activePlayerColors={activePlayerColors}
      onAdd={(color, selectedCard) => {
        playSound('cardMove');
        addPlayerCardToPlayer(color, selectedCard);
        logAvailableCardMove(selectedCard, `${capitalizePlayerColor(color)} Player Area`, 'player', color, 'available');
      }}
    />
  );
};

 const renderMoveCourtCardToPlayerButtons = (card: CourtCard) => {
  if (isVoxCard(card)) {
    return null;
  }

  return (
    <AddToPlayerMenu
      card={card}
      activePlayerColors={activePlayerColors}
      onAdd={(color, selectedCard) => {
        playSound('cardMove');
        addPlayerCardToPlayer(color, selectedCard);
        removeCourtCardFromDeck(selectedCard.id);
        logAvailableCardMove(selectedCard, `${capitalizePlayerColor(color)} Player Area`, 'player', color, 'court');
      }}
    />
  );
};

  return (
    <section
      className="main-layout"
      style={{
        marginTop: '1rem',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 18rem',
        gap: '1rem',
        width: '100%',
        maxWidth: 'none',
        alignItems: 'start',
      }}
    >
      <style>
  {`
    .card-picture-only {
  position: relative;
  z-index: 1;
  min-height: 10rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  transition:
    transform 160ms ease,
    filter 160ms ease,
    z-index 0ms linear;
  transition-delay: 0s;
  transform-origin: center center;
  color: transparent !important;
  font-size: 0 !important;
  line-height: 0 !important;
}

.card-picture-only:hover {
  transform: scale(2.15);
  z-index: 9999;
  filter: drop-shadow(0 0 14px rgba(0, 0, 0, 0.85));
  transition-delay: .5s;
}

    .card-picture-only * {
      color: transparent !important;
      font-size: 0 !important;
      line-height: 0 !important;
    }

    .card-picture-only img {
      display: block !important;
      color: initial !important;
      font-size: initial !important;
      line-height: initial !important;
    }

    .card-tile-actions {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      width: 100%;
      position: relative;
      z-index: 2;
    }

    .subsection {
  width: 100%;
  box-sizing: border-box;
  position: relative;
  margin-bottom: 1rem;
}

    .card-tile-actions button {
      width: 100%;
      white-space: normal;
      text-align: center;
      line-height: 1.15;
      padding-left: 0.35rem;
      padding-right: 0.35rem;
    }
  `}
</style>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minWidth: 0,
        }}
      >
      <aside
        className="panel"
        style={{
          width: '100%',
          maxWidth: 'none',
          boxSizing: 'border-box',
          alignSelf: 'stretch',
          position: 'relative',
        }}
      >
        <div
          id="available-cards-sticky-header"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: 'rgba(24, 24, 24, 0.98)',
            backdropFilter: 'blur(6px)',
            paddingTop: '0.9rem',
            paddingBottom: '0.9rem',
            marginBottom: '0.75rem',
          }}
        >
          <h2 style={{ marginBottom: '0.5rem' }}>Available Cards</h2>

          <SectionToggle
            title="Available Cards"
            isOpen={showAvailableCourt}
            onToggle={() => {
              if (showAvailableCourt) {
                window.requestAnimationFrame(() => {
                  document
                    .getElementById('available-cards-sticky-header')
                    ?.scrollIntoView({ behavior: 'auto', block: 'start' });
                });
              }

              setShowAvailableCourt((prev) => !prev);
            }}
          />

          {showAvailableCourt && (
            <div style={{ marginTop: '0.9rem' }}>
              <input
                value={availableCourtSearch}
                onChange={(event) => {
                  setAvailableCourtSearch(event.target.value);

                  window.requestAnimationFrame(() => {
                    document
                      .getElementById('available-cards-sticky-header')
                      ?.scrollIntoView({ behavior: 'auto', block: 'start' });
                  });
                }}
                placeholder="Search available cards..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  marginBottom: 0,
                  padding: '0.55rem 0.7rem',
                  borderRadius: '0.4rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  color: 'white',
                }}
              />
            </div>
          )}
        </div>



        {showAvailableCourt && (
          <div className="subsection">

            {availableCourtCards.length === 0 &&
availablePlayerCards.length === 0 &&
availableLawCards.length === 0 &&
availableEdictCards.length === 0 &&
availableSummitCards.length === 0 &&
availableFaithfulActionCards.length === 0 &&
availableActionCards.length === 0? (
              <p>No available court cards.</p>
            ) : filteredAvailableCourtCards.length === 0 &&
  filteredAvailablePlayerCards.length === 0 &&
  availableLawCards.filter((card) =>
    getCardSearchText(card).includes(availableCourtSearch.trim().toLowerCase())
  ).length === 0 &&
  availableEdictCards.filter((card) =>
    getCardSearchText(card).includes(availableCourtSearch.trim().toLowerCase())
  ).length === 0 &&
  availableSummitCards.filter((card) =>
    getCardSearchText(card).includes(availableCourtSearch.trim().toLowerCase())
  ).length === 0 &&
  availableFaithfulActionCards.filter((card) =>
    getCardSearchText(card).includes(availableCourtSearch.trim().toLowerCase())
  ).length === 0 &&
  availableActionCards.filter((card) =>
    getCardSearchText(card).includes(availableCourtSearch.trim().toLowerCase())
  ).length === 0 ? (
              <p>No available court cards match that search.</p>
            ) : (
              <>
                {availableCourtGroupOrder.map((groupKey) => (
                  <div key={groupKey} style={{ marginBottom: '1.25rem' }}>
                    <h3
                      style={{
                        marginBottom: '0.75rem',
                        fontSize: '1.35rem',
                        fontWeight: 700,
                        borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
                        paddingBottom: '0.35rem',
                      }}
                    >
                      {COURT_GROUP_LABELS[groupKey] ?? groupKey}
                    </h3>

                    <CardGrid>
                      {sortById(availableCourtCardsByGroup[groupKey] ?? []).map((card) => (
                        <CardTile
                          key={card.id}
                          actions={
                            <>
                              <button
                                style={COURT_BUTTON_STYLE}
                                onClick={() => {
                                  playSound('cardMove');
                                  addCourtCardToDeck(card);
                                  logAvailableCardMove(card, 'Court', 'court', undefined, 'available');
                                }}
                              >
                                Add to Court
                              </button>
                              {renderAddToPlayerButtons(card)}
                            </>
                          }
                        >
                          <CardPicture card={card} />
                        </CardTile>
                      ))}
                      {sortById(availablePlayerCardsByGroup[groupKey] ?? []).map((card) => (
                        <CardTile key={card.id} actions={renderAddToPlayerButtons(card)}>
                          <CardPicture card={card} />
                        </CardTile>
                      ))}
                    </CardGrid>
                  </div>
                ))}

                {availableLawCards
                  .filter((card) =>
                    getCardSearchText(card).includes(availableCourtSearch.trim().toLowerCase())
                  )
                  .length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{
                      marginBottom: '0.75rem',
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
                      paddingBottom: '0.35rem',
                    }}>
                      Laws
                    </h3>
                    <CardGrid>
                      {availableLawCards
                        .filter((card) =>
                          getCardSearchText(card).includes(availableCourtSearch.trim().toLowerCase())
                        )
                        .map((card) => (
                          <CardTile
                            key={card.id}
                            actions={<button
                              style={RULE_BUTTON_STYLE}
                              onClick={() => {
                                playSound('cardMove');
                                addRuleCard('laws', card);
                                logAvailableCardMove(card, 'Laws', 'laws', undefined, 'available');
                              }}
                            >
                              Add to Laws
                            </button>}
                          >
                            <CardPicture card={card} />
                          </CardTile>
                        ))}
                    </CardGrid>
                  </div>
                )}

                {availableEdictCards
                  .filter((card) =>
                    getCardSearchText(card).includes(availableCourtSearch.trim().toLowerCase())
                  )
                  .length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{
                      marginBottom: '0.75rem',
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
                      paddingBottom: '0.35rem',
                    }}>
                      Edicts
                    </h3>
                    <CardGrid>
                      {availableEdictCards
                        .filter((card) =>
                          getCardSearchText(card).includes(availableCourtSearch.trim().toLowerCase())
                        )
                        .map((card) => (
                          <CardTile
                            key={card.id}
                            actions={<button
                              style={RULE_BUTTON_STYLE}
                              onClick={() => {
                                playSound('cardMove');
                                addRuleCard('edicts', card);
                                logAvailableCardMove(card, 'Edicts', 'edicts', undefined, 'available');
                              }}
                            >
                              Add to Edicts
                            </button>}
                          >
                            <CardPicture card={card} />
                          </CardTile>
                        ))}
                    </CardGrid>
                  </div>
                )}

                {availableSummitCards
                  .filter((card) =>
                    getCardSearchText(card).includes(availableCourtSearch.trim().toLowerCase())
                  )
                  .length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{
                      marginBottom: '0.75rem',
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
                      paddingBottom: '0.35rem',
                    }}>
                      Summit
                    </h3>
                    <CardGrid>
                      {availableSummitCards
                        .filter((card) =>
                          getCardSearchText(card).includes(availableCourtSearch.trim().toLowerCase())
                        )
                        .map((card) => (
                          <CardTile
                            key={card.id}
                            actions={<button
                              style={RULE_BUTTON_STYLE}
                              onClick={() => {
                                playSound('cardMove');
                                addRuleCard('summit', card);
                                logAvailableCardMove(card, 'Summit', 'summit', undefined, 'available');
                              }}
                            >
                              Add to Summit
                            </button>}
                          >
                            <CardPicture card={card} />
                          </CardTile>
                        ))}
                    </CardGrid>
                  </div>
                                )}

                {availableFaithfulActionCards
                  .filter((card) =>
                    getCardSearchText(card).includes(availableCourtSearch.trim().toLowerCase())
                  )
                  .length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{
                      marginBottom: '0.75rem',
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
                      paddingBottom: '0.35rem',
                    }}>
                      Faithful Actions
                    </h3>
                    <CardGrid>
                      {availableFaithfulActionCards
                        .filter((card) =>
                          getCardSearchText(card).includes(availableCourtSearch.trim().toLowerCase())
                        )
                        .map((card) => (
                          <CardTile
                            key={card.id}
                            actions={
                              <>
                                <button
                                  style={COURT_BUTTON_STYLE}
                                  onClick={() => {
                                    playSound('cardMove');
                                    addCourtCardToDeck(card as unknown as CourtCard);
                                    logAvailableCardMove(card, 'Court', 'court', undefined, 'available');
                                  }}
                                >
                                  Add to Court
                                </button>
                                <button
                                  onClick={() => {
                                    playSound('cardMove');
                                    addActionCardToDeck(card);
                                    logAvailableCardMove(card, 'Action Deck', 'actionDeck', undefined, 'available');
                                  }}
                                >
                                  Add to Action Deck
                                </button>
                              </>
                            }
                          >
                            <CardPicture card={card} />
                          </CardTile>
                        ))}
                    </CardGrid>
                  </div>
                )}

                {availableActionCards
                  .filter((card) =>
                    getCardSearchText(card).includes(availableCourtSearch.trim().toLowerCase())
                  )
                  .length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{
                      marginBottom: '0.75rem',
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
                      paddingBottom: '0.35rem',
                    }}>
                      Events
                    </h3>
                    <CardGrid>
                      {availableActionCards
                        .filter((card) =>
                          getCardSearchText(card).includes(availableCourtSearch.trim().toLowerCase())
                        )
                        .map((card) => (
                          <CardTile
                            key={card.id}
                            actions={
                              <button
                                onClick={() => {
                                  playSound('cardMove');
                                  addActionCardToDeck(card);
                                  logAvailableCardMove(card, 'Action Deck', 'actionDeck', undefined, 'available');
                                }}
                              >
                                Add to Action Deck
                              </button>
                            }
                          >
                            <CardPicture card={card} />
                          </CardTile>
                        ))}
                    </CardGrid>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </aside>

      <aside
        className="panel"
        style={{
          width: '100%',
          maxWidth: 'none',
          boxSizing: 'border-box',
          alignSelf: 'stretch',
          position: 'relative',
        }}
      >
        <h2>Assigned Cards</h2>

        <SectionToggle
          title="Court"
          isOpen={showCourt}
          onToggle={() => setShowCourt((prev) => !prev)}
        />
        {showCourt && (
          <div className="subsection">
            {courtDeck.length === 0 ? (
              <p>No court cards.</p>
            ) : (
              <CardGrid>
                {sortById(courtDeck).map((card) => (
                  <CardTile
                    key={card.id}
                    actions={
                      <>
                        <button
                          style={SCRAP_BUTTON_STYLE}
                          onClick={() => {
                            playSound('cardMove');
                            scrapCourtCard(card.id);
                            logAvailableCardMove(card, 'Scrap Pile', 'scrapPile', undefined, 'court');
                          }}
                        >
                          Scrap
                        </button>
                        <button
                          onClick={() => {
                            playSound('cardMove');
                            removeCourtCardFromDeck(card.id);
                            logAvailableCardMove(card, 'Available Cards', 'available', undefined, 'court');
                          }}
                        >
                          Remove
                        </button>
                        {renderMoveCourtCardToPlayerButtons(card)}
                      </>
                    }
                  >
                    <CardPicture card={card} />
                  </CardTile>
                ))}
              </CardGrid>
            )}
          </div>
        )}

        <SectionToggle
          title="Laws"
          isOpen={showLaws}
          onToggle={() => setShowLaws((prev) => !prev)}
        />
        {showLaws && (
          <div className="subsection">
            {laws.length === 0 ? (
              <p>No laws.</p>
            ) : (
              <CardGrid>
                {sortById(laws).map((card) => (
                  <CardTile
                    key={card.id}
                    actions={
                      <>
                        <button
                          style={SCRAP_BUTTON_STYLE}
                          onClick={() => {
                            playSound('cardMove');
                            scrapRuleCard('laws', card.id);
                            logAvailableCardMove(card, 'Scrap Pile', 'scrapPile', undefined, 'laws');
                          }}
                        >
                          Scrap
                        </button>
                        <button
                          onClick={() => {
                            playSound('cardMove');
                            removeRuleCard('laws', card.id);
                            logAvailableCardMove(card, 'Available Cards', 'available', undefined, 'laws');
                          }}
                        >
                          Remove
                        </button>
                      </>
                    }
                  >
                    <CardPicture card={card} />
                  </CardTile>
                ))}
              </CardGrid>
            )}
          </div>
        )}

        <SectionToggle
          title="Edicts"
          isOpen={showEdicts}
          onToggle={() => setShowEdicts((prev) => !prev)}
        />
        {showEdicts && (
          <div className="subsection">
            {edicts.length === 0 ? (
              <p>No edicts.</p>
            ) : (
              <CardGrid>
                {sortById(edicts).map((card) => (
                  <CardTile
                    key={card.id}
                    actions={
                      <>
                        <button
                          style={SCRAP_BUTTON_STYLE}
                          onClick={() => {
                            playSound('cardMove');
                            scrapRuleCard('edicts', card.id);
                            logAvailableCardMove(card, 'Scrap Pile', 'scrapPile', undefined, 'edicts');
                          }}
                        >
                          Scrap
                        </button>
                        <button
                          onClick={() => {
                            playSound('cardMove');
                            removeRuleCard('edicts', card.id);
                            logAvailableCardMove(card, 'Available Cards', 'available', undefined, 'edicts');
                          }}
                        >
                          Remove
                        </button>
                      </>
                    }
                  >
                    <CardPicture card={card} />
                  </CardTile>
                ))}
              </CardGrid>
            )}
          </div>
        )}

        <SectionToggle
          title="Summit"
          isOpen={showSummit}
          onToggle={() => setShowSummit((prev) => !prev)}
        />
        {showSummit && (
          <div className="subsection">
            {summit.length === 0 ? (
              <p>No summit cards.</p>
            ) : (
              <CardGrid>
                {sortById(summit).map((card) => (
                  <CardTile
                    key={card.id}
                    actions={
                      <>
                        <button
                          style={SCRAP_BUTTON_STYLE}
                          onClick={() => {
                            playSound('cardMove');
                            scrapRuleCard('summit', card.id);
                            logAvailableCardMove(card, 'Scrap Pile', 'scrapPile', undefined, 'summit');
                          }}
                        >
                          Scrap
                        </button>
                        <button
                          onClick={() => {
                            playSound('cardMove');
                            removeRuleCard('summit', card.id);
                            logAvailableCardMove(card, 'Available Cards', 'available', undefined, 'summit');
                          }}
                        >
                          Remove
                        </button>
                      </>
                    }
                  >
                    <CardPicture card={card} />
                  </CardTile>
                ))}
              </CardGrid>
            )}
          </div>
        )}

        <SectionToggle
          title="Action Deck"
          isOpen={showActionDeck}
          onToggle={() => setShowActionDeck((prev) => !prev)}
        />
        {showActionDeck && (
          <div className="subsection">
            {actionDeck.length === 0 ? (
              <p>No action cards.</p>
            ) : (
              <CardGrid>
                {sortById(actionDeck).map((card) => (
                  <CardTile
                    key={card.id}
                    actions={
                      <>
                        <button
                          style={SCRAP_BUTTON_STYLE}
                          onClick={() => {
                            playSound('cardMove');
                            scrapActionCard(card.id);
                            logAvailableCardMove(card, 'Scrap Pile', 'scrapPile', undefined, 'actionDeck');
                          }}
                        >
                          Scrap
                        </button>
                        <button
                          onClick={() => {
                            playSound('cardMove');
                            removeActionCardFromDeck(card.id);
                            logAvailableCardMove(card, 'Available Cards', 'available', undefined, 'actionDeck');
                          }}
                        >
                          Remove
                        </button>
                      </>
                    }
                  >
                    <CardPicture card={card} />
                  </CardTile>
                ))}
              </CardGrid>
            )}
          </div>
        )}

        <SectionToggle
          title="Scrap Pile"
          isOpen={showScrapPile}
          onToggle={() => setShowScrapPile((prev) => !prev)}
        />
        {showScrapPile && (
          <div className="subsection">
            {scrapPile.length === 0 ? (
              <p>No scrapped cards.</p>
            ) : (
              <CardGrid>
                {sortById(scrapPile).map((card) => (
  <CardTile
    key={card.id}
    actions={
      <button
        onClick={() => {
          playSound('cardMove');
          removeCardFromScrapPile(card.id);
        }}
      >
        Move to Available
      </button>
    }
  >
    <CardPicture card={card} />
  </CardTile>
))}
              </CardGrid>
            )}
          </div>
        )}

      </aside>
      </div>

      <aside
        className="panel"
        style={{
          width: '100%',
          maxWidth: '18rem',
          boxSizing: 'border-box',
          alignSelf: 'start',
          position: 'sticky',
          top: '1rem',
          maxHeight: 'calc(100vh - 2rem)',
          overflowY: 'auto',
          background: '#242424',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            marginBottom: '0.65rem',
          }}
        >
          <h2 style={{ margin: 0 }}>Card Movement Log</h2>
          <button
            onClick={() => setClearLogWarningOpen(true)}
            disabled={availableCardMoveLog.length === 0}
            style={{
              flexShrink: 0,
              width: 'fit-content',
              padding: '0.2rem 0.45rem',
              fontSize: '0.75rem',
              lineHeight: 1,
            }}
          >
            Clear Log
          </button>
        </div>

        {clearLogWarningOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.65)',
              padding: '1rem',
            }}
            onClick={() => setClearLogWarningOpen(false)}
          >
            <div
              className="panel"
              style={{
                width: 'min(92vw, 24rem)',
                background: '#000',
                border: '1px solid rgba(255, 255, 255, 0.24)',
                borderRadius: '0.85rem',
                boxShadow: '0 18px 50px rgba(0, 0, 0, 0.65)',
                color: 'white',
                padding: '1rem',
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2 style={{ marginTop: 0 }}>Clear Log?</h2>
              <p>Are you sure you want to clear the log?</p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                  marginTop: '1rem',
                }}
              >
                <button onClick={() => setClearLogWarningOpen(false)}>Cancel</button>
                <button
                  onClick={() => {
                    playSound('panelClose');
                    setAvailableCardMoveLog([]);
                    setClearLogWarningOpen(false);
                  }}
                >
                  Clear Log
                </button>
              </div>
            </div>
          </div>
        )}

        {availableCardMoveLog.length === 0 ? (
          <p style={{ opacity: 0.75, margin: 0 }}>
            No cards moved yet.
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
            }}
          >
            {availableCardMoveLog.map((entry) => (
              <div
                key={entry.id}
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.14)',
                  paddingTop: '0.45rem',
                  lineHeight: 1.35,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{entry.cardLabel}</div>
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        Moved to{' '}
                      </span>
                      <span style={getMoveDestinationTextStyle(entry)}>
                        {entry.destination}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => undoAvailableCardMove(entry)}
                    style={{
                      flexShrink: 0,
                      width: 'fit-content',
                      padding: '0.2rem 0.45rem',
                      fontSize: '0.75rem',
                      lineHeight: 1,
                    }}
                  >
                    Undo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>

    </section>
  );
}
import { useMemo, useState } from 'react';
import { useGameStore } from '../gameStore';
import {
  allActionCards,
  allCourtCards,
  allEdictCards,
  allLawCards,
  allSummitCards,
} from '../CardData';
import type { ActionCard, CourtCard, GameCard, RuleCard } from '../gameState';
import GameCardView from './GameCardView';

const EMPTY_COURT_CARDS: CourtCard[] = [];
const EMPTY_RULE_CARDS: RuleCard[] = [];
const EMPTY_ACTION_CARDS: ActionCard[] = [];
const EMPTY_SCRAP_CARDS: GameCard[] = [];

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
      <button onClick={onToggle}>{isOpen ? `Hide ${title}` : `View ${title}`}</button>
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
      }}
    >
      {children}
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
        alignItems: 'flex-start',
      }}
    >
      {children}
      {actions ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.35rem',
          }}
        >
          {actions}
        </div>
      ) : null}
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

  const [showAvailableCourt, setShowAvailableCourt] = useState(false);
  const [showAvailableLaws, setShowAvailableLaws] = useState(false);
  const [showAvailableEdicts, setShowAvailableEdicts] = useState(false);
  const [showAvailableSummit, setShowAvailableSummit] = useState(false);
  const [showAvailableAction, setShowAvailableAction] = useState(false);

  const [showCourt, setShowCourt] = useState(false);
  const [showLaws, setShowLaws] = useState(false);
  const [showEdicts, setShowEdicts] = useState(false);
  const [showSummit, setShowSummit] = useState(false);
  const [showActionDeck, setShowActionDeck] = useState(false);
  const [showScrapPile, setShowScrapPile] = useState(false);

  const courtDeck = gameState.court?.inDeck ?? EMPTY_COURT_CARDS;
  const laws = gameState.rules?.laws ?? EMPTY_RULE_CARDS;
  const edicts = gameState.rules?.edicts ?? EMPTY_RULE_CARDS;
  const summit = gameState.rules?.summit ?? EMPTY_RULE_CARDS;
  const actionDeck = gameState.actionDeck?.inDeck ?? EMPTY_ACTION_CARDS;
  const scrapPile = gameState.scrapPile?.scrap ?? EMPTY_SCRAP_CARDS;

  const scrappedIds = useMemo(() => new Set(scrapPile.map((card) => card.id)), [scrapPile]);
  const courtIds = useMemo(() => new Set(courtDeck.map((card) => card.id)), [courtDeck]);
  const lawIds = useMemo(() => new Set(laws.map((card) => card.id)), [laws]);
  const edictIds = useMemo(() => new Set(edicts.map((card) => card.id)), [edicts]);
  const summitIds = useMemo(() => new Set(summit.map((card) => card.id)), [summit]);
  const actionDeckIds = useMemo(() => new Set(actionDeck.map((card) => card.id)), [actionDeck]);

  const availableCourtCards = useMemo(
    () =>
      sortById(
        allCourtCards.filter((card) => !courtIds.has(card.id) && !scrappedIds.has(card.id))
      ),
    [courtIds, scrappedIds]
  );

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

  const availableActionCards = useMemo(
    () =>
      sortById(
        allActionCards.filter((card) => !actionDeckIds.has(card.id) && !scrappedIds.has(card.id))
      ),
    [actionDeckIds, scrappedIds]
  );

  return (
    <section className="main-layout" style={{ marginTop: '1rem' }}>
      <aside className="panel">
        <h2>Available Cards</h2>

        <SectionToggle
          title="Available Court Cards"
          isOpen={showAvailableCourt}
          onToggle={() => setShowAvailableCourt((prev) => !prev)}
        />
        {showAvailableCourt && (
          <div className="subsection">
            {availableCourtCards.length === 0 ? (
              <p>No available court cards.</p>
            ) : (
              <CardGrid>
                {availableCourtCards.map((card) => (
                  <CardTile
                    key={card.id}
                    actions={<button onClick={() => addCourtCardToDeck(card)}>Add to Court</button>}
                  >
                    <GameCardView card={card} size="small" />
                  </CardTile>
                ))}
              </CardGrid>
            )}
          </div>
        )}

        <SectionToggle
          title="Available Laws"
          isOpen={showAvailableLaws}
          onToggle={() => setShowAvailableLaws((prev) => !prev)}
        />
        {showAvailableLaws && (
          <div className="subsection">
            {availableLawCards.length === 0 ? (
              <p>No available laws.</p>
            ) : (
              <CardGrid>
                {availableLawCards.map((card) => (
                  <CardTile
                    key={card.id}
                    actions={<button onClick={() => addRuleCard('laws', card)}>Add to Laws</button>}
                  >
                    <GameCardView card={card} size="small" />
                  </CardTile>
                ))}
              </CardGrid>
            )}
          </div>
        )}

        <SectionToggle
          title="Available Edicts"
          isOpen={showAvailableEdicts}
          onToggle={() => setShowAvailableEdicts((prev) => !prev)}
        />
        {showAvailableEdicts && (
          <div className="subsection">
            {availableEdictCards.length === 0 ? (
              <p>No available edicts.</p>
            ) : (
              <CardGrid>
                {availableEdictCards.map((card) => (
                  <CardTile
                    key={card.id}
                    actions={
                      <button onClick={() => addRuleCard('edicts', card)}>Add to Edicts</button>
                    }
                  >
                    <GameCardView card={card} size="small" />
                  </CardTile>
                ))}
              </CardGrid>
            )}
          </div>
        )}

        <SectionToggle
          title="Available Summit Cards"
          isOpen={showAvailableSummit}
          onToggle={() => setShowAvailableSummit((prev) => !prev)}
        />
        {showAvailableSummit && (
          <div className="subsection">
            {availableSummitCards.length === 0 ? (
              <p>No available summit cards.</p>
            ) : (
              <CardGrid>
                {availableSummitCards.map((card) => (
                  <CardTile
                    key={card.id}
                    actions={
                      <button onClick={() => addRuleCard('summit', card)}>Add to Summit</button>
                    }
                  >
                    <GameCardView card={card} size="small" />
                  </CardTile>
                ))}
              </CardGrid>
            )}
          </div>
        )}

        <SectionToggle
          title="Available Action Cards"
          isOpen={showAvailableAction}
          onToggle={() => setShowAvailableAction((prev) => !prev)}
        />
        {showAvailableAction && (
          <div className="subsection">
            {availableActionCards.length === 0 ? (
              <p>No available action cards.</p>
            ) : (
              <CardGrid>
                {availableActionCards.map((card) => (
                  <CardTile
                    key={card.id}
                    actions={
                      <button onClick={() => addActionCardToDeck(card)}>Add to Action Deck</button>
                    }
                  >
                    <GameCardView card={card} size="small" />
                  </CardTile>
                ))}
              </CardGrid>
            )}
          </div>
        )}
      </aside>

      <aside className="panel">
        <h2>Placed Cards</h2>

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
                        <button onClick={() => scrapCourtCard(card.id)}>Scrap</button>
                        <button onClick={() => removeCourtCardFromDeck(card.id)}>Remove</button>
                      </>
                    }
                  >
                    <GameCardView card={card} size="small" />
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
                        <button onClick={() => scrapRuleCard('laws', card.id)}>Scrap</button>
                        <button onClick={() => removeRuleCard('laws', card.id)}>Remove</button>
                      </>
                    }
                  >
                    <GameCardView card={card} size="small" />
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
                        <button onClick={() => scrapRuleCard('edicts', card.id)}>Scrap</button>
                        <button onClick={() => removeRuleCard('edicts', card.id)}>Remove</button>
                      </>
                    }
                  >
                    <GameCardView card={card} size="small" />
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
                        <button onClick={() => scrapRuleCard('summit', card.id)}>Scrap</button>
                        <button onClick={() => removeRuleCard('summit', card.id)}>Remove</button>
                      </>
                    }
                  >
                    <GameCardView card={card} size="small" />
                  </CardTile>
                ))}
              </CardGrid>
            )}
          </div>
        )}
      </aside>

      <aside className="panel">
        <h2>Other Zones</h2>

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
                        <button onClick={() => scrapActionCard(card.id)}>Scrap</button>
                        <button onClick={() => removeActionCardFromDeck(card.id)}>Remove</button>
                      </>
                    }
                  >
                    <GameCardView card={card} size="small" />
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
                  <CardTile key={card.id}>
                    <GameCardView card={card} size="small" />
                  </CardTile>
                ))}
              </CardGrid>
            )}
          </div>
        )}
      </aside>
    </section>
  );
}
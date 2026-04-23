import type { GameCard } from '../gameState';

interface GameCardViewProps {
  card: GameCard;
  size?: 'small' | 'medium' | 'large';
  showMeta?: boolean;
}

export default function GameCardView({
  card,
  size = 'medium',
  showMeta = true,
}: GameCardViewProps) {
  const width = size === 'small' ? 110 : size === 'large' ? 220 : 150;

  return (
    <div
      style={{
        width,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
      }}
    >
      <img
        src={card.image}
        alt={`${card.name} (${card.id})`}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.15)',
          background: '#111',
        }}
        onError={(e) => {
          const img = e.currentTarget;
          img.style.display = 'none';
          const fallback = img.nextElementSibling as HTMLElement | null;
          if (fallback) {
            fallback.style.display = 'flex';
          }
        }}
      />

      <div
        style={{
          display: 'none',
          width: '100%',
          aspectRatio: '2 / 3',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.15)',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0.75rem',
          background: '#1a1a1a',
          color: '#ddd',
          fontSize: '0.85rem',
        }}
      >
        Missing image
        <br />
        {card.id}
      </div>

      {showMeta && (
        <div style={{ fontSize: '0.85rem', lineHeight: 1.25 }}>
          <div>
            <strong>{card.id}</strong>
          </div>
          <div>{card.name}</div>
          {'type' in card ? <div>{card.type}</div> : null}
        </div>
      )}
    </div>
  );
}
import { getCardImage } from './cardImages';

type BaseCard = {
  id: string;
  name: string;
  type?: string;
  category: string;
  number?: number;
};

interface GameCardViewProps {
  card: BaseCard;
  size?: 'small' | 'medium' | 'large';
}

export default function GameCardView({
  card,
  size = 'medium',
}: GameCardViewProps) {
  const imageSrc = getCardImage(card.id);

  const width =
    size === 'small' ? 90 : size === 'large' ? 180 : 130;

  return (
    <div className="game-card-view">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={`${card.name} (${card.id})`}
          style={{
            width: `${width}px`,
            height: 'auto',
            display: 'block',
            borderRadius: '8px',
          }}
        />
      ) : (
        <div
          style={{
            width: `${width}px`,
            aspectRatio: '2 / 3',
            border: '1px solid #888',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem',
            textAlign: 'center',
          }}
        >
          Missing image for {card.id}
        </div>
      )}

      <div style={{ marginTop: '0.4rem', fontSize: '0.9rem' }}>
        <div>{card.id}</div>
        <div>{card.name}</div>
      </div>
    </div>
  );
}
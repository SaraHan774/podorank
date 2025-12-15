import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  hover = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-lg
        border border-neutral-200
        ${hover ? 'hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Wine Card - 와인 정보 표시용
interface WineCardProps {
  name: string;
  selectedBy?: string[];
  totalSelections?: number;
  image?: string;
}

export function WineCard({ name, selectedBy = [], totalSelections = 0, image }: WineCardProps) {
  return (
    <Card className="flex items-start gap-md">
      {/* 와인 아이콘/이미지 */}
      <div className="flex-shrink-0 w-12 h-12 bg-primary-700/10 rounded-md flex items-center justify-center">
        {image ? (
          <img src={image} alt={name} className="w-10 h-10 object-contain" />
        ) : (
          <span className="text-2xl">🍷</span>
        )}
      </div>

      {/* 와인 정보 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-h2 text-neutral-900 truncate">{name}</h3>
        {selectedBy.length > 0 ? (
          <p className="text-body-sm text-neutral-500 mt-xs">
            선택: {selectedBy.join(', ')}
          </p>
        ) : (
          <p className="text-body-sm text-neutral-500 mt-xs">
            아직 선택 없음
          </p>
        )}
      </div>

      {/* 선택 수 */}
      <div className="flex-shrink-0 text-right">
        <span className="text-h1 text-primary-700">{totalSelections}</span>
        <span className="text-body-sm text-neutral-500 block">회</span>
      </div>
    </Card>
  );
}

// Player Card - 플레이어 정보 표시용
interface PlayerCardProps {
  nickname: string;
  color: string;
  selections?: { [wineName: string]: number };
  isOnline?: boolean;
}

export function PlayerCard({ nickname, color, selections = {}, isOnline = true }: PlayerCardProps) {
  return (
    <Card className={`${!isOnline ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-md">
        {/* 아바타 (포도알 색상) */}
        <div
          className="w-10 h-10 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />

        {/* 닉네임 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-h2 text-neutral-900 truncate">{nickname}</h3>
          {!isOnline && (
            <span className="text-body-sm text-neutral-500">오프라인</span>
          )}
        </div>
      </div>

      {/* 선택 통계 */}
      {Object.keys(selections).length > 0 && (
        <div className="mt-md pt-md border-t border-neutral-100">
          <div className="flex flex-wrap gap-xs">
            {Object.entries(selections).map(([wineName, count]) => (
              <span
                key={wineName}
                className="inline-flex items-center px-sm py-xs bg-neutral-100 rounded-full text-body-sm"
              >
                {wineName}: {'⭐'.repeat(count)}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

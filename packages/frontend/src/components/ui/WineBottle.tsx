interface WineBottleProps {
  name: string;
  image?: string;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-20 h-28',
  md: 'w-32 h-48',
  lg: 'w-40 h-60',
};

export function WineBottle({
  name,
  image,
  selected = false,
  onClick,
  size = 'md',
}: WineBottleProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center p-lg
        transition-all duration-300 ease-out
        rounded-lg
        ${selected
          ? 'scale-105 shadow-lg ring-2 ring-success-500 bg-success-400/10'
          : 'hover:scale-102 hover:shadow-md bg-white/50'
        }
        focus:outline-none focus:ring-2 focus:ring-primary-500
        min-w-[120px]
      `}
      type="button"
    >
      {/* 와인병 이미지 또는 플레이스홀더 */}
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain"
          />
        ) : (
          <WineBottlePlaceholder selected={selected} />
        )}
      </div>

      {/* 와인 이름 */}
      <p className={`
        mt-sm text-body-sm font-semibold text-center
        max-w-[120px] truncate
        ${selected ? 'text-success-500' : 'text-neutral-700'}
      `}>
        {name}
      </p>

      {/* 선택됨 체크마크 */}
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

// 와인병 플레이스홀더 SVG
function WineBottlePlaceholder({ selected }: { selected: boolean }) {
  const bottleColor = selected ? '#10B981' : '#A91E2D';
  const labelColor = selected ? '#6EE7B7' : '#D4AF37';

  return (
    <svg viewBox="0 0 80 160" className="w-full h-full">
      {/* 병목 */}
      <rect x="32" y="0" width="16" height="30" rx="2" fill={bottleColor} />

      {/* 코르크 */}
      <rect x="34" y="0" width="12" height="10" rx="1" fill="#8B4513" />

      {/* 병 어깨 */}
      <path
        d="M32 30 L32 45 Q32 55 24 60 L24 60"
        fill="none"
        stroke={bottleColor}
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M48 30 L48 45 Q48 55 56 60 L56 60"
        fill="none"
        stroke={bottleColor}
        strokeWidth="16"
        strokeLinecap="round"
      />

      {/* 병 몸통 */}
      <rect x="16" y="55" width="48" height="95" rx="4" fill={bottleColor} />

      {/* 라벨 */}
      <rect x="20" y="75" width="40" height="50" rx="2" fill={labelColor} />

      {/* 라벨 디테일 */}
      <rect x="24" y="85" width="32" height="4" rx="1" fill="white" opacity="0.7" />
      <rect x="28" y="95" width="24" height="3" rx="1" fill="white" opacity="0.5" />
      <rect x="30" y="103" width="20" height="3" rx="1" fill="white" opacity="0.5" />

      {/* 하이라이트 */}
      <rect x="18" y="60" width="4" height="85" rx="2" fill="white" opacity="0.2" />
    </svg>
  );
}

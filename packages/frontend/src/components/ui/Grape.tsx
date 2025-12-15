interface GrapeProps {
  color?: string;
  size?: number;
  selected?: boolean;
  animated?: boolean;
  className?: string;
}

// 포도알 색상 팔레트 (10가지)
export const GRAPE_COLORS = [
  '#FF5733', // 빨강
  '#3357FF', // 파랑
  '#FFD433', // 노랑
  '#33FF57', // 초록
  '#6B3FA0', // 보라
  '#FF8C33', // 주황
  '#FF33A8', // 분홍
  '#8B4513', // 갈색
  '#6B7280', // 회색
  '#1F2937', // 검정
];

export function Grape({
  color = '#6B3FA0',
  size = 64,
  selected = false,
  animated = false,
  className = '',
}: GrapeProps) {
  const animationClass = animated ? 'animate-grape-bounce' : '';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`${animationClass} ${className}`}
      style={{ transition: 'transform 0.2s ease' }}
    >
      {/* 선택됨 표시 - 외부 링 */}
      {selected && (
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="none"
          stroke="#10B981"
          strokeWidth="3"
          opacity="0.8"
        />
      )}

      {/* 포도알 본체 - 그라데이션 */}
      <defs>
        <radialGradient id={`grape-gradient-${color.replace('#', '')}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor={lightenColor(color, 20)} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>

      {/* 메인 포도알 */}
      <circle
        cx="32"
        cy="32"
        r="26"
        fill={`url(#grape-gradient-${color.replace('#', '')})`}
      />

      {/* 하이라이트 (반사광) */}
      <ellipse
        cx="24"
        cy="24"
        rx="8"
        ry="6"
        fill="white"
        opacity="0.35"
      />

      {/* 작은 하이라이트 */}
      <circle
        cx="40"
        cy="42"
        r="3"
        fill="white"
        opacity="0.2"
      />

      {/* 선택됨 시 빛남 효과 */}
      {selected && (
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
          opacity="0.6"
        >
          <animate
            attributeName="r"
            values="26;28;26"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.6;0.3;0.6"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </svg>
  );
}

// 색상을 밝게 만드는 헬퍼 함수
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

// 랜덤 색상 선택 헬퍼
export function getRandomGrapeColor(): string {
  return GRAPE_COLORS[Math.floor(Math.random() * GRAPE_COLORS.length)];
}

// 인덱스로 색상 선택 (플레이어 순서 기반)
export function getGrapeColorByIndex(index: number): string {
  return GRAPE_COLORS[index % GRAPE_COLORS.length];
}

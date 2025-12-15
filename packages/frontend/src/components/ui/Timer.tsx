interface TimerProps {
  seconds: number;
  maxSeconds?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function Timer({ seconds, maxSeconds = 30, size = 'lg' }: TimerProps) {
  const isUrgent = seconds <= 5;
  const isCritical = seconds <= 3;

  const sizeClasses = {
    sm: 'text-h1',
    md: 'text-display',
    lg: 'text-[5rem]',
  };

  const colorClass = isCritical
    ? 'text-error animate-pulse'
    : isUrgent
    ? 'text-warning'
    : 'text-primary-700';

  // 진행률 계산 (원형 프로그레스용)
  const progress = (seconds / maxSeconds) * 100;
  const circumference = 2 * Math.PI * 45; // r = 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* 원형 프로그레스 바 */}
      <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
        {/* 배경 원 */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="6"
        />
        {/* 진행 원 */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={isCritical ? '#EF4444' : isUrgent ? '#F59E0B' : '#A91E2D'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>

      {/* 숫자 */}
      <span
        className={`
          absolute font-bold tabular-nums
          ${sizeClasses[size]}
          ${colorClass}
        `}
      >
        {seconds}
      </span>
    </div>
  );
}

// 간단한 인라인 타이머 (헤더용)
interface InlineTimerProps {
  seconds: number;
}

export function InlineTimer({ seconds }: InlineTimerProps) {
  const isUrgent = seconds <= 5;
  const isCritical = seconds <= 3;

  return (
    <span
      className={`
        font-bold text-h1 tabular-nums
        ${isCritical ? 'text-error animate-pulse' : isUrgent ? 'text-warning' : 'text-primary-700'}
      `}
    >
      {seconds}초
    </span>
  );
}

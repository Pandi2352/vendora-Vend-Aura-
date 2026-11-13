interface CircularProgressRingProps {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgressRing({
  completed,
  total,
  size = 84,
  strokeWidth = 7,
}: CircularProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? Math.min(1, Math.max(0, completed / total)) : 0;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-primary-100 fill-none"
          strokeWidth={strokeWidth}
        />
        {/* Progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-primary-600 fill-none transition-all duration-700 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      {/* Centered progress text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-900 select-none">
        <span className="font-mono font-black text-xl leading-none">{completed}</span>
        <span className="text-[0.625rem] font-bold text-zinc-500 tracking-wider mt-0.5">OF {total}</span>
      </div>
    </div>
  );
}


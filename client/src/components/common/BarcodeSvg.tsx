import { computeBarcodeBars } from '@/lib/barcode128';

interface BarcodeSvgProps {
  text: string;
  height?: number;
  className?: string;
}

export function BarcodeSvg({ text, height = 40, className = '' }: BarcodeSvgProps) {
  const { bars, totalWidth } = computeBarcodeBars(text);

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${height}`}
      className={`w-full max-w-[180px] h-auto ${className}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      aria-label={`Barcode: ${text}`}
    >
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.width} height={height} fill="currentColor" />
      ))}
    </svg>
  );
}


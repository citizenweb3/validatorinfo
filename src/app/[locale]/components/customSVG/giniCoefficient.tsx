interface GiniCoefficientSVGProps {
    value: number; // 0 to 100
}

export default function GiniCoefficientSVG({ value }: GiniCoefficientSVGProps) {
    const radius = 70;
    const strokeWidth = 40;
    const center = 95;
    const clampedValue = Math.max(0, Math.min(100, value));
    const startAngle = -90;
    const endAngle = (clampedValue / 100) * 360 + startAngle;
  
    const polarToCartesian = (
      centerX: number,
      centerY: number,
      radius: number,
      angleInDegrees: number
    ) => {
      const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      };
    };
  
    const describeArc = (
      x: number,
      y: number,
      radius: number,
      startAngle: number,
      endAngle: number
    ) => {
      const start = polarToCartesian(x, y, radius, endAngle);
      const end = polarToCartesian(x, y, radius, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
      return [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
      ].join(" ");
    };
  
    const interpolateColor = (t: number) => {
      const startColor = { r: 62, g: 62, b: 62 };
      const endColor = { r: 79, g: 184, b: 72 };
      const r = Math.round(startColor.r + (endColor.r - startColor.r) * t);
      const g = Math.round(startColor.g + (endColor.g - startColor.g) * t);
      const b = Math.round(startColor.b + (endColor.b - startColor.b) * t);
      return `rgb(${r}, ${g}, ${b})`;
    };
  
    const segments = 100;
    const anglePerSegment = 360 / segments;
    const arcPaths = [];
  
    for (let i = 0; i < segments; i++) {
      const segmentStartAngle = startAngle + i * anglePerSegment;
      const overlap = 0.5; // degrees — tweak this as needed
      const segmentEndAngle = startAngle + (i + 1) * anglePerSegment + overlap;
      if (segmentStartAngle <= endAngle) {
        const path = describeArc(
          center,
          center,
          radius,
          segmentStartAngle,
          Math.min(segmentEndAngle, endAngle)
        );
        const t = i / (segments - 1);
        const color = interpolateColor(t);
        arcPaths.push({ path, color });
      }
    }
  
    return (
      <div className="w-full max-w-[190px]">
        <svg
          viewBox="0 0 190 200"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {clampedValue > 0 &&
            arcPaths.map((arc, index) => (
              <path
                key={index}
                d={arc.path}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
              />
            ))}
  
          <text
            x={center}
            y={center + 6}
            textAnchor="middle"
            fontSize="24px"
            fill="white"
            fontFamily="var(--font-handjet)"
          >
            {clampedValue / 100}%
          </text>
        </svg>
      </div>
    );
  }
  
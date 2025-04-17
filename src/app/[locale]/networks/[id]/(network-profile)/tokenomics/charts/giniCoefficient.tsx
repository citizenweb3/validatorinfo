interface VotingPowerSVGProps {
    value: number; // 0 to 100
}

export default function GiniCoefficientSVG({ value }: VotingPowerSVGProps) {
    const radius = 70;
    const strokeWidth = 40;
    const center = 95;
    const clampedValue = Math.max(0, Math.min(100, value));

    const startAngle = -90; // 12 o'clock
    const endAngle = (clampedValue / 100) * 360 + startAngle;

    // Convert polar coordinates to cartesian
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

    // Describe arc path for <path d="">
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

    // Interpolate color between #3E3E3E (dark gray) and #4FB848 (green)
    const interpolateColor = (t: number) => {
        const startColor = { r: 62, g: 62, b: 62 }; // #3E3E3E
        const endColor = { r: 79, g: 184, b: 72 }; // #4FB848
        const r = Math.round(startColor.r + (endColor.r - startColor.r) * t);
        const g = Math.round(startColor.g + (endColor.g - startColor.g) * t);
        const b = Math.round(startColor.b + (endColor.b - startColor.b) * t);
        return `rgb(${r}, ${g}, ${b})`;
    };

    // Generate multiple arc segments
    const segments = 100; // Number of segments for smooth gradient
    const anglePerSegment = 360 / segments;
    const arcPaths = [];
    for (let i = 0; i < segments; i++) {
        const segmentStartAngle = startAngle + i * anglePerSegment;
        const segmentEndAngle = startAngle + (i + 1) * anglePerSegment;
        // Only include segments up to the desired endAngle
        if (segmentStartAngle <= endAngle) {
            const path = describeArc(
                center,
                center,
                radius,
                segmentStartAngle,
                Math.min(segmentEndAngle, endAngle)
            );
            const t = i / (segments - 1); // Normalize position to [0,1]
            const color = interpolateColor(t);
            arcPaths.push({ path, color });
        }
    }

    return (
        <svg
            width={190}
            height={200}
            viewBox="0 0 190 200"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Arc Segments */}
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

            {/* Center Text */}
            <text
                x={center}
                y={center + 6}
                textAnchor="middle"
                fontSize="24px"
                fill="white"
                fontFamily="Handjet"
                fontWeight=""
            >
                {clampedValue/100}%
            </text>
        </svg>
    );
}
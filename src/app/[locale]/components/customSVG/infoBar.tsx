import React, { useMemo } from "react";

interface customBarProps {
    value: number;
    color: string;
}

const customBar: React.FC<customBarProps> = ({ value, color }) => {
    const cx = 148;
    const cy = 148;
    const outerR = 128;
    const innerR = 120;
    const startDeg = 160;
    const endDeg = 20;
    const steps = 10;
    const rText = innerR - 50; // Numbers at radius 70 (where ticks were)
    const tickLen = 25;

    // Clamp value between 0 and 100
    const clampedValue = Math.max(0, Math.min(100, Math.round(value)));

    // Compute pointer angle: -70° at value 0, 70° at value 100, increment by 1.4° per value
    const angle = -70 + (clampedValue * 1.4);

    // Memoize tick angles
    const tickAngles = useMemo(
        () => [...Array(steps + 1)].map((_, i) => startDeg - ((startDeg - endDeg) / steps) * i),
        []
    );

    return (
        <svg
            style={{ width: "100%", height: "auto" }}
            viewBox="0 0 296 156"
            role="img"
            aria-label={`Gauge showing value ${clampedValue} out of 100`}
        >
            {/* Outer semicircle */}
            <path
                d={`M ${cx - outerR} ${cy} A ${outerR} ${outerR} 0 0 1 ${cx + outerR} ${cy}`}
                fill="#4F483F"
                stroke="#000"
                strokeWidth={0.50}
            />
            {/* Inner semicircle */}
            <path
                d={`M ${cx - innerR} ${cy} A ${innerR} ${innerR} 0 0 1 ${cx + innerR} ${cy}`}
                fill="#3E3E3E"
            />

            {/* Ticks and numbers */}
            {tickAngles.map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const rTickInner = rText + 10; // Ticks start at 80 (after 10-unit gap)
                const rTickOuter = rTickInner + tickLen; // Ticks end at 105

                const xInner = cx + rTickInner * Math.cos(rad);
                const yInner = cy - rTickInner * Math.sin(rad);
                const xOuter = cx + rTickOuter * Math.cos(rad);
                const yOuter = cy - rTickOuter * Math.sin(rad);

                // Use same angle for text as tick for alignment
                const degText = deg;
                const radText = (degText * Math.PI) / 180;
                const xText = cx + rText * Math.cos(radText);
                const yText = cy - rText * Math.sin(radText);

                // Tick color
                let tickColor = "#1E1E1E";
                if (i === 0) tickColor = "#EB1616";
                if (i === steps) tickColor = "#4FB848";
                if (i === Math.round(clampedValue / 10)) tickColor = color;

                // Thicker ticks for 0, 5, and 10
                const isThick = [0, 5, steps].includes(i);
                const tickWidth = isThick ? 5 : 2.5;
                const y1Adjust = isThick ? yInner : yInner;
                const y2Adjust = isThick ? yOuter : yOuter;

                return (
                    <g key={i}>
                        <line
                            x1={xInner}
                            y1={y1Adjust}
                            x2={xOuter}
                            y2={y2Adjust}
                            stroke={tickColor}
                            strokeWidth={tickWidth}
                            strokeLinecap="round"
                        />
                        <text
                            x={xText}
                            y={yText}
                            fill="#fff"
                            fontSize="12"
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="font-handjet"
                        >
                            {i}
                        </text>
                    </g>
                );
            })}

            {/* Pointer (smaller tick) */}
            <line
                x1={cx}
                y1={cy + 8}
                x2={cx}
                y2={cy - (innerR - 50)} // Smaller: radius 90
                stroke={color}
                strokeWidth={3}
                transform={`rotate(${angle} ${cx} ${cy})`}
            />

            {/* Center cap */}
            <circle cx={cx} cy={cy} r={5} fill="#1D1D1B" stroke="#000" strokeWidth={1} />
        </svg>
    );
};

export default React.memo(customBar);
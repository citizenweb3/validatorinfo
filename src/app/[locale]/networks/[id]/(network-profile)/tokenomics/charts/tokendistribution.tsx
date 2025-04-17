interface VotingPowerSVGProps {
    yes: number;
    no: number;
    veto: number;
    abstain: number;
}

export default function TokenDistributionSVG({
    yes,
    no,
    veto,
    abstain,
}: VotingPowerSVGProps) {
    const generateCircleProps = (value: number, radius: number) => {
        const clamped = Math.max(0, Math.min(100, value));
        const circumference = 2 * Math.PI * radius;
        const dash = (clamped / 100) * circumference;
        const gap = circumference - dash;
        return {
            strokeDasharray: `${dash} ${gap}`,
            strokeDashoffset: circumference / 4,
        };
    };

    const circles = [
        { radius: 57, stroke: "#4FB848B2", value: yes, strokeWidth: 6 },    // Green - Yes
        { radius: 45, stroke: "#EB1616B2", value: no,strokeWidth: 6 },     // Red - No
        { radius: 33, stroke: "#E5C46BB2", value: veto,strokeWidth: 5.5 },   // Yellow - Veto
        { radius: 21, stroke: "#2077E0B2", value: abstain, strokeWidth: 5 },// Blue - Abstain
    ];

    return (
        <div className="w-full max-w-[600px] mx-auto">
            <svg viewBox="0 0 400 160"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-auto block"
                xmlns="http://www.w3.org/2000/svg">
                {/* Circles (start from top using rotation) */}
                {circles.map(({ radius, stroke, value,strokeWidth }, index) => {
                    const { strokeDasharray, strokeDashoffset } = generateCircleProps(value, radius);
                    return (
                        <circle
                            key={index}
                            cx="60"
                            cy="70"
                            r={radius}
                            fill="none"
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(0 100 100)"
                        />
                    );
                })}

                {/* Legend Group — Voting Period + Boxes */}
                <g transform="translate(140, -10)"> {/* Move everything to the left */}
                    {/* Legend Items — stacked below with spacing */}
                    {[
                        { label: "community", color: "#4FB848B2", y: 41.5},
                        { label: "staking rewards", color: "#EB1616B2", y: 64.5 },
                        { label: "VCs", color: "#E5C46BB2", y: 88 },
                        { label: "other", color: "#2077E0B2", y: 111.5 },
                    ].map(({ label, color, y }, i) => (
                        <g key={i} transform={`translate(30, ${y})`}>
                            <rect x="0" y="0" width="12" height="12" fill={color} stroke="white" strokeOpacity="0.9" />
                            <text
                                x="18"
                                y="10"
                                fontFamily="Squarified, sans-serif"
                                fontSize="10.75"
                                letterSpacing="1"
                                style={{ textTransform: 'lowercase' }}
                                fill="white"
                                fillOpacity="0.9"
                            >
                                {label}
                            </text>
                        </g>
                    ))}
                </g>
            </svg>
        </div>
    );
}

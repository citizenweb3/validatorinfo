interface TokenDistributionSVGProps {
    Community: number;
    Team: number;
    Vc: number;
    Inflation: number;
}

export default function TokenDistributionSVG({
    Community,
    Team,
    Vc,
    Inflation,
  }: TokenDistributionSVGProps) {
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
      { radius: 57, stroke: "#4FB848B2", value: Community, strokeWidth: 6 },
      { radius: 45, stroke: "#EB1616B2", value: Team, strokeWidth: 6 },
      { radius: 33, stroke: "#E5C46BB2", value: Vc, strokeWidth: 5.5 },
      { radius: 21, stroke: "#2077E0B2", value: Inflation, strokeWidth: 5 },
    ];
  
    return (
      <div className="w-full max-w-[600px] mx-auto">
        <svg
          viewBox="0 0 400 160"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {circles.map(({ radius, stroke, value, strokeWidth }, index) => {
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
  
          <g transform="translate(140, -10)">
            {[
              { label: "community", color: "#4FB848B2", y: 41.5 },
              { label: "staking rewards", color: "#EB1616B2", y: 64.5 },
              { label: "VCs", color: "#E5C46BB2", y: 88 },
              { label: "other", color: "#2077E0B2", y: 111.5 },
            ].map(({ label, color, y }, i) => (
              <g key={i} transform={`translate(30, ${y})`}>
                <rect x="0" y="0" width="12" height="12" fill={color} stroke="white" strokeOpacity="0.9" />
                <text
                  x="18"
                  y="10"
                  fontFamily="var(--font-sfpro)"
                  fontSize="10.75"
                  letterSpacing="1"
                  style={{ textTransform: 'uppercase' }}
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
  
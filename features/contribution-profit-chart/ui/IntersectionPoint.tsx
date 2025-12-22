interface IntersectionPointProps {
  cx?: number;
  cy?: number;
  payload?: {
    label: string;
  };
}

export function IntersectionPoint({ cx, cy, payload }: IntersectionPointProps) {
  if (!cx || !cy || !payload) return null;
  
  return (
    <g>
      {/* 포인터 원 */}
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#FFFFFF"
        stroke="#191F28"
        strokeWidth={2}
      />
      {/* SMP 값 텍스트 (큰 글씨) */}
      <text
        x={cx}
        y={cy - 20}
        textAnchor="middle"
        fill="#191F28"
        fontSize={18}
        fontWeight="bold"
      >
        {payload.label}
      </text>
    </g>
  );
}


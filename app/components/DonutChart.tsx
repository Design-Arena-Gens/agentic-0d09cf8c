"use client";

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  segments: DonutSegment[];
  total: number;
}

export function DonutChart({ title, segments, total }: DonutChartProps) {
  let cumulative = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="chart-card" aria-label={`${title} donut chart`}>
      <div className="chart-card__header">
        <h3>{title}</h3>
        <p>{total}</p>
      </div>
      <div className="chart-card__donut">
        <svg
          viewBox="0 0 120 120"
          role="img"
          aria-hidden="true"
          className="chart-card__canvas"
        >
          <g transform="translate(60,60)">
            {segments.map((segment) => {
              const { value, color, label } = segment;
              const offset = (cumulative / total) * circumference;
              const length = (value / total) * circumference;
              cumulative += value;
              return (
                <circle
                  key={label}
                  r={radius}
                  fill="transparent"
                  stroke={color}
                  strokeWidth={14}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                />
              );
            })}
            <circle r={radius - 14} fill="var(--background)" />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="18"
              fill="var(--text-primary)"
            >
              {total}
            </text>
          </g>
        </svg>
        <ul className="chart-card__legend">
          {segments.map((segment) => (
            <li key={segment.label}>
              <span
                className="chart-card__legend-dot"
                style={{ backgroundColor: segment.color }}
              />
              <span>{segment.label}</span>
              <span>{segment.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

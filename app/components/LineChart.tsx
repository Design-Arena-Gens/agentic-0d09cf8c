"use client";

interface ChartDatum {
  label: string;
  value: number;
}

interface LineChartProps {
  title: string;
  data: ChartDatum[];
  yMax?: number;
}

export function LineChart({ title, data, yMax }: LineChartProps) {
  const maxValue = yMax ?? Math.max(...data.map((item) => item.value), 1);
  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1 || 1)) * 100;
      const y = 100 - (item.value / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="chart-card" aria-label={`${title} line chart`}>
      <div className="chart-card__header">
        <h3>{title}</h3>
        <p>{`${data[data.length - 1]?.value ?? 0}%`}</p>
      </div>
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-hidden="true"
        className="chart-card__canvas"
      >
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-accent)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--chart-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="var(--chart-accent)"
          strokeWidth="2"
          points={points}
        />
        <polygon
          fill="url(#lineGradient)"
          points={`${points} 100,100 0,100`}
        />
        {data.map((item, index) => {
          const x = (index / (data.length - 1 || 1)) * 100;
          const y = 100 - (item.value / maxValue) * 100;
          return (
            <g key={item.label}>
              <circle
                cx={x}
                cy={y}
                r={2.2}
                fill="var(--chart-accent)"
                stroke="var(--background)"
                strokeWidth="0.8"
              />
            </g>
          );
        })}
      </svg>
      <ul className="chart-card__axis">
        {data.map((item) => (
          <li key={item.label}>{item.label}</li>
        ))}
      </ul>
    </div>
  );
}

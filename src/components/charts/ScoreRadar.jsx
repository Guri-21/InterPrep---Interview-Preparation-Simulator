import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

export default function ScoreRadar({ data, height = 260 }) {
  // data: [{ axis, value }]
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="78%">
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: 'rgba(232,232,238,0.7)', fontSize: 11 }}
          stroke="rgba(255,255,255,0.08)"
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: 'rgba(232,232,238,0.4)', fontSize: 9 }}
          stroke="rgba(255,255,255,0.08)"
        />
        <Radar
          dataKey="value"
          stroke="#6b6fff"
          strokeWidth={1.5}
          fill="url(#radar-grad)"
          fillOpacity={0.55}
          isAnimationActive
          animationDuration={900}
        />
        <defs>
          <linearGradient id="radar-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor="#6b6fff" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.3} />
          </linearGradient>
        </defs>
      </RadarChart>
    </ResponsiveContainer>
  );
}

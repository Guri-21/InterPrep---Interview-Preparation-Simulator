import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';

const COLORS = ['#6b6fff', '#22d3ee', '#a78bfa', '#34d399', '#f59e0b', '#f87171'];

function Tt({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-[11.5px]">
      <div className="text-ink-300 mb-1">{label}</div>
      <div className="text-ink-100 font-medium">Avg score: {payload[0].value}</div>
      <div className="text-ink-400">{payload[0].payload.count} sessions</div>
    </div>
  );
}

export default function DomainComparison({ data, height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -10 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="domainLabel"
          stroke="rgba(232,232,238,0.45)"
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis
          domain={[0, 100]}
          stroke="rgba(232,232,238,0.4)"
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip content={<Tt />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="avgOverall" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={700}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

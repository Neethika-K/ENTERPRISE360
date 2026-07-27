'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TrendChart({
  title,
  data,
  color = '#f5a524',
}: {
  title: string;
  data: { label: string; value: number }[];
  color?: string;
}) {
  return (
    <div className="panel p-4">
      <div className="eyebrow mb-3">{title}</div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="#26324a" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8a98b0', fontFamily: 'var(--font-plex-mono)' }} stroke="#26324a" />
          <YAxis tick={{ fontSize: 11, fill: '#8a98b0', fontFamily: 'var(--font-plex-mono)' }} stroke="#26324a" width={52} />
          <Tooltip
            contentStyle={{
              background: '#141c2b',
              border: '1px solid #26324a',
              borderRadius: 4,
              fontFamily: 'var(--font-plex-mono)',
              fontSize: 12,
            }}
            labelStyle={{ color: '#8a98b0' }}
            itemStyle={{ color: '#e8edf5' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { label: string; volume: number };

export function WeeklyVolumeChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted">
        Sem dados ainda. Registre um treino para ver seu volume.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262b34" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="#8b93a1"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#8b93a1"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${Math.round(v / 1000)}k`}
        />
        <Tooltip
          cursor={{ fill: "rgba(194,245,66,0.08)" }}
          contentStyle={{
            background: "#131519",
            border: "1px solid #262b34",
            borderRadius: 12,
            color: "#eef1f5",
          }}
          formatter={(value: unknown) => [
            `${Math.round(Number(value)).toLocaleString("pt-BR")} kg`,
            "Volume",
          ]}
        />
        <Bar dataKey="volume" fill="#c2f542" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

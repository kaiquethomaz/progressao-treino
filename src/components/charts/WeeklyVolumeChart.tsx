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
        <CartesianGrid strokeDasharray="3 3" stroke="#263143" vertical={false} />
        <XAxis
          dataKey="label"
          stroke="#93a1b5"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#93a1b5"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${Math.round(v / 1000)}k`}
        />
        <Tooltip
          cursor={{ fill: "rgba(52,211,153,0.08)" }}
          contentStyle={{
            background: "#131a26",
            border: "1px solid #263143",
            borderRadius: 12,
            color: "#e7edf5",
          }}
          formatter={(value: unknown) => [
            `${Math.round(Number(value)).toLocaleString("pt-BR")} kg`,
            "Volume",
          ]}
        />
        <Bar dataKey="volume" fill="#34d399" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

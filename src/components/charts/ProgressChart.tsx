"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = {
  label: string;
  maxWeight: number;
  est1RM: number;
};

export function ProgressChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted">
        Nenhum registro para este exercício ainda.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          stroke="var(--muted)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="var(--muted)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}kg`}
          domain={["dataMin - 5", "dataMax + 5"]}
        />
        <Tooltip
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            color: "var(--foreground)",
          }}
          formatter={(value: unknown, name: unknown) => [
            `${Math.round(Number(value) * 10) / 10} kg`,
            name === "maxWeight" ? "Carga máxima" : "1RM estimado",
          ]}
        />
        <Legend
          formatter={(value) =>
            value === "maxWeight" ? "Carga máxima" : "1RM estimado"
          }
          wrapperStyle={{ fontSize: 12, color: "#93a1b5" }}
        />
        <Line
          type="monotone"
          dataKey="maxWeight"
          stroke="var(--accent)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "var(--accent)" }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="est1RM"
          stroke="var(--chart-2)"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

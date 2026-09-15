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
          tickFormatter={(v) => `${v}kg`}
          domain={["dataMin - 5", "dataMax + 5"]}
        />
        <Tooltip
          contentStyle={{
            background: "#131519",
            border: "1px solid #262b34",
            borderRadius: 12,
            color: "#eef1f5",
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
          stroke="#c2f542"
          strokeWidth={2.5}
          dot={{ r: 3, fill: "#c2f542" }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="est1RM"
          stroke="#38bdf8"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

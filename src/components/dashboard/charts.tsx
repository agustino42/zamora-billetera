"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { demoMintBurnSeries } from "@/lib/mock-data";

const axisStyle = { fontSize: 11, fill: "currentColor" };

export function MintBurnChart() {
  return (
    <div className="h-72 w-full text-muted-foreground">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={demoMintBurnSeries}>
          <defs>
            <linearGradient id="mint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#FF6A00" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="burn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F5B700" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#F5B700" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={44} />
          <Tooltip
            contentStyle={{
              background: "#0B0B0B",
              border: "1px solid #262626",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "#fff" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="minted"
            name="Acuñado"
            stroke="#FF6A00"
            strokeWidth={2}
            fill="url(#mint)"
          />
          <Area
            type="monotone"
            dataKey="burned"
            name="Quemado"
            stroke="#F5B700"
            strokeWidth={2}
            fill="url(#burn)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const distribution = [
  { name: "En circulación", value: 394160, color: "#FF6A00" },
  { name: "Quemado", value: 92340, color: "#F5B700" },
  { name: "Reservas tesorería", value: 68000, color: "#22C55E" },
];

export function DistributionChart() {
  return (
    <div className="h-64 w-full text-muted-foreground">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={distribution}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
          >
            {distribution.map((d) => (
              <Cell key={d.name} fill={d.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#0B0B0B",
              border: "1px solid #262626",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "#fff" }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

const sourceData = [
  { source: "Notas", amount: 184000 },
  { source: "Tareas", amount: 96000 },
  { source: "Asistencia", amount: 64000 },
  { source: "Foro", amount: 28000 },
  { source: "Manual", amount: 14500 },
];

export function EmissionSourcesChart() {
  return (
    <div className="h-64 w-full text-muted-foreground">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sourceData}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
          <XAxis dataKey="source" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={44} />
          <Tooltip
            contentStyle={{
              background: "#0B0B0B",
              border: "1px solid #262626",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "#fff" }}
            cursor={{ fill: "currentColor", fillOpacity: 0.05 }}
          />
          <Bar dataKey="amount" name="ZAM acuñado" fill="#FF6A00" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

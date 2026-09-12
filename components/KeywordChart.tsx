"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useChartColors } from "@/lib/useChartColors";
import type { KeywordFrequency } from "@/types/youtube";

interface KeywordChartProps {
  keywords: KeywordFrequency[];
}

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: KeywordFrequency }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-card-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">#{row.keyword}</p>
      <p className="mt-1 text-accent-strong">{row.count}회 언급</p>
    </div>
  );
}

export function KeywordChart({ keywords }: KeywordChartProps) {
  const colors = useChartColors();
  const data = [...keywords].reverse();

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        표시할 데이터가 없습니다.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, data.length * 34)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 24, bottom: 4, left: 4 }}
        barCategoryGap={10}
      >
        <CartesianGrid
          horizontal={false}
          stroke={colors.grid}
          strokeDasharray="0"
        />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fill: colors.text, fontSize: 11 }}
          stroke={colors.grid}
        />
        <YAxis
          type="category"
          dataKey="keyword"
          width={110}
          tick={{ fill: colors.text, fontSize: 11 }}
          stroke={colors.grid}
        />
        <Tooltip content={<TooltipContent />} cursor={{ fill: colors.accentSoft }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map((row) => (
            <Cell key={row.keyword} fill={colors.accent} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

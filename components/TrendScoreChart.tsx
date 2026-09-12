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
import { truncate } from "@/lib/format";
import type { VideoData } from "@/types/youtube";

interface TrendScoreChartProps {
  videos: VideoData[];
}

interface ChartRow {
  id: string;
  label: string;
  title: string;
  channelTitle: string;
  trendScore: number;
}

function TooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartRow }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-card-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="max-w-[220px] font-medium text-foreground">{row.title}</p>
      <p className="mt-0.5 text-muted">{row.channelTitle}</p>
      <p className="mt-1 font-semibold text-accent-strong">
        Trend Score {row.trendScore}
      </p>
    </div>
  );
}

export function TrendScoreChart({ videos }: TrendScoreChartProps) {
  const colors = useChartColors();

  const data: ChartRow[] = videos
    .slice(0, 10)
    .map((v) => ({
      id: v.id,
      label: truncate(v.title, 16),
      title: v.title,
      channelTitle: v.channelTitle,
      trendScore: v.trendScore,
    }))
    .reverse();

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
          domain={[0, 100]}
          tick={{ fill: colors.text, fontSize: 11 }}
          stroke={colors.grid}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={160}
          tick={{ fill: colors.text, fontSize: 11 }}
          stroke={colors.grid}
        />
        <Tooltip content={<TooltipContent />} cursor={{ fill: colors.accentSoft }} />
        <Bar dataKey="trendScore" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map((row) => (
            <Cell key={row.id} fill={colors.accent} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

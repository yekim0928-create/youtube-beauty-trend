import { StatCard } from "@/components/StatCard";
import { formatCompactNumber, formatPercent } from "@/lib/format";
import type { TimeWindow, TrendStats } from "@/types/youtube";

interface StatsRowProps {
  stats: TrendStats;
  window: TimeWindow;
}

export function StatsRow({ stats, window }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="평균 Trend Score"
        value={stats.avgTrendScore.toFixed(1)}
        hint={`최근 ${window}일 기준`}
        accent
      />
      <StatCard
        label="분석 영상 수"
        value={formatCompactNumber(stats.videoCount)}
        hint="수집된 고유 영상"
      />
      <StatCard
        label="총 조회수"
        value={formatCompactNumber(stats.totalViews)}
        hint={`좋아요 ${formatCompactNumber(stats.totalLikes)}`}
      />
      <StatCard
        label="평균 참여율"
        value={formatPercent(stats.avgEngagementRate)}
        hint="(좋아요+댓글) / 조회수"
      />
    </div>
  );
}

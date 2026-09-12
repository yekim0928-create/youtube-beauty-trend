import {
  formatCompactNumber,
  formatRelativeDate,
  truncate,
} from "@/lib/format";
import type { VideoData } from "@/types/youtube";

interface RisingVideoRowProps {
  video: VideoData;
  rank: number;
}

export function RisingVideoRow({ video, rank }: RisingVideoRowProps) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-accent-soft/60"
    >
      <span className="font-display text-lg font-semibold text-accent-strong">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {truncate(video.title, 56)}
        </p>
        <p className="text-xs text-muted">
          {video.channelTitle} · {formatRelativeDate(video.publishedAt)}
        </p>
      </div>
      <div className="shrink-0 text-right text-xs">
        <p className="font-semibold text-foreground">
          시간당 +{formatCompactNumber(video.viewVelocity / 24)}
        </p>
        <p className="text-muted">{formatCompactNumber(video.viewCount)} 조회</p>
      </div>
    </a>
  );
}

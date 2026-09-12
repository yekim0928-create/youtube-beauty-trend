import Image from "next/image";
import {
  formatCompactNumber,
  formatPercent,
  formatRelativeDate,
  truncate,
} from "@/lib/format";
import type { VideoData } from "@/types/youtube";

interface VideoCardProps {
  video: VideoData;
  rank: number;
}

export function VideoCard({ video, rank }: VideoCardProps) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm shadow-black/[0.02] transition-transform hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-accent-soft">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : null}
        <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/80 font-display text-sm font-semibold text-background">
          {rank}
        </span>
        <span className="absolute right-2 top-2 rounded-full bg-accent-strong px-2 py-0.5 text-[11px] font-semibold text-white">
          Score {video.trendScore}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {video.title}
        </h3>
        <p className="text-xs text-muted">{truncate(video.channelTitle, 30)}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted">
          <span>👁 {formatCompactNumber(video.viewCount)}</span>
          <span>♥ {formatCompactNumber(video.likeCount)}</span>
          <span>{formatPercent(video.engagementRate)}</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted">
          <span>{formatRelativeDate(video.publishedAt)}</span>
          {video.matchedKeywords[0] && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent-strong">
              #{video.matchedKeywords[0]}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

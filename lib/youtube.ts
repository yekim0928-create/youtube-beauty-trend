import { extractTopKeywords } from "@/lib/keywords";
import type {
  KeywordFrequency,
  TimeWindow,
  TrendApiResponse,
  TrendStats,
  VideoData,
} from "@/types/youtube";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const RESULTS_PER_KEYWORD = 15;
const MAX_TOP_LIST = 10;

export const DEFAULT_KEYWORDS = ["메이크업", "스킨케어", "화장품", "K-Beauty"];

interface YouTubeSearchItem {
  id?: { videoId?: string };
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
  error?: { message?: string };
}

interface YouTubeVideoItem {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    channelId?: string;
    publishedAt?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

interface YouTubeVideosResponse {
  items?: YouTubeVideoItem[];
  error?: { message?: string };
}

class YouTubeApiError extends Error {}

async function youtubeFetch<T>(
  path: string,
  params: Record<string, string>,
): Promise<T> {
  const url = new URL(`${YOUTUBE_API_BASE}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  const json = (await res.json()) as T & { error?: { message?: string } };

  if (!res.ok) {
    const message = json?.error?.message ?? `YouTube API 요청 실패 (${res.status})`;
    throw new YouTubeApiError(message);
  }

  return json;
}

async function searchVideoIdsForKeyword(
  keyword: string,
  publishedAfter: string,
  apiKey: string,
): Promise<{ keyword: string; ids: string[] }> {
  const data = await youtubeFetch<YouTubeSearchResponse>("search", {
    part: "snippet",
    type: "video",
    order: "viewCount",
    maxResults: String(RESULTS_PER_KEYWORD),
    q: keyword,
    publishedAfter,
    key: apiKey,
  });

  const ids = (data.items ?? [])
    .map((item) => item.id?.videoId)
    .filter((id): id is string => Boolean(id));

  return { keyword, ids };
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function fetchVideoDetails(
  ids: string[],
  apiKey: string,
): Promise<YouTubeVideoItem[]> {
  const batches = chunk(ids, 50);
  const results = await Promise.all(
    batches.map((batch) =>
      youtubeFetch<YouTubeVideosResponse>("videos", {
        part: "snippet,statistics",
        id: batch.join(","),
        key: apiKey,
      }),
    ),
  );
  return results.flatMap((r) => r.items ?? []);
}

function pickThumbnail(item: YouTubeVideoItem): string {
  const thumbs = item.snippet?.thumbnails;
  return (
    thumbs?.high?.url ?? thumbs?.medium?.url ?? thumbs?.default?.url ?? ""
  );
}

function toNumber(value: string | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function minMaxNormalize(values: number[]): (v: number) => number {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max - min < 1e-9) return () => 50;
  return (v: number) => ((v - min) / (max - min)) * 100;
}

function buildVideoData(
  items: YouTubeVideoItem[],
  keywordByVideoId: Map<string, Set<string>>,
): VideoData[] {
  const now = Date.now();

  const partial = items.map((item) => {
    const viewCount = toNumber(item.statistics?.viewCount);
    const likeCount = toNumber(item.statistics?.likeCount);
    const commentCount = toNumber(item.statistics?.commentCount);
    const publishedAt = item.snippet?.publishedAt ?? new Date().toISOString();
    const ageDays = Math.max(
      1 / 24,
      (now - new Date(publishedAt).getTime()) / 86_400_000,
    );
    const viewVelocity = viewCount / ageDays;
    const engagementRate =
      viewCount > 0 ? (likeCount + commentCount) / viewCount : 0;

    return {
      id: item.id,
      title: item.snippet?.title ?? "(제목 없음)",
      description: item.snippet?.description ?? "",
      channelTitle: item.snippet?.channelTitle ?? "알 수 없음",
      channelId: item.snippet?.channelId ?? "",
      publishedAt,
      thumbnail: pickThumbnail(item),
      url: `https://www.youtube.com/watch?v=${item.id}`,
      viewCount,
      likeCount,
      commentCount,
      matchedKeywords: Array.from(keywordByVideoId.get(item.id) ?? []),
      ageDays,
      viewVelocity,
      engagementRate,
    };
  });

  const velocityScores = minMaxNormalize(
    partial.map((v) => Math.log10(v.viewVelocity + 1)),
  );
  const engagementScores = minMaxNormalize(
    partial.map((v) => Math.min(v.engagementRate, 0.2)),
  );

  return partial.map((v) => {
    const velocityScore = velocityScores(Math.log10(v.viewVelocity + 1));
    const engagementScore = engagementScores(Math.min(v.engagementRate, 0.2));
    const trendScore = Math.round(velocityScore * 0.65 + engagementScore * 0.35);
    return { ...v, trendScore };
  });
}

function computeStats(videos: VideoData[]): TrendStats {
  if (videos.length === 0) {
    return {
      videoCount: 0,
      totalViews: 0,
      totalLikes: 0,
      avgEngagementRate: 0,
      avgTrendScore: 0,
    };
  }

  const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
  const totalLikes = videos.reduce((sum, v) => sum + v.likeCount, 0);
  const avgEngagementRate =
    videos.reduce((sum, v) => sum + v.engagementRate, 0) / videos.length;
  const avgTrendScore =
    videos.reduce((sum, v) => sum + v.trendScore, 0) / videos.length;

  return {
    videoCount: videos.length,
    totalViews,
    totalLikes,
    avgEngagementRate,
    avgTrendScore,
  };
}

export async function buildTrendReport(
  keywords: string[],
  windowDays: TimeWindow,
  apiKey: string,
): Promise<TrendApiResponse> {
  const cleanKeywords = Array.from(
    new Set(keywords.map((k) => k.trim()).filter(Boolean)),
  ).slice(0, 6);

  if (cleanKeywords.length === 0) {
    throw new YouTubeApiError("검색 키워드가 없습니다.");
  }

  const publishedAfter = new Date(
    Date.now() - windowDays * 86_400_000,
  ).toISOString();

  const searchResults = await Promise.all(
    cleanKeywords.map((keyword) =>
      searchVideoIdsForKeyword(keyword, publishedAfter, apiKey),
    ),
  );

  const keywordByVideoId = new Map<string, Set<string>>();
  for (const { keyword, ids } of searchResults) {
    for (const id of ids) {
      if (!keywordByVideoId.has(id)) keywordByVideoId.set(id, new Set());
      keywordByVideoId.get(id)!.add(keyword);
    }
  }

  const uniqueIds = Array.from(keywordByVideoId.keys());

  if (uniqueIds.length === 0) {
    return {
      window: windowDays,
      keywordsUsed: cleanKeywords,
      stats: computeStats([]),
      topVideos: [],
      risingVideos: [],
      topKeywords: [],
      fetchedAt: new Date().toISOString(),
    };
  }

  const details = await fetchVideoDetails(uniqueIds, apiKey);
  const videos = buildVideoData(details, keywordByVideoId);

  const topVideos = [...videos]
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, MAX_TOP_LIST);

  const risingVideos = [...videos]
    .sort((a, b) => b.viewVelocity - a.viewVelocity)
    .slice(0, MAX_TOP_LIST);

  const topKeywords: KeywordFrequency[] = extractTopKeywords(
    videos.flatMap((v) => [v.title, v.description]),
    cleanKeywords,
    MAX_TOP_LIST,
  );

  return {
    window: windowDays,
    keywordsUsed: cleanKeywords,
    stats: computeStats(videos),
    topVideos,
    risingVideos,
    topKeywords,
    fetchedAt: new Date().toISOString(),
  };
}

export { YouTubeApiError };

export type TimeWindow = 7 | 30;

export interface VideoData {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnail: string;
  url: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  matchedKeywords: string[];
  ageDays: number;
  viewVelocity: number;
  engagementRate: number;
  trendScore: number;
}

export interface KeywordFrequency {
  keyword: string;
  count: number;
}

export interface TrendStats {
  videoCount: number;
  totalViews: number;
  totalLikes: number;
  avgEngagementRate: number;
  avgTrendScore: number;
}

export interface TrendApiResponse {
  window: TimeWindow;
  keywordsUsed: string[];
  stats: TrendStats;
  topVideos: VideoData[];
  risingVideos: VideoData[];
  topKeywords: KeywordFrequency[];
  fetchedAt: string;
}

export interface TrendApiError {
  error: string;
}

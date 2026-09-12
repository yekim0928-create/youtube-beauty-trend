"use client";

import { useCallback, useEffect, useState } from "react";
import { KeywordChart } from "@/components/KeywordChart";
import { KeywordControls } from "@/components/KeywordControls";
import { RisingVideoRow } from "@/components/RisingVideoRow";
import { StatsRow } from "@/components/StatsRow";
import { TrendScoreChart } from "@/components/TrendScoreChart";
import { VideoCard } from "@/components/VideoCard";
import { DEFAULT_KEYWORDS } from "@/lib/youtube";
import type { TimeWindow, TrendApiResponse } from "@/types/youtube";

export default function Home() {
  const [selectedKeywords, setSelectedKeywords] =
    useState<string[]>(DEFAULT_KEYWORDS);
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [windowDays, setWindowDays] = useState<TimeWindow>(7);

  const [data, setData] = useState<TrendApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(
    async (keywords: string[], window: TimeWindow) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          keywords: keywords.join(","),
          window: String(window),
        });
        const res = await fetch(`/api/trends?${params.toString()}`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error ?? "데이터를 불러오지 못했습니다.");
        }
        setData(json as TrendApiResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    fetchTrends(selectedKeywords, windowDays);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword],
    );
  };

  const addCustomKeyword = (keyword: string) => {
    if (
      selectedKeywords.includes(keyword) ||
      customKeywords.includes(keyword)
    )
      return;
    setCustomKeywords((prev) => [...prev, keyword]);
  };

  const removeCustomKeyword = (keyword: string) => {
    setCustomKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const handleSubmit = () => {
    const keywords = [...selectedKeywords, ...customKeywords];
    fetchTrends(keywords.length > 0 ? keywords : DEFAULT_KEYWORDS, windowDays);
  };

  const handleWindowChange = (window: TimeWindow) => {
    setWindowDays(window);
    const keywords = [...selectedKeywords, ...customKeywords];
    fetchTrends(keywords.length > 0 ? keywords : DEFAULT_KEYWORDS, window);
  };

  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="border-b border-card-border bg-card/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
            Beauty Intelligence
          </p>
          <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
            YouTube Beauty Trend Radar
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            메이크업 · 스킨케어 · K-Beauty 영상 데이터를 실시간으로 분석해
            떠오르는 콘텐츠와 키워드를 보여드려요.
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8">
        <KeywordControls
          availableKeywords={DEFAULT_KEYWORDS}
          selectedKeywords={selectedKeywords}
          onToggleKeyword={toggleKeyword}
          customKeywords={customKeywords}
          onAddCustomKeyword={addCustomKeyword}
          onRemoveCustomKeyword={removeCustomKeyword}
          windowDays={windowDays}
          onWindowChange={handleWindowChange}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {error && (
          <div className="rounded-2xl border border-accent-strong/40 bg-accent-soft px-5 py-4 text-sm text-accent-strong">
            {error}
          </div>
        )}

        {data && !error && (
          <>
            <StatsRow stats={data.stats} window={data.window} />

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-card-border bg-card p-5 shadow-sm shadow-black/[0.02]">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  TOP 10 Trend Score
                </h2>
                <p className="mb-2 text-xs text-muted">
                  조회 속도와 참여율을 결합한 점수 (0~100)
                </p>
                <TrendScoreChart videos={data.topVideos} />
              </div>

              <div className="rounded-2xl border border-card-border bg-card p-5 shadow-sm shadow-black/[0.02]">
                <h2 className="font-display text-lg font-semibold text-foreground">
                  인기 키워드 TOP 10
                </h2>
                <p className="mb-2 text-xs text-muted">
                  제목·설명에서 자주 등장한 단어
                </p>
                <KeywordChart keywords={data.topKeywords} />
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  인기 영상 TOP 10
                </h2>
                <span className="text-xs text-muted">
                  {new Date(data.fetchedAt).toLocaleString("ko-KR")} 기준
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {data.topVideos.map((video, i) => (
                  <VideoCard key={video.id} video={video} rank={i + 1} />
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-card-border bg-card p-5 shadow-sm shadow-black/[0.02]">
              <h2 className="font-display text-lg font-semibold text-foreground">
                조회수 급상승 예상 영상
              </h2>
              <p className="mb-2 text-xs text-muted">
                게시 이후 조회수 증가 속도(시간당 조회수) 기준 정렬
              </p>
              <div className="divide-y divide-card-border">
                {data.risingVideos.map((video, i) => (
                  <RisingVideoRow key={video.id} video={video} rank={i + 1} />
                ))}
              </div>
            </section>
          </>
        )}

        {loading && !data && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-2xl border border-card-border bg-card"
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-card-border py-6 text-center text-xs text-muted">
        Powered by YouTube Data API v3 · Built with Next.js & Recharts
      </footer>
    </div>
  );
}

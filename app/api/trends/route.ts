import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_KEYWORDS, YouTubeApiError, buildTrendReport } from "@/lib/youtube";
import type { TimeWindow } from "@/types/youtube";

export const runtime = "nodejs";

function parseWindow(value: string | null): TimeWindow {
  return value === "30" ? 30 : 7;
}

function parseKeywords(value: string | null): string[] {
  if (!value) return DEFAULT_KEYWORDS;
  const keywords = value
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  return keywords.length > 0 ? keywords : DEFAULT_KEYWORDS;
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          ".env.local 파일에 YOUTUBE_API_KEY가 설정되어 있지 않습니다. YouTube Data API v3 키를 발급받아 등록해주세요.",
      },
      { status: 500 },
    );
  }

  const { searchParams } = request.nextUrl;
  const windowDays = parseWindow(searchParams.get("window"));
  const keywords = parseKeywords(searchParams.get("keywords"));

  try {
    const report = await buildTrendReport(keywords, windowDays, apiKey);
    return NextResponse.json(report);
  } catch (error) {
    const message =
      error instanceof YouTubeApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}

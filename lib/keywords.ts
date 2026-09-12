import type { KeywordFrequency } from "@/types/youtube";

// Common English + Korean stopwords/particles that would otherwise dominate
// naive word-frequency analysis of titles & descriptions.
const STOPWORDS = new Set([
  // English function words / pronouns / auxiliaries
  "the", "and", "for", "with", "this", "that", "you", "your", "yours", "are",
  "have", "has", "had", "how", "what", "from", "will", "just", "make", "new",
  "best", "top", "get", "all", "out", "into", "look", "like", "our", "who",
  "why", "when", "can", "not", "but", "was", "were", "its", "it's", "i'm",
  "she", "he", "they", "them", "his", "her", "him", "we", "us", "it", "is",
  "on", "in", "of", "at", "by", "be", "as", "or", "an", "if", "so", "up",
  "do", "did", "does", "been", "being", "than", "then", "there", "here",
  "some", "such", "no", "nor", "only", "own", "same", "too", "very", "now",
  "also", "about", "after", "before", "more", "most", "other", "again",
  "once", "off", "over", "under", "each", "few", "any", "both", "s", "t",
  "my", "me", "to", "a", "i", "com", "https", "http", "www", "co", "net",
  "org", "amp", "via", "de", "en", "un", "una",
  // Video-metadata boilerplate
  "makeup", "video", "shorts", "short", "vlog", "full", "review", "tutorial",
  "subscribe", "channel", "episode",
  // Korean particles / common filler words
  "이", "그", "저", "의", "을", "를", "은", "는", "에", "에서", "와", "과",
  "도", "로", "으로", "가", "이다", "합니다", "하는", "해서", "그리고", "그런",
  "정말", "너무", "진짜", "오늘", "영상", "구독", "좋아요", "제품", "추천",
  "브이로그", "리뷰",
]);

const URL_RE = /https?:\/\/\S+|www\.\S+/gi;
const TOKEN_RE = /[#@]?[\p{L}\p{N}][\p{L}\p{N}'-]{1,}/gu;

export function extractTopKeywords(
  texts: string[],
  excluding: string[] = [],
  limit = 10,
): KeywordFrequency[] {
  const exclude = new Set(
    excluding.map((k) => k.trim().toLowerCase()).filter(Boolean),
  );
  const counts = new Map<string, number>();

  for (const text of texts) {
    if (!text) continue;
    const cleaned = text.toLowerCase().replace(URL_RE, " ");
    const matches = cleaned.match(TOKEN_RE) ?? [];
    for (const raw of matches) {
      const token = raw.replace(/^[#@]/, "").trim();
      if (token.length < 2) continue;
      if (/^\d+$/.test(token)) continue;
      if (STOPWORDS.has(token)) continue;
      if (exclude.has(token)) continue;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

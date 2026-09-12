"use client";

import { FormEvent, useState } from "react";
import type { TimeWindow } from "@/types/youtube";

interface KeywordControlsProps {
  availableKeywords: string[];
  selectedKeywords: string[];
  onToggleKeyword: (keyword: string) => void;
  customKeywords: string[];
  onAddCustomKeyword: (keyword: string) => void;
  onRemoveCustomKeyword: (keyword: string) => void;
  windowDays: TimeWindow;
  onWindowChange: (window: TimeWindow) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function KeywordControls({
  availableKeywords,
  selectedKeywords,
  onToggleKeyword,
  customKeywords,
  onAddCustomKeyword,
  onRemoveCustomKeyword,
  windowDays,
  onWindowChange,
  onSubmit,
  loading,
}: KeywordControlsProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const value = inputValue.trim();
    if (!value) return;
    onAddCustomKeyword(value);
    setInputValue("");
  };

  return (
    <div className="rounded-2xl border border-card-border bg-card p-5 shadow-sm shadow-black/[0.02]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          키워드
        </span>
        {availableKeywords.map((keyword) => {
          const active = selectedKeywords.includes(keyword);
          return (
            <button
              key={keyword}
              type="button"
              onClick={() => onToggleKeyword(keyword)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-accent-strong bg-accent-strong text-white"
                  : "border-card-border bg-transparent text-foreground hover:border-accent"
              }`}
            >
              {keyword}
            </button>
          );
        })}
        {customKeywords.map((keyword) => (
          <button
            key={keyword}
            type="button"
            onClick={() => onRemoveCustomKeyword(keyword)}
            className="rounded-full border border-gold bg-gold/10 px-3 py-1.5 text-sm font-medium text-gold"
            title="클릭해서 제거"
          >
            {keyword} ✕
          </button>
        ))}
      </div>

      <form onSubmit={handleAdd} className="mt-4 flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="직접 검색어 입력 (예: 틴트, 클렌징오일)"
          className="flex-1 rounded-full border border-card-border bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full border border-card-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent"
        >
          추가
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            기간
          </span>
          {[7, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onWindowChange(d as TimeWindow)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                windowDays === d
                  ? "bg-foreground text-background"
                  : "bg-transparent text-muted hover:text-foreground"
              }`}
            >
              최근 {d}일
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="rounded-full bg-accent-strong px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "분석 중..." : "트렌드 분석"}
        </button>
      </div>
    </div>
  );
}

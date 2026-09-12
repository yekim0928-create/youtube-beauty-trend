import type { Metadata } from "next";
import { Playfair_Display, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Beauty Trend Radar | YouTube 뷰티 트렌드 대시보드",
  description:
    "YouTube Data API 기반 실시간 뷰티 트렌드 분석 대시보드 - 메이크업, 스킨케어, K-Beauty 인기 영상과 키워드를 한눈에.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${playfair.variable} ${notoSansKr.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] font-body">
        {children}
      </body>
    </html>
  );
}

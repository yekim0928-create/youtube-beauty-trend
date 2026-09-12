# YouTube Beauty Trend Radar

YouTube Data API v3를 활용해 뷰티(메이크업·스킨케어·화장품·K-Beauty) 관련 영상의
최근 트렌드를 분석하는 대시보드입니다.

## 기능

- 기본 키워드(메이크업, 스킨케어, 화장품, K-Beauty) + 사용자 정의 키워드 검색
- 최근 7일 / 30일 기준 영상 데이터 수집 (제목, 채널명, 조회수, 좋아요수, 게시일)
- 조회 속도(view velocity)와 참여율을 결합한 **Trend Score** 산출
- TOP 10 인기 영상, TOP 10 인기 키워드, 조회수 급상승 예상 영상 시각화
- 제목/설명 텍스트 기반 키워드 빈도 분석
- Editorial Beauty 스타일의 반응형 UI (모바일 / PC)

## 기술 스택

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Recharts
- YouTube Data API v3 (서버 사이드 API Route에서만 호출, 클라이언트에 키 미노출)

## 시작하기

### 1. YouTube Data API 키 발급

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. **YouTube Data API v3** 사용 설정
3. API 키 발급 (사용량 제한 및 HTTP 리퍼러 제한 권장)

### 2. 환경 변수 설정

`.env.local.example`을 복사해 `.env.local`을 만들고 키를 입력합니다.

```bash
cp .env.local.example .env.local
```

```
YOUTUBE_API_KEY=발급받은_API_키
```

`.env.local`은 `.gitignore`에 포함되어 있어 저장소에 커밋되지 않습니다.

### 3. 설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속.

### 4. 빌드

```bash
npm run build
npm run start
```

## Trend Score 산출 방식

- **조회 속도**: `조회수 / 게시 후 경과일수` (로그 스케일 정규화, 0~100)
- **참여율**: `(좋아요수 + 댓글수) / 조회수` (0~100)
- **Trend Score** = 조회 속도 점수 × 0.65 + 참여율 점수 × 0.35

## GitHub / Vercel 배포

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

Vercel에서:

1. [vercel.com/new](https://vercel.com/new)에서 위 GitHub 저장소 Import
2. 프레임워크는 Next.js로 자동 감지됨
3. **Environment Variables**에 `YOUTUBE_API_KEY` 추가
4. Deploy

## 프로젝트 구조

```
app/
  api/trends/route.ts   # YouTube API 서버 사이드 호출 (API Route)
  page.tsx               # 대시보드 UI
  layout.tsx, globals.css
components/               # UI 컴포넌트 (차트, 카드, 컨트롤)
lib/
  youtube.ts              # YouTube API 호출 + Trend Score 계산
  keywords.ts             # 키워드 빈도 분석
  format.ts               # 숫자/날짜 포맷 유틸
  useChartColors.ts        # 다크모드 대응 차트 색상 훅
types/youtube.ts           # 공유 타입 정의
```

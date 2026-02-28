# StreamLeap Studio - Feature Designs

**Features:** 2 (Idea Scorer), 3 (Competitor Analysis), 5 (Thumbnail Optimization), 6 (Niche Intelligence)
**Generated:** Feb 23, 2026

---

## FEATURE 2: PREDICTIVE IDEA SCORER

### Overview
Score video ideas before creation to predict performance potential.

### Scoring Algorithm

```typescript
interface IdeaScore {
  overall: number;  // 0-100
  breakdown: {
    titleScore: number;    // Weight: 25%
    trendScore: number;    // Weight: 30%
    formatScore: number;   // Weight: 20%
    channelFitScore: number; // Weight: 25%
  };
  suggestions: string[];
  similarVideos: Video[];
}
```

### Component Breakdown

#### A. Title Analysis (25%)
- Hook presence ("Nobody talks about...", "Top 10...", "Secret")
- Curiosity gaps ("Hidden", "Nobody knows")
- Emotional triggers ("Amazing", "Insane", "Shocking")
- Optimal length (50-60 characters)
- Niche keywords

#### B. Trend Analysis (30%)
Data sources:
- Google Trends API (search volume)
- YouTube Trending API
- Keyword velocity (7-day growth)

#### C. Format Match (20%)
Match against viral formats:
- tutorial | listicle | story | comparison | reaction | vlog | news

#### D. Channel Fit (25%)
- Topic match with existing content
- Audience interest alignment
- Creator expertise

### User Flow
```
User enters idea → System scores it → Shows breakdown + suggestions
```

### API
```
POST /api/ideas/score
Body: { title: string, topic: string, format: string, channelContext?: string }
```

---

## FEATURE 3: COMPETITOR PATTERN ANALYSIS

### Overview
Track competitor channels and identify winning patterns.

### Data Model

```typescript
interface CompetitorChannel {
  handle: string;
  name: string;
  subscribers: number;
  avgViews: number;
  uploadFrequency: number;  // Videos per week
  growthRate: number;
  topVideos: Video[];
}
```

### Patterns to Detect

#### A. Upload Timing
- Best day of week
- Best time of day
- Frequency patterns

#### B. Title Patterns
- Common structures
- Top keywords
- Character length distribution

#### C. Thumbnail Patterns
- Face presence
- Text overlay frequency
- Color palettes
- Expression types

#### D. Content Formats
- Top performing formats
- Emerging formats
- Unique formats

### Dashboard Design

```
┌─────────────────────────────────────────────────────────────────┐
│ COMPETITOR ANALYTICS                    [+ Add Channel]          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tracked Channels:                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ @MrBeast    │ │ @PewDiePie  │ │ @MarkRober  │              │
│  │ 250M subs   │ │ 111M subs   │ │ 30M subs    │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                 │
│  UPLOAD TIMING: Best Day: Saturday, Best Time: 3-5 PM EST     │
│                                                                 │
│  TITLE PATTERNS:                                               │
│  • "I Spent..." (avg 15M views)                                │
│  • "$1 vs $100,000..." (avg 12M views)                         │
│  • "World's [First/Largest]..." (avg 18M views)                │
│                                                                 │
│  RECOMMENDATIONS:                                               │
│  ✓ Post on Saturdays 3-5 PM for maximum reach                 │
│  ✓ Use "I [action]..." title format                            │
│  ✓ Videos 15-20 min perform best in your niche                 │
└─────────────────────────────────────────────────────────────────┘
```

### API Endpoints
```
POST /api/competitors/add
GET /api/competitors/:channelId/analysis
GET /api/competitors/patterns
POST /api/competitors/compare
```

### Tech Stack
- YouTube Data API v3 (public data only)
- Supabase for storage
- Background jobs for daily updates

---

## FEATURE 5: THUMBNAIL OPTIMIZATION (Gemma 3 4B)

### Overview
Analyze thumbnails for CTR optimization using Gemma 3 4B.

### Why Gemma 3 4B?
- Lightweight (runs locally or cheap API)
- Strong image understanding
- Fast inference
- Cost-effective for batch processing

### Analysis Dimensions

#### A. Visual Composition
- Focal point clarity
- Contrast/brightness
- Color palette effectiveness
- Rule of thirds

#### B. Text Overlay
- Readability at small size
- Word count (optimal: 3-5 words)
- Color contrast
- Position

#### C. Emotional Impact
- Face presence and expression
- Eye contact
- Emotional tone (excitement, curiosity, shock)
- Action/energy level

#### D. CTR Correlation Factors

**High Impact (+):**
- Face present: +23%
- Eye contact: +18%
- Expressive emotion: +15%
- Text under 5 words: +12%

**Negative Impact (-):**
- Too much text: -15%
- Low contrast: -12%
- Cluttered: -10%

### Gemma 3 4B Integration

```typescript
const ANALYSIS_PROMPT = `
Analyze this YouTube thumbnail for CTR optimization.

Evaluate:
1. Visual composition (focal point, contrast, colors)
2. Text overlay (readability, word count, position)
3. Emotional impact (faces, expressions, energy)
4. CTR predictors (curiosity gap, urgency)

Respond in JSON:
{
  "overallScore": 0-100,
  "issues": [...],
  "suggestions": [...],
  "predictedCTR": "above_average" | "average" | "below_average"
}
`;
```

### Pipeline
1. Download/validate image
2. Resize to 1280x720
3. Extract basic metrics (brightness, contrast, colors)
4. Send to Gemma 3 4B for deep analysis
5. Combine results

### Dashboard Design

```
┌─────────────────────────────────────────────────────────────────┐
│ THUMBNAIL ANALYZER                              [Upload] [URL]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Thumbnail Image]                                              │
│  Overall Score: 72/100  ████████████░░░░ GOOD                  │
│  Predicted CTR: Above Average                                   │
│                                                                 │
│  FACTORS              │  ISSUES                                 │
│  ✓ Face Present +23%  │  ⚠ Text too small                      │
│  ✓ Eye Contact +18%   │  ⚠ Low contrast                        │
│  ✓ Bright Colors +8%  │  ⚠ 7 words (optimal: 3-5)              │
│                                                                 │
│  SUGGESTIONS:                                                   │
│  1. Reduce text to 3-5 words                                    │
│  2. Increase contrast between subject and background            │
│  3. Increase text size by 20% for mobile                        │
│                                                                 │
│  A/B COMPARISON:                                                │
│  [Thumb A: 72] vs [Thumb B: 68]                                │
│  Predicted Winner: A (+4% CTR)                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack
- Gemma 3 4B (local or API)
- Sharp (Node.js image processing)
- Supabase (analysis history)

---

## FEATURE 6: NICHE INTELLIGENCE

### Overview
Real-time trend tracking and emerging pattern detection.

### Data Sources

```typescript
const SOURCES = {
  youtube: '/videos?chart=mostPopular',
  googleTrends: '/trending/realtime',
  reddit: '/r/{niche}/hot',
  twitter: '/search?q={niche}'
};
```

### Intelligence Categories

#### A. Rising Topics
```typescript
interface RisingTopic {
  topic: string;
  momentum: number;          // Growth velocity
  opportunityScore: number;  // How easy to rank
  saturation: number;        // How crowded
  windowOfOpportunity: string;
  suggestedAngles: string[];
}
```

Detection: Monitor keywords with momentum across sources

#### B. Emerging Formats
Track new video format patterns and their spread velocity

#### C. Creator Movements
Track channel pivots and successful niche changes

#### D. Algorithm Signals
Detect algorithm changes from creator reports and performance anomalies

### Dashboard Design

```
┌─────────────────────────────────────────────────────────────────┐
│ NICHE INTELLIGENCE                      [Gaming] [Tech] [+ Add] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔥 RISING TOPICS (Last 24 hours)                               │
│                                                                 │
│  1. "AI Gaming Assistants"                                      │
│     Momentum: +340% (2 days) | Opportunity: HIGH                │
│     Window: 3-5 days                                            │
│     [View Videos] [Generate Ideas]                              │
│                                                                 │
│  2. "PS5 Pro vs PC"                                             │
│     Momentum: +180% (5 days) | Opportunity: MEDIUM              │
│     Window: 1 week                                              │
│                                                                 │
│  📊 EMERGING FORMATS                                            │
│  • "POV Gaming Challenges" +250% this week                      │
│  • "30 Second Game Reviews" +180% this week                     │
│                                                                 │
│  ⚡ ALGORITHM SIGNALS                                            │
│  🟢 DETECTED: Shorts getting 2.3x more impressions              │
│     Recommendation: Increase shorts output                      │
│                                                                 │
│  📧 WEEKLY REPORT [Enable]                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Background Jobs

```typescript
// Daily trend monitoring
cron.schedule('0 */6 * * *', async () => {
  const niches = await getActiveNiches();
  for (const niche of niches) {
    const trends = await detectRisingTopics(niche);
    await storeTrends(niche, trends);
    await checkAlerts(niche, trends);
  }
});
```

### API Endpoints
```
GET /api/intelligence/:niche/rising
GET /api/intelligence/:niche/formats
GET /api/intelligence/:niche/algorithm-signals
POST /api/intelligence/subscribe
```

---

## IMPLEMENTATION TIMELINE

| Feature | Effort | Priority | Est. Time |
|---------|--------|----------|-----------|
| 3. Competitor Analysis | LOW | HIGH | 1 week |
| 5. Thumbnail Optimization | MEDIUM | HIGH | 2 weeks |
| 2. Idea Scorer | MEDIUM | HIGH | 2 weeks |
| 6. Niche Intelligence | MEDIUM | MEDIUM | 2-3 weeks |

**Recommended Order:**
1. Start with Competitor Analysis (quick win, high value)
2. Build Thumbnail Optimization with Gemma 3 4B
3. Add Idea Scorer
4. Implement Niche Intelligence

---

*Design document by Zo AI Assistant*

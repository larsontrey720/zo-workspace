# Viral Video Cloner - Step-by-Step Build Guide

## Overview
**What it does:** Takes a viral YouTube video URL, analyzes it, and generates a template to replicate its success.

**Input:** YouTube video URL
**Output:**
- Hook breakdown (first 30 seconds analysis)
- Pacing/structure analysis
- Thumbnail pattern extraction
- Title template generator
- Tags used
- "Your version" script generator

**Tech Stack:**
- Frontend: React (or simple HTML form)
- Backend: Node.js/Bun
- AI: Gemma 3 4B (via OpenRouter or local)
- APIs: YouTube Data API, YouTube Transcript API
- Storage: Supabase (for saved clones)

---

## PHASE 1: CORE DATA COLLECTION (Day 1-2)

### Step 1: Get YouTube Video Metadata

**API:** YouTube Data API v3 (FREE - 10,000 units/day)

```javascript
// Backend endpoint: /api/clone/analyze
import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

async function getVideoMetadata(videoId) {
  const response = await youtube.videos.list({
    part: ['snippet', 'statistics', 'contentDetails'],
    id: videoId
  });
  
  return {
    title: response.data.items[0].snippet.title,
    description: response.data.items[0].snippet.description,
    tags: response.data.items[0].snippet.tags || [],
    channelId: response.data.items[0].snippet.channelId,
    thumbnail: response.data.items[0].snippet.thumbnails.maxres?.url,
    publishedAt: response.data.items[0].snippet.publishedAt,
    viewCount: response.data.items[0].statistics.viewCount,
    likeCount: response.data.items[0].statistics.likeCount,
    commentCount: response.data.items[0].statistics.commentCount,
    duration: response.data.items[0].contentDetails.duration
  };
}
```

**What you get:**
- Title, description, tags
- Thumbnail URL
- View count, like count
- Duration
- Channel ID

---

### Step 2: Get Video Transcript

**API:** YouTube Transcript API (FREE)

**Option A: Use existing library (Python)**
```python
from youtube_transcript_api import YouTubeTranscriptApi

def get_transcript(video_id):
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    return transcript
    # Returns: [{"text": "...", "start": 0.0, "duration": 3.5}, ...]
```

**Option B: Use Node.js package**
```bash
bun add youtube-transcript
```

```javascript
import { YoutubeTranscript } from 'youtube-transcript';

async function getTranscript(videoId) {
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  return transcript;
  // Returns: [{"text": "...", "offset": 0, "duration": 3}, ...]
}
```

**What you get:**
- Full video transcript with timestamps
- Can analyze first 30 seconds for hook
- Can extract pacing from word density

---

### Step 3: Download Thumbnail for Analysis

```javascript
async function downloadThumbnail(thumbnailUrl, videoId) {
  const response = await fetch(thumbnailUrl);
  const buffer = await response.arrayBuffer();
  
  // Save temporarily
  const fs = require('fs');
  const path = `/tmp/${videoId}_thumbnail.jpg`;
  fs.writeFileSync(path, Buffer.from(buffer));
  
  return path;
}
```

**What you get:**
- Thumbnail image file
- Can analyze colors, text, composition

---

## PHASE 2: AI ANALYSIS (Day 3-4)

### Step 4: Hook Analysis (First 30 seconds)

**Prompt for Gemma 3 4B:**
```javascript
async function analyzeHook(transcript) {
  // Get first 30 seconds
  const first30Sec = transcript
    .filter(item => item.offset < 30)
    .map(item => item.text)
    .join(' ');
  
  const prompt = `Analyze this YouTube video hook (first 30 seconds):

"${first30Sec}"

Provide:
1. Hook Type (question/story/controversy/curiosity/promise)
2. Hook Strength Score (1-10)
3. Why it works (psychological trigger)
4. Template for replicating this hook type

Respond in JSON format.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemma-3-4b',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  return await response.json();
}
```

**Expected Output:**
```json
{
  "hookType": "curiosity",
  "strengthScore": 8,
  "whyItWorks": "Creates information gap - viewer needs to know the answer",
  "template": "What if I told you [unexpected fact]? In this video, I'll show you [promise].",
  "hookText": "What if I told you that 90% of YouTubers make this mistake..."
}
```

---

### Step 5: Pacing Analysis

```javascript
async function analyzePacing(transcript) {
  // Calculate words per 30-second segment
  const segments = [];
  for (let i = 0; i < transcript.length; i += 30) {
    const segment = transcript
      .filter(item => item.offset >= i && item.offset < i + 30)
      .map(item => item.text)
      .join(' ');
    
    segments.push({
      timeRange: `${i}-${i + 30}s`,
      wordCount: segment.split(' ').length,
      text: segment
    });
  }
  
  // Analyze with AI
  const prompt = `Analyze the pacing of this YouTube video by segments:

${JSON.stringify(segments.slice(0, 10))}

Provide:
1. Overall pacing (fast/medium/slow)
2. Pacing pattern (consistent/varies)
3. Retention tips (where they likely keep viewers)
4. Template structure for this video type

Respond in JSON format.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemma-3-4b',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  return await response.json();
}
```

**Expected Output:**
```json
{
  "overallPacing": "fast",
  "pacingPattern": "varies - starts fast, slows mid, speeds up at end",
  "retentionTips": [
    "Hook in first 3 seconds",
    "Pattern interrupt at 2:30",
    "Teaser for ending at 5:00"
  ],
  "structure": {
    "0-30s": "Hook + problem statement",
    "30s-2m": "Setup + context",
    "2m-5m": "Main content (3 points)",
    "5m-7m": "Bonus/reveal",
    "7m-end": "CTA + next steps"
  }
}
```

---

### Step 6: Thumbnail Analysis

**Option A: AI Vision Analysis (if using vision model)**
```javascript
async function analyzeThumbnail(imagePath) {
  // Convert to base64
  const fs = require('fs');
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  
  // Use vision model (GPT-4V or similar)
  const prompt = `Analyze this YouTube thumbnail:

Provide:
1. Color scheme (primary colors)
2. Text elements (what words are visible)
3. Composition (face/text/arrow/etc)
4. Emotional appeal (curiosity/shock/excitement)
5. CTR prediction factors

Respond in JSON format.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openai/gpt-4-vision-preview',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` }}
        ]
      }]
    })
  });
  
  return await response.json();
}
```

**Option B: Simple Analysis (No Vision Model)**
```javascript
async function analyzeThumbnailSimple(thumbnailUrl, title) {
  const prompt = `Based on this video title: "${title}"

And knowing this is a successful video with millions of views:

Predict the thumbnail elements:
1. Likely color scheme (bright colors for CTR)
2. Text placement (large text for readability)
3. Face/expression (surprised/curious/pointing)
4. Arrow/shape elements
5. Contrast level

Provide a thumbnail template that would work for similar content.

Respond in JSON format.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemma-3-4b',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  return await response.json();
}
```

---

### Step 7: Title Pattern Analysis

```javascript
async function analyzeTitle(title, viewCount, niche) {
  const prompt = `Analyze this viral YouTube title:

"${title}"
Views: ${viewCount}

Provide:
1. Title pattern used (question/number/curiosity/etc)
2. Psychological triggers
3. Keyword placement
4. Emotional appeal
5. A template for replicating this title style

Also generate 10 alternative titles using the same pattern.

Respond in JSON format.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemma-3-4b',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  return await response.json();
}
```

**Expected Output:**
```json
{
  "pattern": "Number + Promise + Curiosity",
  "triggers": ["specificity", "value promise", "curiosity gap"],
  "keywordPlacement": "Keywords at start for SEO",
  "emotionalAppeal": "Aspirational - viewer wants this result",
  "template": "[Number] [Ways/Steps] to [Achieve Desired Outcome]",
  "alternatives": [
    "7 Steps to Grow Your Channel in 2024",
    "5 Secrets Top YouTubers Won't Tell You",
    "10 Mistakes Killing Your Views (And How to Fix Them)"
  ]
}
```

---

## PHASE 3: CLONE GENERATOR (Day 5-6)

### Step 8: Generate "Your Version"

```javascript
async function generateClone(analysis, userTopic) {
  const prompt = `Based on this viral video analysis:

${JSON.stringify(analysis)}

And the user's topic: "${userTopic}"

Generate a complete video template including:
1. Hook script (first 30 seconds)
2. Full video structure (timestamps + topics)
3. Thumbnail description (for AI image generator)
4. Title options (5 variations)
5. Tags (15 relevant tags)
6. Description template

Make it specific to their topic while following the viral pattern.

Respond in JSON format.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemma-3-4b',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  return await response.json();
}
```

**Expected Output:**
```json
{
  "hookScript": "What if I told you that [specific fact about user's topic]? In this video, I'll show you [their promise].",
  "structure": [
    { "timestamp": "0:00-0:30", "section": "Hook - surprising fact + promise" },
    { "timestamp": "0:30-2:00", "section": "Problem setup - why this matters" },
    { "timestamp": "2:00-5:00", "section": "Main content - 3 key points" },
    { "timestamp": "5:00-7:00", "section": "Bonus tip - unexpected value" },
    { "timestamp": "7:00-8:00", "section": "CTA - subscribe for more" }
  ],
  "thumbnailDescription": "Person pointing at [user's topic] with surprised expression. Text: '[Their key promise]'. Bright yellow background. Red arrow pointing to text.",
  "titles": [
    "7 Ways to [Achieve Their Goal]",
    "The Secret to [Their Result]",
    "I Tried [Their Method] for 30 Days"
  ],
  "tags": ["user topic", "niche keyword", "related term"],
  "description": "Want to [achieve result]? In this video, I show you [promise].\n\n🔗 Resources:\n- [Link]\n\n📱 Follow: @handle\n\n⏱️ Timestamps:\n0:00 Hook\n0:30 Problem\n2:00 Solution"
}
```

---

## PHASE 4: API ENDPOINTS (Day 6-7)

### Step 9: Build Backend API

```javascript
// server.js
import { serve } from "bun";

serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    
    // Analyze video
    if (url.pathname === '/api/clone/analyze' && req.method === 'POST') {
      const { videoUrl } = await req.json();
      const videoId = extractVideoId(videoUrl);
      
      // Get all data
      const metadata = await getVideoMetadata(videoId);
      const transcript = await getTranscript(videoId);
      
      // Analyze
      const hookAnalysis = await analyzeHook(transcript);
      const pacingAnalysis = await analyzePacing(transcript);
      const titleAnalysis = await analyzeTitle(metadata.title, metadata.viewCount);
      
      return Response.json({
        success: true,
        data: {
          metadata,
          hookAnalysis,
          pacingAnalysis,
          titleAnalysis,
          transcript: transcript.slice(0, 100) // First 100 items
        }
      });
    }
    
    // Generate clone
    if (url.pathname === '/api/clone/generate' && req.method === 'POST') {
      const { videoUrl, userTopic } = await req.json();
      
      // Get analysis first
      const analysis = await analyzeVideo(videoUrl);
      
      // Generate clone
      const clone = await generateClone(analysis, userTopic);
      
      // Save to database
      await saveClone(clone);
      
      // Deduct credits
      await deductCredits(userId, 1);
      
      return Response.json({
        success: true,
        data: clone
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
});

function extractVideoId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
```

---

### Step 10: Build Frontend (Simple)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Viral Video Cloner</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-900 text-white min-h-screen">
  <div class="container mx-auto p-8">
    <h1 class="text-4xl font-bold mb-8">🎬 Viral Video Cloner</h1>
    
    <div class="bg-zinc-800 p-6 rounded-lg mb-8">
      <label class="block mb-2">Paste viral video URL:</label>
      <input type="text" id="videoUrl" class="w-full p-3 bg-zinc-700 rounded mb-4" placeholder="https://youtube.com/watch?v=...">
      
      <label class="block mb-2">Your topic:</label>
      <input type="text" id="userTopic" class="w-full p-3 bg-zinc-700 rounded mb-4" placeholder="e.g., How to grow on YouTube">
      
      <button onclick="cloneVideo()" class="bg-red-600 px-6 py-3 rounded font-bold">Clone Video (1 credit)</button>
    </div>
    
    <div id="result" class="hidden">
      <h2 class="text-2xl font-bold mb-4">Analysis Results</h2>
      <pre id="output" class="bg-zinc-800 p-4 rounded overflow-auto"></pre>
    </div>
  </div>
  
  <script>
    async function cloneVideo() {
      const videoUrl = document.getElementById('videoUrl').value;
      const userTopic = document.getElementById('userTopic').value;
      
      // Show loading
      document.getElementById('result').classList.remove('hidden');
      document.getElementById('output').textContent = 'Analyzing...';
      
      // Call API
      const response = await fetch('/api/clone/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, userTopic })
      });
      
      const data = await response.json();
      document.getElementById('output').textContent = JSON.stringify(data, null, 2);
    }
  </script>
</body>
</html>
```

---

## PHASE 5: PRICING & LIMITS (Day 7)

### Step 11: Credit System

```javascript
// database schema
const userSchema = {
  id: 'uuid',
  email: 'string',
  credits: 'number',
  freeClones: 'number', // 3 free
  createdAt: 'timestamp'
};

const cloneSchema = {
  id: 'uuid',
  userId: 'uuid',
  videoUrl: 'string',
  userTopic: 'string',
  cloneData: 'json',
  createdAt: 'timestamp'
};

// Check credits
async function checkCredits(userId) {
  const user = await db.users.find(userId);
  
  if (user.freeClones > 0) {
    return { allowed: true, type: 'free' };
  }
  
  if (user.credits > 0) {
    return { allowed: true, type: 'paid' };
  }
  
  return { allowed: false, message: 'No credits. Buy more.' };
}

// Deduct credit
async function deductCredit(userId, type) {
  if (type === 'free') {
    await db.users.update(userId, {
      freeClones: { decrement: 1 }
    });
  } else {
    await db.users.update(userId, {
      credits: { decrement: 1 }
    });
  }
}
```

---

## PHASE 6: TESTING & ITERATION (Day 8-10)

### Step 12: Test with Real Viral Videos

Test with these videos to ensure quality:
1. MrBeast videos (high retention)
2. Educational channels (Veritasium, Mark Rober)
3. Niche-specific (gaming, finance, etc.)

### Step 13: Gather Feedback

- Add rating system after each clone
- Track: "Was this useful?" (Yes/No)
- Ask: "What would make this better?"

---

## COST ESTIMATION

### API Costs (Per Clone)
- YouTube Data API: FREE
- YouTube Transcript: FREE
- Gemma 3 4B (OpenRouter): ~$0.0001 per request
- Total per clone: ~$0.0005 (essentially free)

### Revenue (Per Clone)
- Charge: $1 per clone
- Margin: 99.95%

---

## DEPLOYMENT

### Option A: Deploy to StreamLeap Studio
Add as subdirectory: `streamleapstudio.xyz/clone`

### Option B: Standalone Tool
Deploy to: `viralclone.streamleapstudio.xyz`

### Option C: Telegram Bot
```
User sends: https://youtube.com/watch?v=...
Bot responds: What's your topic?
User sends: How to grow on YouTube
Bot responds: [Full clone template]
```

---

## SUMMARY

**Timeline:** 7-10 days
**Cost:** Nearly FREE (Gemma 3 4B is very cheap)
**Revenue:** $1/clone
**Tech:** YouTube API + Transcript API + Gemma 3 4B

**Start with:**
1. Basic YouTube metadata fetch
2. Transcript extraction
3. Simple AI analysis
4. Text output

**Add later:**
1. Thumbnail vision analysis
2. Video download for deeper analysis
3. Saved clones database
4. Comparison (clone vs original performance)

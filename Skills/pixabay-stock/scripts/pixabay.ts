import { parseArgs } from "util";

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

if (!PIXABAY_API_KEY) {
  console.error("Error: PIXABAY_API_KEY not set. Add it in Zo Settings > Advanced > Secrets");
  process.exit(1);
}

const BASE_URL = "https://pixabay.com/api";

interface SearchParams {
  q?: string;
  lang?: string;
  id?: string;
  image_type?: string;
  category?: string;
  min_width?: string;
  min_height?: string;
  editors_choice?: string;
  safesearch?: string;
  order?: string;
  page?: string;
  per_page?: string;
}

interface VideoParams extends SearchParams {
  video_type?: string;
}

async function searchPhotos(params: SearchParams) {
  const query = new URLSearchParams();
  query.set("key", PIXABAY_API_KEY);
  
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  
  const response = await fetch(`${BASE_URL}/?${query}`);
  const data = await response.json();
  
  console.log(JSON.stringify(data, null, 2));
}

async function searchVideos(params: VideoParams) {
  const query = new URLSearchParams();
  query.set("key", PIXABAY_API_KEY);
  
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  
  const response = await fetch(`${BASE_URL}/videos/?${query}`);
  const data = await response.json();
  
  console.log(JSON.stringify(data, null, 2));
}

async function getPhoto(id: string) {
  const query = new URLSearchParams({
    key: PIXABAY_API_KEY,
    id: id
  });
  
  const response = await fetch(`${BASE_URL}/?${query}`);
  const data = await response.json();
  
  console.log(JSON.stringify(data, null, 2));
}

async function getVideo(id: string) {
  const query = new URLSearchParams({
    key: PIXABAY_API_KEY,
    id: id
  });
  
  const response = await fetch(`${BASE_URL}/videos/?${query}`);
  const data = await response.json();
  
  console.log(JSON.stringify(data, null, 2));
}

const command = process.argv[2];

if (!command) {
  console.log(`Pixabay Stock Media CLI

Usage: bun pixabay.ts <command> [options]

Commands:
  search-photos <query>     Search for photos
  search-videos <query>     Search for videos
  get-photo <id>            Get photo by ID
  get-video <id>            Get video by ID

Options:
  --per-page <n>           Number of results (3-200, default: 20)
  --page <n>               Page number (default: 1)
  --order <order>          Order: popular, latest (default: popular)
  --category <cat>          Category: backgrounds, fashion, nature, science, education, feelings, health, people, religion, places, animals, industry, computer, food, sports, transportation, travel, buildings, business, music
  --editors-choice         Only Editor's Choice results
  --safesearch             Only safe for all ages
  --lang <code>            Language: en, de, es, fr, etc. (default: en)
  --video-type <type>      Video type: all, film, animation (for videos)

Examples:
  bun pixabay.ts search-photos "sunset beach" --per-page 10
  bun pixabay.ts search-videos "ocean" --category nature
  bun pixabay.ts get-photo 195893`);
  process.exit(1);
}

const args = process.argv.slice(3);
const parsed = parseArgs({
  args,
  options: {
    "per-page": { type: "string", default: "20" },
    "page": { type: "string", default: "1" },
    "order": { type: "string", default: "popular" },
    "category": { type: "string" },
    "editors-choice": { type: "boolean", default: false },
    "safesearch": { type: "boolean", default: false },
    "lang": { type: "string", default: "en" },
    "video-type": { type: "string", default: "all" }
  }
});

const query = args[0] || "";

switch (command) {
  case "search-photos":
    await searchPhotos({
      q: query,
      ...(parsed.values.category && { category: parsed.values.category }),
      ...(parsed.values.editorsChoice && { editors_choice: "true" }),
      ...(parsed.values.safesearch && { safesearch: "true" }),
      order: parsed.values.order,
      page: parsed.values.page,
      per_page: parsed.values.perPage,
      lang: parsed.values.lang
    });
    break;
    
  case "search-videos":
    await searchVideos({
      q: query,
      ...(parsed.values.category && { category: parsed.values.category }),
      ...(parsed.values.editorsChoice && { editors_choice: "true" }),
      ...(parsed.values.safesearch && { safesearch: "true" }),
      order: parsed.values.order,
      page: parsed.values.page,
      per_page: parsed.values.perPage,
      lang: parsed.values.lang,
      video_type: parsed.values.videoType
    });
    break;
    
  case "get-photo":
    if (!query) {
      console.error("Error: Photo ID required");
      process.exit(1);
    }
    await getPhoto(query);
    break;
    
  case "get-video":
    if (!query) {
      console.error("Error: Video ID required");
      process.exit(1);
    }
    await getVideo(query);
    break;
    
  default:
    console.log(`Unknown command: ${command}`);
    console.log("Run without args to see usage");
    process.exit(1);
}
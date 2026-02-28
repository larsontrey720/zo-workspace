import { readFileSync } from "fs";

const PIXABAY_KEY = process.env.PIXABAY_API_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;

interface PixabayImage {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

interface PixabayVideo {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  duration: number;
  videos: {
    large?: { url: string; width: number; height: number; size: number; thumbnail: string };
    medium: { url: string; width: number; height: number; size: number; thumbnail: string };
    small: { url: string; width: number; height: number; size: number; thumbnail: string };
    tiny: { url: string; width: number; height: number; size: number; thumbnail: string };
  };
  views: number;
  downloads: number;
  likes: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: string;
  url: string;
  image: string;
  user: {
    id: number;
    name: string;
    url: string;
  };
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    fps: number | null;
    link: string;
  }[];
  video_pictures: {
    id: number;
    picture: string;
    nr: number;
  }[];
}

async function searchPixabayImages(query: string, perPage = 20) {
  const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&per_page=${perPage}&image_type=photo`;
  const res = await fetch(url);
  const data = await res.json();
  return data.hits.map((h: PixabayImage) => ({
    id: h.id,
    tags: h.tags,
    preview: h.previewURL,
    thumbnail: h.webformatURL,
    full: h.largeImageURL,
    width: h.imageWidth,
    height: h.imageHeight,
    views: h.views,
    downloads: h.downloads,
    likes: h.likes,
    author: h.user,
    source: "pixabay"
  }));
}

async function searchPixabayVideos(query: string, perPage = 20) {
  const url = `https://pixabay.com/api/videos/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&per_page=${perPage}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.hits.map((h: PixabayVideo) => ({
    id: h.id,
    tags: h.tags,
    thumbnail: h.videos.medium.thumbnail,
    video: h.videos.medium.url,
    duration: h.duration,
    width: h.videos.medium.width,
    height: h.videos.medium.height,
    views: h.views,
    downloads: h.downloads,
    likes: h.likes,
    author: h.user,
    source: "pixabay"
  }));
}

async function searchPexelsPhotos(query: string, perPage = 20) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_KEY! } });
  const data = await res.json();
  return data.photos.map((p: PexelsPhoto) => ({
    id: p.id,
    tags: p.alt,
    preview: p.src.medium,
    thumbnail: p.src.small,
    full: p.src.large2x,
    width: p.width,
    height: p.height,
    author: p.photographer,
    authorUrl: p.photographer_url,
    source: "pexels"
  }));
}

async function searchPexelsVideos(query: string, perPage = 20) {
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}`;
  const res = await fetch(url, { headers: { Authorization: PEXELS_KEY! } });
  const data = await res.json();
  return data.videos.map((v: PexelsVideo) => ({
    id: v.id,
    thumbnail: v.image,
    video: v.video_files[0]?.link,
    width: v.width,
    height: v.height,
    duration: v.duration,
    author: v.user.name,
    authorUrl: v.user.url,
    source: "pexels"
  }));
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!PIXABAY_KEY || !PEXELS_KEY) {
    console.error("Error: API keys not found. Set PIXABAY_API_KEY and PEXELS_API_KEY in Zo Settings > Advanced > Secrets");
    process.exit(1);
  }

  if (command === "pixabay") {
    const type = args[1];
    const query = args.slice(2).join(" ");
    
    if (type === "image") {
      const results = await searchPixabayImages(query);
      console.log(JSON.stringify(results, null, 2));
    } else if (type === "video") {
      const results = await searchPixabayVideos(query);
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.error("Usage: pixabay <image|video> <query>");
    }
  } else if (command === "pexels") {
    const type = args[1];
    const query = args.slice(2).join(" ");
    
    if (type === "photo") {
      const results = await searchPexelsPhotos(query);
      console.log(JSON.stringify(results, null, 2));
    } else if (type === "video") {
      const results = await searchPexelsVideos(query);
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.error("Usage: pexels <photo|video> <query>");
    }
  } else if (command === "download") {
    const url = args[1];
    const path = args[2];
    if (!url || !path) {
      console.error("Usage: download <url> <path>");
      process.exit(1);
    }
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const fs = await import("fs");
    fs.writeFileSync(path, Buffer.from(buffer));
    console.log(`Downloaded to ${path}`);
  } else {
    console.log(`Stock Media Search Skill
Usage:
  bun Skills/stock-media/scripts/search.ts pixabay image "query"   - Search Pixabay images
  bun Skills/stock-media/scripts/search.ts pixabay video "query"   - Search Pixabay videos
  bun Skills/stock-media/scripts/search.ts pexels photo "query"   - Search Pexels photos
  bun Skills/stock-media/scripts/search.ts pexels video "query"   - Search Pexels videos
  bun Skills/stock-media/scripts/search.ts download <url> <path>  - Download media
`);
  }
}

main();

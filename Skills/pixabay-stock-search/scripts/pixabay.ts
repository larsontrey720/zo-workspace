import process from 'process';

const API_KEY = process.env.PIXABAY_API_KEY;
const BASE_URL = 'https://pixabay.com/api';
const VIDEO_URL = 'https://pixabay.com/api/videos';

interface PixabayPhoto {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  webformatURL: string;
  largeImageURL: string;
  fullHDURL?: string;
  imageURL?: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  user: string;
}

interface PixabayVideo {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  picture_id: string;
  videos: {
    large?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    tiny?: { url: string; width: number; height: number };
  };
  user: string;
  userImageURL: string;
}

async function searchPhotos(query: string, options: { per_page?: number; page?: number } = {}) {
  if (!API_KEY) {
    console.error('Error: PIXABAY_API_KEY not set. Add it in Zo Settings > Advanced > Secrets');
    process.exit(1);
  }

  const params = new URLSearchParams({
    key: API_KEY,
    q: query,
    image_type: 'photo',
    per_page: String(options.per_page || 20),
    page: String(options.page || 1),
  });

  const response = await fetch(`${BASE_URL}/?${params}`);
  const data = await response.json();

  return data;
}

async function searchVideos(query: string, options: { per_page?: number; page?: number } = {}) {
  if (!API_KEY) {
    console.error('Error: PIXABAY_API_KEY not set. Add it in Zo Settings > Advanced > Secrets');
    process.exit(1);
  }

  const params = new URLSearchParams({
    key: API_KEY,
    q: query,
    per_page: String(options.per_page || 20),
    page: String(options.page || 1),
  });

  const response = await fetch(`${VIDEO_URL}/?${params}`);
  const data = await response.json();

  return data;
}

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  if (command === 'search') {
    const query = args[0];
    if (!query) {
      console.error('Usage: pixabay.ts search <query> [--per-page N] [--page N]');
      process.exit(1);
    }

    const perPageIndex = args.indexOf('--per-page');
    const perPage = perPageIndex !== -1 ? parseInt(args[perPageIndex + 1]) : 20;

    const pageIndex = args.indexOf('--page');
    const page = pageIndex !== -1 ? parseInt(args[pageIndex + 1]) : 1;

    console.log(`Searching Pixabay for: "${query}"`);
    const results = await searchPhotos(query, { per_page: perPage, page });

    console.log(`\nFound ${results.totalHits} photos (showing ${results.hits.length}):\n`);

    results.hits.forEach((photo: PixabayPhoto, i: number) => {
      console.log(`${i + 1}. ${photo.tags}`);
      console.log(`   ID: ${photo.id}`);
      console.log(`   Size: ${photo.imageWidth}x${photo.imageHeight}`);
      console.log(`   Views: ${photo.views} | Downloads: ${photo.downloads} | Likes: ${photo.likes}`);
      console.log(`   Preview: ${photo.previewURL}`);
      console.log(`   Large: ${photo.largeImageURL}`);
      console.log('');
    });
  } else if (command === 'videos') {
    const query = args[0];
    if (!query) {
      console.error('Usage: pixabay.ts videos <query>');
      process.exit(1);
    }

    console.log(`Searching Pixabay videos for: "${query}"`);
    const results = await searchVideos(query);

    console.log(`\nFound ${results.totalHits} videos (showing ${results.hits.length}):\n`);

    results.hits.forEach((video: PixabayVideo, i: number) => {
      console.log(`${i + 1}. ${video.tags}`);
      console.log(`   ID: ${video.id}`);
      console.log(`   Video URL: ${video.videos.large?.url || video.videos.medium?.url}`);
      console.log('');
    });
  } else {
    console.log(`
Pixabay Stock Search Skill

Usage:
  pixabay.ts search <query> [options]
  pixabay.ts videos <query>

Options:
  --per-page N   Number of results (default: 20)
  --page N       Page number (default: 1)

Examples:
  pixabay.ts search "sunset"
  pixabay.ts search "technology" --per-page 10
  pixabay.ts videos "ocean"

Setup:
  Add your API key in Zo Settings > Advanced > Secrets as PIXABAY_API_KEY
  Get free key at: https://pixabay.com/api
`);
  }
}

main();
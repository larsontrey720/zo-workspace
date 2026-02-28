import process from 'process';

const API_KEY = process.env.PEXELS_API_KEY;
const BASE_URL = 'https://api.pexels.com/v1';

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

async function searchPhotos(query: string, options: { per_page?: number; page?: number } = {}) {
  if (!API_KEY) {
    console.error('Error: PEXELS_API_KEY not set. Add it in Zo Settings > Advanced > Secrets');
    process.exit(1);
  }

  const params = new URLSearchParams({
    query,
    per_page: String(options.per_page || 20),
    page: String(options.page || 1),
  });

  const response = await fetch(`${BASE_URL}/search?${params}`, {
    headers: { Authorization: API_KEY },
  });
  const data = await response.json();

  return data;
}

async function getCurated(options: { per_page?: number; page?: number } = {}) {
  if (!API_KEY) {
    console.error('Error: PEXELS_API_KEY not set. Add it in Zo Settings > Advanced > Secrets');
    process.exit(1);
  }

  const params = new URLSearchParams({
    per_page: String(options.per_page || 20),
    page: String(options.page || 1),
  });

  const response = await fetch(`${BASE_URL}/curated?${params}`, {
    headers: { Authorization: API_KEY },
  });
  const data = await response.json();

  return data;
}

async function getPhoto(id: string) {
  if (!API_KEY) {
    console.error('Error: PEXELS_API_KEY not set. Add it in Zo Settings > Advanced > Secrets');
    process.exit(1);
  }

  const response = await fetch(`${BASE_URL}/photos/${id}`, {
    headers: { Authorization: API_KEY },
  });
  const data = await response.json();

  return data;
}

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  if (command === 'search') {
    const query = args[0];
    if (!query) {
      console.error('Usage: pexels.ts search <query> [--per-page N] [--page N]');
      process.exit(1);
    }

    const perPageIndex = args.indexOf('--per-page');
    const perPage = perPageIndex !== -1 ? parseInt(args[perPageIndex + 1]) : 20;

    const pageIndex = args.indexOf('--page');
    const page = pageIndex !== -1 ? parseInt(args[pageIndex + 1]) : 1;

    console.log(`Searching Pexels for: "${query}"`);
    const results = await searchPhotos(query, { per_page: perPage, page });

    console.log(`\nFound ${results.total_results} photos (showing ${results.photos.length}):\n`);

    results.photos.forEach((photo: PexelsPhoto, i: number) => {
      console.log(`${i + 1}. ${photo.alt || 'Untitled'}`);
      console.log(`   ID: ${photo.id}`);
      console.log(`   Size: ${photo.width}x${photo.height}`);
      console.log(`   Photographer: ${photo.photographer}`);
      console.log(`   Original: ${photo.src.original}`);
      console.log(`   Large: ${photo.src.large}`);
      console.log('');
    });
  } else if (command === 'curated') {
    const perPageIndex = args.indexOf('--per-page');
    const perPage = perPageIndex !== -1 ? parseInt(args[perPageIndex + 1]) : 20;

    const pageIndex = args.indexOf('--page');
    const page = pageIndex !== -1 ? parseInt(args[pageIndex + 1]) : 1;

    console.log('Fetching curated photos...');
    const results = await getCurated({ per_page: perPage, page });

    console.log(`\nFound ${results.total_results} photos (showing ${results.photos.length}):\n`);

    results.photos.forEach((photo: PexelsPhoto, i: number) => {
      console.log(`${i + 1}. ${photo.alt || 'Untitled'}`);
      console.log(`   ID: ${photo.id}`);
      console.log(`   Size: ${photo.width}x${photo.height}`);
      console.log(`   Photographer: ${photo.photographer}`);
      console.log(`   Large: ${photo.src.large}`);
      console.log('');
    });
  } else if (command === 'photo') {
    const id = args[0];
    if (!id) {
      console.error('Usage: pexels.ts photo <id>');
      process.exit(1);
    }

    console.log(`Fetching photo ${id}...`);
    const photo = await getPhoto(id);

    console.log(`
${photo.alt || 'Untitled'}
ID: ${photo.id}
Size: ${photo.width}x${photo.height}
Photographer: ${photo.photographer}
Avg Color: ${photo.avg_color}

URLs:
  Original: ${photo.src.original}
  Large 2x: ${photo.src.large2x}
  Large: ${photo.src.large}
  Medium: ${photo.src.medium}
  Small: ${photo.src.small}
  Portrait: ${photo.src.portrait}
  Landscape: ${photo.src.landscape}
  Tiny: ${photo.src.tiny}
`);
  } else {
    console.log(`
Pexels Stock Search Skill

Usage:
  pexels.ts search <query> [options]
  pexels.ts curated [options]
  pexels.ts photo <id>

Options:
  --per-page N   Number of results (default: 20)
  --page N       Page number (default: 1)

Examples:
  pexels.ts search "sunset"
  pexels.ts search "technology" --per-page 10
  pexels.ts curated
  pexels.ts photo 12345678

Setup:
  Add your API key in Zo Settings > Advanced > Secrets as PEXELS_API_KEY
  Get free key at: https://www.pexels.com/api
`);
  }
}

main();
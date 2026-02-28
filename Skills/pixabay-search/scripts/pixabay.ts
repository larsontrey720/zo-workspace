import { parseArgs } from "util";

const BASE_URL = "https://pixabay.com/api/";

async function searchImages(query: string, options: Record<string, string>) {
  const params = new URLSearchParams({
    key: process.env.PIXABAY_API_KEY || "",
    q: query,
    ...options,
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

async function searchVideos(query: string, options: Record<string, string>) {
  const params = new URLSearchParams({
    key: process.env.PIXABAY_API_KEY || "",
    q: query,
    ...options,
  });

  const response = await fetch(`${BASE_URL}videos/?${params}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

async function getImage(id: string) {
  const params = new URLSearchParams({
    key: process.env.PIXABAY_API_KEY || "",
    id: id,
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Pixabay Search CLI

Usage:
  pixabay.ts search <query> [options]
  pixabay.ts videos <query> [options]
  pixabay.ts get <id>

Options:
  --per-page <n>       Number of results (default: 10, max: 200)
  --page <n>           Page number
  --image-type <type>  all, photo, illustration, vector
  --orientation <o>    all, horizontal, vertical
  --category <cat>     backgrounds, fashion, nature, science, education, 
                       feelings, health, people, religion, places, animals, 
                       industry, computer, food, sports, transportation, 
                       travel, buildings, business, music
  --colors <cols>      grayscale, transparent, red, orange, yellow, green, 
                       turquoise, blue, lilac, pink, white, gray, black, brown
  --editors-choice     Show editor's choice only
  --safe-search        Safe search on

Examples:
  pixabay.ts search "sunset" --per-page 20
  pixabay.ts search "tech" --category computer --orientation horizontal
  pixabay.ts videos "ocean"
  pixabay.ts get 123456
`);
    process.exit(0);
  }

  const command = args[0];
  
  if (command === "search" && args.length > 1) {
    const query = args[1];
    const options: Record<string, string> = {};
    
    for (let i = 2; i < args.length; i += 2) {
      if (args[i].startsWith("--")) {
        const key = args[i].slice(2);
        const value = args[i + 1] || "";
        if (key === "per-page") options["per_page"] = value;
        else if (key === "image-type") options["image_type"] = value;
        else if (key === "editors-choice") options["editors_choice"] = "true";
        else if (key === "safe-search") options["safesearch"] = "true";
        else options[key] = value;
      }
    }
    
    if (!options.per_page) options.per_page = "10";
    
    const results = await searchImages(query, options);
    console.log(JSON.stringify(results, null, 2));
  } 
  else if (command === "videos" && args.length > 1) {
    const query = args[1];
    const options: Record<string, string> = {};
    
    for (let i = 2; i < args.length; i += 2) {
      if (args[i].startsWith("--")) {
        const key = args[i].slice(2);
        const value = args[i + 1] || "";
        if (key === "per-page") options["per_page"] = value;
        else options[key] = value;
      }
    }
    
    if (!options.per_page) options.per_page = "10";
    
    const results = await searchVideos(query, options);
    console.log(JSON.stringify(results, null, 2));
  }
  else if (command === "get" && args.length > 1) {
    const id = args[1];
    const result = await getImage(id);
    console.log(JSON.stringify(result, null, 2));
  }
  else {
    console.error("Invalid command. Use --help for usage.");
    process.exit(1);
  }
}

main().catch(console.error);
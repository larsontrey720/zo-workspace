# Pixabay Stock Media Skill

Search and download stock photos and videos from Pixabay using their free API.

## Setup

Get your free API key from https://pixabay.com/api/

Save it in Zo Settings > Advanced > Secrets as: `PIXABAY_API_KEY`

## Usage

Search photos:
```bash
bun Skills/pixabay-stock/scripts/pixabay.ts search-photos "nature landscape" --per-page 10
```

Search videos:
```bash
bun Skills/pixabay-stock/scripts/pixabay.ts search-videos "ocean waves" --per-page 5
```

Get a specific image by ID:
```bash
bun Skills/pixabay-stock/scripts/pixabay.ts get-photo 195893
```

Get a specific video by ID:
```bash
bun Skills/pixabay-stock/scripts/pixabay.ts get-video 125
```

## Commands

- `search-photos` - Search for photos with optional filters (query, category, min_width, min_height, editors_choice, safesearch, order, page, per_page)
- `search-videos` - Search for videos with optional filters (query, category, video_type, min_width, min_height, editors_choice, safesearch, order, page, per_page)
- `get-photo` - Get a specific photo by ID
- `get-video` - Get a specific video by ID

## Response

Returns JSON with:
- total: total number of hits
- hits: array of results with URLs for different sizes
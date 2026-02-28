# Stock Media Search Skill

Search royalty-free images and videos from Pixabay and Pexels.

## Setup

API keys must be saved in Zo Settings > Advanced > Secrets:
- PIXABAY_API_KEY
- PEXELS_API_KEY

## Usage

```bash
# Search Pixabay images
bun Skills/stock-media/scripts/search.ts pixabay image "sunset beach"

# Search Pixabay videos
bun Skills/stock-media/scripts/search.ts pixabay video "ocean waves"

# Search Pexels photos
bun Skills/stock-media/scripts/search.ts pexels photo "mountain"

# Search Pexels videos
bun Skills/stock-media/scripts/search.ts pexels video "forest"

# Get specific image by ID
bun Skills/stock-media/scripts/search.ts pixabay get-image 12345

# Download image
bun Skills/stock-media/scripts/search.ts download "image_url" /path/to/save.jpg
```

## What it does

1. Searches Pixabay or Pexels API
2. Returns results with URLs, dimensions, author info
3. Optionally downloads images/videos to workspace
4. Shows attribution as required by both services
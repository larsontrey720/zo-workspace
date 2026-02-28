# Pixabay Stock Search Skill

Search free stock photos and videos from Pixabay API.

## Setup

Save your Pixabay API key in Zo Settings > Advanced > Secrets as `PIXABAY_API_KEY`.

## Usage

```bash
# Search photos
bun Skills/pixabay-stock-search/scripts/pixabay.ts search "nature"
bun Skills/pixabay-stock-search/scripts/pixabay.ts search "business" --per-page 10

# Search videos
bun Skills/pixabay-stock-search/scripts/pixabay.ts videos "ocean"

# Get image details
bun Skills/pixabay-stock-search/scripts/pixabay.ts image IMAGE_ID
```

## API Details

Base URL: `https://pixabay.com/api/`

Free tier: Unlimited requests

Key endpoints:
- Photos: `/api/?key={KEY}&q={query}&image_type=photo`
- Videos: `/api/videos/?key={KEY}&q={query}`

Returns: previewURL, webformatURL, largeImageURL, fullHDURL, imageURL
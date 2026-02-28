# Pexels Stock Search Skill

Search free stock photos from Pexels API.

## Setup

Save your Pexels API key in Zo Settings > Advanced > Secrets as `PEXELS_API_KEY`.

## Usage

```bash
# Search photos
bun Skills/pexels-stock-search/scripts/pexels.ts search "nature"
bun Skills/pexels-stock-search/scripts/pexels.ts search "business" --per-page 10

# Curated photos
bun Skills/pexels-stock-search/scripts/pexels.ts curated

# Get photo details
bun Skills/pexels-stock-search/scripts/pexels.ts photo PHOTO_ID
```

## API Details

Base URL: `https://api.pexels.com/v1`

Free tier: 200 requests/hour, 20,000 requests/month

Key endpoints:
- Search: `/v1/search?query={query}`
- Curated: `/v1/curated`
- Photo: `/v1/photos/{id}`

Returns: src[original, large2x, large, medium, small, portrait, landscape, tiny]
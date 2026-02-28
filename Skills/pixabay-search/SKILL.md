# Pixabay Search Skill

Search royalty-free images and videos from Pixabay using their free API.

## Usage

```bash
# Search images
bun Skills/pixabay-search/scripts/pixabay.ts search "nature" --per-page 10

# Search with filters
bun Skills/pixabay-search/scripts/pixabay.ts search "business" --category business --orientation horizontal --image-type photo

# Get image by ID
bun Skills/pixabay-search/scripts/pixabay.ts get 123456

# Search videos
bun Skills/pixabay-search/scripts/pixabay.ts videos "ocean"
```

## API Details

- Rate limit: 100 requests per 60 seconds
- API key required: Set PIXABAY_API_KEY in Zo secrets
- Free for non-commercial and commercial use (attribution required)

## Environment Variables

- PIXABAY_API_KEY: Your Pixabay API key
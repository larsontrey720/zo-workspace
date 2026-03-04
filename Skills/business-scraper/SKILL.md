---
name: business-scraper
description: Scrape business leads from Yellow Pages, Yelp, and local directories. Use for lead generation, competitor analysis, and sales outreach.
compatibility: Created for Zo Computer
metadata:
  author: georgeo.zo.computer
---

# Business Lead Scraper

Scrape business data from directories for lead generation and sales outreach.

## Usage

```bash
# Yellow Pages
node scripts/scraper.js yellowpages restaurants "New York"
node scripts/scraper.js yellowpages clinics "Los Angeles"
node scripts/scraper.js yellowpages "law firms" "Chicago"

# Yelp
node scripts/scraper.js yelp plumbers "Houston"
node scripts/scraper.js yelp electricians "Phoenix"
```

## Output

Returns JSON array with:
- `name` - Business name
- `phone` - Phone number
- `address` - Street address
- `website` - Website URL (if available)
- `rating` - Customer rating (if available)

## Notes

- Rate limit: 1 request per 5 seconds
- Some fields may be null due to directory structure
- Use residential proxies for production scraping
- For Google Maps data, use Google Places API (requires billing)

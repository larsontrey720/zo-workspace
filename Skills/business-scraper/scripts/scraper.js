const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Business Lead Scraper
 * 
 * Supports:
 * - Yellow Pages
 * - Yelp
 * - Local directories
 * 
 * Usage:
 *   node google-maps-scraper.js yellowpages restaurants "New York"
 *   node google-maps-scraper.js yelp plumbers "Los Angeles"
 */

const SOURCE = process.argv[2] || 'yellowpages';
const CATEGORY = process.argv[3] || 'restaurants';
const CITY = process.argv[4] || 'New York';

async function scrapeYellowPages(category, city) {
  console.log(`\n📍 Scraping Yellow Pages: ${category} in ${city}\n`);
  
  const url = `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(category)}&geo_location_terms=${encodeURIComponent(city)}`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const businesses = [];
    
    $('.search-results .result').each((i, el) => {
      if (i >= 20) return; // Limit to 20 results
      
      const name = $(el).find('.business-name span').text().trim() || 
                  $(el).find('.business-name').text().trim();
      const phone = $(el).find('.phone').text().trim();
      const address = $(el).find('.address').text().trim();
      const website = $(el).find('.website-link').attr('href');
      const rating = $(el).find('.rating .rating').attr('aria-label');
      
      if (name) {
        businesses.push({
          name,
          phone: phone || null,
          address: address || null,
          website: website || null,
          rating: rating || null
        });
      }
    });
    
    console.log(`✅ Found ${businesses.length} businesses from Yellow Pages\n`);
    return businesses;
  } catch (error) {
    console.error('❌ Yellow Pages Error:', error.message);
    return [];
  }
}

async function scrapeYelp(category, city) {
  console.log(`\n📍 Scraping Yelp: ${category} in ${city}\n`);
  
  const url = `https://www.yelp.com/search?find_desc=${encodeURIComponent(category)}&find_loc=${encodeURIComponent(city)}`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const businesses = [];
    
    $('.yelp-results .biz-ListingInfo').each((i, el) => {
      if (i >= 20) return;
      
      const name = $(el).find('.biz-name').text().trim();
      const phone = $(el).find('.biz-phone').text().trim();
      const address = $(el).find('.address').text().trim();
      const rating = $(el).find('.rating').attr('aria-label');
      const website = $(el).find('.biz-website').attr('href');
      
      if (name) {
        businesses.push({
          name,
          phone: phone || null,
          address: address || null,
          rating: rating || null,
          website: website || null
        });
      }
    });
    
    console.log(`✅ Found ${businesses.length} businesses from Yelp\n`);
    return businesses;
  } catch (error) {
    console.error('❌ Yelp Error:', error.message);
    return [];
  }
}

// Export
module.exports = { scrapeYellowPages, scrapeYelp };

// Run
if (require.main === module) {
  (async () => {
    let results = [];
    
    if (SOURCE === 'yelp') {
      results = await scrapeYelp(CATEGORY, CITY);
    } else {
      results = await scrapeYellowPages(CATEGORY, CITY);
    }
    
    console.log('📊 Results:');
    console.log(JSON.stringify(results, null, 2));
  })();
}

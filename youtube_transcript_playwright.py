#!/usr/bin/env python3
"""
YouTube Transcript Extractor using Playwright
Usage: python youtube_transcript_playwright.py <video_url>

Install: pip install playwright && playwright install chromium
"""

import sys
import asyncio
from playwright.async_api import async_playwright

async def get_youtube_transcript(video_url):
    """Extract transcript from YouTube video using Playwright."""
    
    async with async_playwright() as p:
        # Launch browser (headless=True for no GUI)
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print(f"Loading: {video_url}")
        await page.goto(video_url)
        
        # Wait for page to load
        await page.wait_for_load_state("networkidle")
        
        # Get title
        title = await page.title()
        print(f"Title: {title}")
        
        # Try to find and click transcript button
        try:
            # Look for "Show transcript" button
            transcript_btn = page.locator('button:has-text("Show transcript")')
            if await transcript_btn.count() > 0:
                await transcript_btn.click()
                print("Clicked 'Show transcript'")
                await asyncio.sleep(2)
            else:
                # Try clicking "Show more" first
                show_more = page.locator('yt-formatted-string:has-text("Show more")')
                if await show_more.count() > 0:
                    await show_more.click()
                    await asyncio.sleep(1)
                    transcript_btn = page.locator('button:has-text("Show transcript")')
                    if await transcript_btn.count() > 0:
                        await transcript_btn.click()
                        await asyncio.sleep(2)
        except Exception as e:
            print(f"Button click issue: {e}")
        
        # Try to extract transcript
        transcript = ""
        
        # Method 1: Look for transcript segment elements
        try:
            segments = page.locator('ytd-transcript-segment-renderer')
            count = await segments.count()
            print(f"Found {count} transcript segments")
            
            for i in range(min(count, 200)):  # Limit to 200 segments
                text = await segments.nth(i).text_content()
                if text:
                    transcript += text.strip() + "\n"
        except Exception as e:
            print(f"Segment extraction: {e}")
        
        # Method 2: Try getting all text from transcript panel
        if not transcript:
            try:
                transcript_panel = page.locator('#segments-container, .ytd-transcript-renderer')
                if await transcript_panel.count() > 0:
                    transcript = await transcript_panel.first.text_content()
            except:
                pass
        
        if transcript:
            print(f"\n--- TRANSCRIPT ({len(transcript)} chars) ---\n")
            print(transcript[:2500])
            
            # Save to file
            vid_id = video_url.split('=')[-1].split('&')[0]
            filename = f"transcript_{vid_id}.txt"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(f"Video: {title}\nURL: {video_url}\n{'='*50}\n\n{transcript}")
            print(f"\nSaved to: {filename}")
        else:
            print("No transcript found")
        
        await browser.close()


def main():
    if len(sys.argv) < 2:
        print("Usage: python youtube_transcript_playwright.py <video_url>")
        sys.exit(1)
    
    asyncio.run(get_youtube_transcript(sys.argv[1]))


if __name__ == "__main__":
    main()

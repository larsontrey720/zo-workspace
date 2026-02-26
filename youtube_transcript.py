#!/usr/bin/env python3
"""
YouTube Transcript Extractor using Selenium
Usage: python youtube_transcript.py <video_url>
Example: python youtube_transcript.py "https://www.youtube.com/watch?v=6a7tDPmyTOA"
"""

import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

def get_youtube_transcript(video_url, headless=True):
    """
    Extract transcript from a YouTube video using Selenium.
    """
    # Setup Chrome options
    chrome_options = Options()
    if headless:
        chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--lang=en-US")
    
    # Initialize driver
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print(f"Loading video: {video_url}")
        driver.get(video_url)
        
        # Wait for page to load
        time.sleep(3)
        
        # Get video title
        title = driver.title.replace(" - YouTube", "")
        print(f"Video title: {title}")
        
        # Click "Show transcript" button if available
        # The transcript button is usually below the description
        try:
            # Find and click the transcript button
            transcript_buttons = driver.find_elements(By.XPATH, 
                "//button[contains(., 'Show transcript')]")
            
            if transcript_buttons:
                transcript_buttons[0].click()
                print("Clicked 'Show transcript' button")
                time.sleep(2)
            else:
                # Try alternative - click more button then transcript
                more_btn = driver.find_elements(By.XPATH, 
                    "//yt-formatted-string[contains(., 'Show more')]")
                if more_btn:
                    more_btn[0].click()
                    time.sleep(1)
                    transcript_buttons = driver.find_elements(By.XPATH, 
                        "//button[contains(., 'Show transcript')]")
                    if transcript_buttons:
                        transcript_buttons[0].click()
                        time.sleep(2)
        except Exception as e:
            print(f"Could not click transcript button: {e}")
        
        # Try to find and extract transcript panel
        transcript_text = ""
        
        # Method 1: Look for transcript container
        try:
            # The transcript is usually in a div with ytd-transcript-segment-list-element
            transcript_elements = driver.find_elements(By.CSS_SELECTOR, 
                "ytd-transcript-segment-renderer, ytd-transcript-body")
            
            if transcript_elements:
                for elem in transcript_elements[:100]:  # First 100 segments
                    try:
                        text = elem.text.strip()
                        if text:
                            transcript_text += text + "\n"
                    except:
                        pass
        except Exception as e:
            print(f"Method 1 failed: {e}")
        
        # Method 2: Alternative transcript container
        if not transcript_text:
            try:
                # Try finding by class name
                transcript_panel = driver.find_element(By.CSS_SELECTOR, 
                    ".ytd-transcript-renderer, #segments-container")
                transcript_text = transcript_panel.text
            except:
                pass
        
        # Method 3: Get from ytInitialPlayerResponse (embedded JSON)
        if not transcript_text:
            try:
                page_source = driver.page_source
                if '"captions":' in page_source:
                    import re
                    # Extract captions JSON
                    captions_match = re.search(r'"captions":({.*?}}})', page_source)
                    if captions_match:
                        import json
                        captions = json.loads(captions_match.group(1))
                        if 'playerCaptionsTracklistRenderer' in captions:
                            print("Found captions in page source")
            except Exception as e:
                print(f"Method 3 failed: {e}")
        
        if transcript_text:
            print(f"\n--- TRANSCRIPT ({len(transcript_text)} chars) ---\n")
            print(transcript_text[:3000])  # Print first 3000 chars
            if len(transcript_text) > 3000:
                print(f"\n... (truncated, {len(transcript_text)} total chars)")
            
            # Save to file
            filename = f"transcript_{video_url.split('=')[1]}.txt"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(f"Video: {title}\n")
                f.write(f"URL: {video_url}\n")
                f.write("=" * 50 + "\n\n")
                f.write(transcript_text)
            print(f"\nSaved to: {filename}")
            
            return transcript_text
        else:
            print("No transcript found. Video may not have captions enabled.")
            return None
            
    except Exception as e:
        print(f"Error: {e}")
        return None
    
    finally:
        driver.quit()


def main():
    if len(sys.argv) < 2:
        print("Usage: python youtube_transcript.py <video_url>")
        print("Example: python youtube_transcript.py 'https://www.youtube.com/watch?v=6a7tDPmyTOA'")
        sys.exit(1)
    
    video_url = sys.argv[1]
    get_youtube_transcript(video_url, headless=True)


if __name__ == "__main__":
    main()

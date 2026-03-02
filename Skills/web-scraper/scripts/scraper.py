#!/usr/bin/env python3
"""Web scraper with tiered approach: httpx -> BeautifulSoup -> Crawl4AI."""
import argparse
import asyncio
import json
import sys
from pathlib import Path
from urllib.parse import urljoin
import httpx
from bs4 import BeautifulSoup
def fetch\_simple(url: str, timeout: int = 30) -> tuple[str, str]:
"""Tier 1: Simple HTTP fetch. Returns (html, content\_type)."""
headers = {
"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10\_15\_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
}
r = httpx.get(url, headers=headers, timeout=timeout, follow\_redirects=True)
r.raise\_for\_status()
return r.text, r.headers.get("content-type", "")
def html\_to\_markdown(html: str, url: str = "") -> str:
"""Convert HTML to clean markdown-ish text."""
soup = BeautifulSoup(html, "html.parser")
for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript"]):
tag.decompose()
text = soup.get\_text(separator="\n", strip=True)
lines = [line.strip() for line in text.splitlines() if line.strip()]
return "\n".join(lines)
def extract\_css(html: str, selector: str, url: str = "") -> list[dict]:
"""Tier 2: Extract elements matching a CSS selector."""
soup = BeautifulSoup(html, "html.parser")
results = []
for el in soup.select(selector):
item = {"text": el.get\_text(strip=True)}
if el.get("href"):
item["href"] = urljoin(url, el["href"])
if el.get("src"):
item["src"] = urljoin(url, el["src"])
if el.name in ("img",) and el.get("alt"):
item["alt"] = el["alt"]
results.append(item)
return results
def extract\_schema(html: str, schema: dict, url: str = "") -> list[dict]:
"""Tier 2: Extract structured data using a JSON CSS schema."""
soup = BeautifulSoup(html, "html.parser")
base\_selector = schema.get("baseSelector", "body")
fields = schema.get("fields", [])
results = []
for container in soup.select(base\_selector):
item = {}
for field in fields:
name = field["name"]
sel = field.get("selector", "")
ftype = field.get("type", "text")
el = container.select\_one(sel) if sel else container
if el is None:
item[name] = None
continue
if ftype == "text":
item[name] = el.get\_text(strip=True)
elif ftype == "attribute":
attr = field.get("attribute", "href")
val = el.get(attr, "")
if attr in ("href", "src") and val:
val = urljoin(url, val)
item[name] = val
elif ftype == "html":
item[name] = str(el)
elif ftype == "exists":
item[name] = True
else:
item[name] = el.get\_text(strip=True)
results.append(item)
return results
async def scrape\_with\_js(url: str, timeout: int = 30, wait: float = 0) -> str:
"""Tier 3: Fetch with JavaScript rendering via Crawl4AI."""
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
config = CrawlerRunConfig(
cache\_mode=CacheMode.BYPASS,
page\_timeout=timeout \* 1000,
delay\_before\_return\_html=wait,
)
async with AsyncWebCrawler() as crawler:
result = await crawler.arun(url=url, config=config)
if result.success:
return result.markdown or result.html or ""
raise RuntimeError(f"Crawl4AI failed: {result.error\_message}")
async def extract\_with\_llm(url: str, instruction: str, timeout: int = 30) -> str:
"""Tier 5: LLM-powered extraction via Crawl4AI."""
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from crawl4ai.extraction\_strategy import LLMExtractionStrategy
strategy = LLMExtractionStrategy(
instruction=instruction,
)
config = CrawlerRunConfig(
cache\_mode=CacheMode.BYPASS,
page\_timeout=timeout \* 1000,
extraction\_strategy=strategy,
)
async with AsyncWebCrawler() as crawler:
result = await crawler.arun(url=url, config=config)
if result.success:
return result.extracted\_content or result.markdown or ""
raise RuntimeError(f"LLM extraction failed: {result.error\_message}")
async def deep\_crawl(url: str, depth: int = 2, max\_pages: int = 20, timeout: int = 30) -> list[dict]:
"""Tier 4: Deep crawl with BFS link following via Crawl4AI."""
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
config = CrawlerRunConfig(
cache\_mode=CacheMode.BYPASS,
page\_timeout=timeout \* 1000,
)
visited = set()
queue = [(url, 0)]
results = []
async with AsyncWebCrawler() as crawler:
while queue and len(results) < max\_pages:
current\_url, current\_depth = queue.pop(0)
if current\_url in visited:
continue
visited.add(current\_url)
try:
result = await crawler.arun(url=current\_url, config=config)
if not result.success:
continue
page\_data = {
"url": current\_url,
"depth": current\_depth,
"title": "",
"content": result.markdown or "",
}
if result.html:
soup = BeautifulSoup(result.html, "html.parser")
title\_tag = soup.find("title")
if title\_tag:
page\_data["title"] = title\_tag.get\_text(strip=True)
results.append(page\_data)
print(f"[{len(results)}/{max\_pages}] depth={current\_depth} {current\_url}", file=sys.stderr)
if current\_depth < depth and result.links:
internal = result.links.get("internal", [])
for link in internal:
href = link.get("href", "") if isinstance(link, dict) else str(link)
if href and href not in visited:
queue.append((href, current\_depth + 1))
except Exception as e:
print(f"[error] {current\_url}: {e}", file=sys.stderr)
continue
return results
async def batch\_scrape(urls: list[str], css: str = None, schema: dict = None, js: bool = False, timeout: int = 30) -> list[dict]:
"""Batch scrape multiple URLs."""
results = []
for url in urls:
url = url.strip()
if not url or url.startswith("#"):
continue
try:
if js:
html\_content = await scrape\_with\_js(url, timeout)
html = html\_content
else:
html, \_ = fetch\_simple(url, timeout)
if schema:
data = extract\_schema(html, schema, url)
results.append({"url": url, "data": data})
elif css:
data = extract\_css(html, css, url)
results.append({"url": url, "data": data})
else:
md = html\_to\_markdown(html, url)
results.append({"url": url, "content": md})
print(f"[ok] {url}", file=sys.stderr)
except Exception as e:
results.append({"url": url, "error": str(e)})
print(f"[error] {url}: {e}", file=sys.stderr)
return results
def output\_result(data, fmt: str, output\_path: str = None):
"""Write result to stdout or file."""
if fmt == "json":
text = json.dumps(data, indent=2, ensure\_ascii=False)
elif isinstance(data, str):
text = data
elif isinstance(data, list):
text = json.dumps(data, indent=2, ensure\_ascii=False)
else:
text = str(data)
if output\_path:
Path(output\_path).parent.mkdir(parents=True, exist\_ok=True)
Path(output\_path).write\_text(text)
print(f"Saved to {output\_path}", file=sys.stderr)
else:
print(text)
def main():
parser = argparse.ArgumentParser(description="Web scraper with tiered approach")
sub = parser.add\_subparsers(dest="command", required=True)
# scrape
sp = sub.add\_parser("scrape", help="Scrape a single URL")
sp.add\_argument("url")
sp.add\_argument("--css", help="CSS selector to extract")
sp.add\_argument("--schema", help="Path to JSON schema file for structured extraction")
sp.add\_argument("--llm-extract", dest="llm\_extract", help="LLM extraction instruction")
sp.add\_argument("--js", action="store\_true", help="Force JS rendering")
sp.add\_argument("--wait", type=float, default=0, help="Wait seconds after page load")
sp.add\_argument("--timeout", type=int, default=30, help="Request timeout in seconds")
sp.add\_argument("--output", help="Save to file")
sp.add\_argument("--format", choices=["json", "md", "text"], default=None)
# crawl
cp = sub.add\_parser("crawl", help="Deep crawl a site")
cp.add\_argument("url")
cp.add\_argument("--depth", type=int, default=2, help="Max crawl depth")
cp.add\_argument("--max-pages", type=int, default=20, help="Max pages to crawl")
cp.add\_argument("--timeout", type=int, default=30)
cp.add\_argument("--output", help="Save to file")
# batch
bp = sub.add\_parser("batch", help="Batch scrape URLs from file")
bp.add\_argument("file", help="File with URLs, one per line")
bp.add\_argument("--css", help="CSS selector to extract from each page")
bp.add\_argument("--schema", help="Path to JSON schema file")
bp.add\_argument("--js", action="store\_true")
bp.add\_argument("--timeout", type=int, default=30)
bp.add\_argument("--output", help="Save to file")
args = parser.parse\_args()
if args.command == "scrape":
if args.llm\_extract:
result = asyncio.run(extract\_with\_llm(args.url, args.llm\_extract, args.timeout))
fmt = args.format or "json"
output\_result(result, fmt, args.output)
elif args.schema:
schema = json.loads(Path(args.schema).read\_text())
if args.js:
html = asyncio.run(scrape\_with\_js(args.url, args.timeout, args.wait))
else:
try:
html, \_ = fetch\_simple(args.url, args.timeout)
except Exception:
print("Simple fetch failed, trying JS rendering...", file=sys.stderr)
html = asyncio.run(scrape\_with\_js(args.url, args.timeout, args.wait))
data = extract\_schema(html, schema, args.url)
output\_result(data, args.format or "json", args.output)
elif args.css:
if args.js:
html = asyncio.run(scrape\_with\_js(args.url, args.timeout, args.wait))
else:
try:
html, \_ = fetch\_simple(args.url, args.timeout)
except Exception:
print("Simple fetch failed, trying JS rendering...", file=sys.stderr)
html = asyncio.run(scrape\_with\_js(args.url, args.timeout, args.wait))
data = extract\_css(html, args.css, args.url)
output\_result(data, args.format or "json", args.output)
else:
if args.js:
content = asyncio.run(scrape\_with\_js(args.url, args.timeout, args.wait))
else:
try:
html, \_ = fetch\_simple(args.url, args.timeout)
content = html\_to\_markdown(html, args.url)
except Exception:
print("Simple fetch failed, trying JS rendering...", file=sys.stderr)
content = asyncio.run(scrape\_with\_js(args.url, args.timeout, args.wait))
output\_result(content, args.format or "md", args.output)
elif args.command == "crawl":
results = asyncio.run(deep\_crawl(args.url, args.depth, args.max\_pages, args.timeout))
output\_result(results, "json", args.output)
elif args.command == "batch":
urls = Path(args.file).read\_text().strip().splitlines()
schema = json.loads(Path(args.schema).read\_text()) if args.schema else None
results = asyncio.run(batch\_scrape(urls, args.css, schema, args.js, args.timeout))
output\_result(results, "json", args.output)
if \_\_name\_\_ == "\_\_main\_\_":
main()
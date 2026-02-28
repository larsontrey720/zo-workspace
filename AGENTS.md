# AGENTS.md - Workspace Memory & Guidance

## User Info

- Handle: ola
- Name: Emperor MK
- Owns StreamLeap Studio (YouTube analytics tool) at streamleapstudio.xyz
- My GitHub: larsontrey720
- Email: olashadeclassic@gmail.com
- Connected Telegram: @emperormk1, @emperormk01

## Important Rules

- Do NOT use asterisks (\*) in any responses - plain text only
- Each conversation session starts fresh - no memory of previous sessions unless AGENTS.md/SOUL.md are read
- User prefers concise responses
- Remember things between sessions by updating this file

## Git Identity for Pushes

- When making Git commits/pushes, use identity: **Larson Trey** 
- Run: `git config --global user.name "Larson Trey"` before committing

## Recent Projects

- StreamLeap Studio growth planning
- Sporty Claw competitive analysis
- Bug bounty hunting (roborock.com scan completed)
- Building skills for temp email and signup automation

## Skills Created

- /home/workspace/Skills/catchmail/ - Catchmail temp email skill
- /home/workspace/Skills/transcript-api-signup/ - TranscriptAPI signup skill
- /home/workspace/Skills/bug-bounty/ - Bug bounty hunting skill
- /home/workspace/Skills/stock-media/ - Pixabay and Pexels stock media search skill
- /home/workspace/Skills/coqui-tts/ - Free open-source text-to-speech

## Bug Bounty

- Tested: us.roborock.com (no vulnerabilities found)
- Report pushed to: https://github.com/larsontrey720/hello-world/roborock-findings.md

## Bug Bounty Tools Installed

Directory: /root/go/bin

**Subdomain Enum:** subfinder, assetfinder, amass
**Scanning:** httpx, nuclei, nmap
**Fuzzing:** ffuf
**Screenshot:** gowitness
**Recon:** theHarvester, httprobe, whois, dig, curl, wget

## Notes

- Browser sessions reset between turns - use catchmail MCP or API for temp emails
- User wants me to remember everything between sessions - always update AGENTS.md
## Bug Bounty Tools Installed

Location: /root/go/bin
- subfinder - subdomain enumeration
- amass - backup subdomain enumeration  
- httpx - HTTP probing
- gowitness - website screenshots
- nuclei - vulnerability scanning
- ffuf - web fuzzing
- nmap - port scanning
- whois, dig, nslookup - DNS utilities

## Bug Bounty Skill Updates (Feb 2025)

Added from Rhynorater DEF CON talk:
- Mobile tools: Frida, Objection, Polar Proxy
- IoT/Hardware: eMMC reader, hot air station, binwalk
- Binary analysis: hex editors, protobuf parsers
- VoIP/SIP testing tools
- Key attack techniques: 403 bypass via double encoding, IDOR in numeric IDs, SQLi in protobuf, hardcoded creds in JS/docs
- Mindset: 40+ hours understanding app before hunting, threat model changes = new attack surface


## Bug Bounty Scanning Preferences

Always run FULL scans including:
- Full port scan: nmap -p- -T4
- Screenshot collection: gowitness
- Sensitive files check: .env, config, .git, backup, admin panels
- ALL severity levels in nuclei (not just critical/high)
- Check API endpoints, login pages, admin panels
- Manual checks for IDOR, SQLi, XSS

Study target app for 40+ hours before expecting bugs.

## Bug Bounty Report Template

Structure all bug bounty reports with this format:

**File**: `[target]-[date].md`
**Location**: `/home/workspace/bugbounty-findings/`

**Template Structure:**
1. Executive Summary - Brief overview
2. Critical Findings - Most severe issues first
3. High Findings - Important but less severe
4. Medium Findings - Moderate risk
5. Low Findings - Minor issues
6. Recommendations - How to fix

**For each finding include:**
- Severity level (CRITICAL/HIGH/MEDIUM/LOW)
- Description of the finding
- Actual value/payload found
- Security impact
- Location (URL/path)

**Push to GitHub after each scan:**
```bash
cd /home/workspace/bugbounty-findings
git add .
git commit -m "Add [target] scan"
git push origin master
```


## Cloudflare Bypass Techniques

### Method 1: Scrapling (Python)
```bash
pip3 install "scrapling[fetch]"
python3 -c "
from scrapling import Fetcher
f = Fetcher().init()
r = f.get('https://target.com')
print(r.text)
"
```

### Method 2: curl with headers
```bash
curl -sL -H "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
     -H "accept: text/html,application/xhtml+xml" \
     -H "accept-language: en-US,en;q=0.9" \
     https://target.com
```

### Method 3: Playwright (Browser automation)
```bash
pip3 install playwright
playwright install chromium
python3 -c "
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('https://target.com')
    print(page.content())
"
```

### Key Headers to Mimic:
- user-agent: Chrome on Windows/Mac
- accept: text/html,application/xhtml+xml
- accept-language: en-US,en;q=0.9
- sec-ch-ua: Chrome browser
- sec-fetch-mode: navigate
- upgrade-insecure-requests: 1


## Pentest-Book Reference

Key reference: https://github.com/six2dez/pentest-book (1.9k stars)
- Comprehensive pentesting methodology
- All web vulnerabilities documented
- Cloud security (AWS, Azure, GCP, K8s)
- Bug bounty specific tips
- Tool comparisons and reviews

Updated bug-bounty SKILL.md with reference to this resource.


## Latest CTI: AI-Augmented Threat Actors

Source: AWS Security Blog (Feb 2026)
- Threat actor compromised 600+ FortiGate devices globally
- Initial access: exposed management ports + weak credentials
- Tools: Nuclei, gogo, Meterpreter, mimikatz, Impacket
- CVEs: CVE-2023-27532, CVE-2024-40711 (Veeam)
- Key finding: AI-generated tooling lacks robustness

Added to bug-bounty SKILL.md for reference.


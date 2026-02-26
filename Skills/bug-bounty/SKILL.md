---
name: bug-bounty
description: Automated bug bounty hunting workflow - recon, scanning, and vulnerability assessment using subfinder, httpx, ffuf, and nuclei
metadata:
  author: ola.zo.computer
allowed-tools: Bash, Read, Grep, Web-Read, Browser
---

# Bug Bounty Hunter Skill

This skill provides a complete recon and vulnerability scanning workflow for bug bounty hunting.

## Available Tools

- **nmap** - Network scanning and port detection
- **subfinder** - Passive subdomain enumeration
- **httpx** - HTTP probing for alive hosts
- **ffuf** - Web fuzzing and directory busting
- **nuclei** - Vulnerability scanning with templates

## Workflow Stages

### 1. Recon (Passive)
- Subdomain enumeration via subfinder
- DNS resolution check
- HTTP probe to filter live hosts

### 2. Scanning
- Port scanning with nmap
- Web technology detection
- Vulnerability scanning with nuclei templates

### 3. Fuzzing
- Directory/parameter fuzzing with ffuf
- Endpoint discovery
- Parameter brute-force

## Usage

Run any of these commands (I'll execute them):

```
bugbounty-recon <domain>     # Full recon workflow
bugbounty-scan <target>      # Active scanning
bugbounty-fuzz <url>         # Web fuzzing
```

## Tools Location

All tools are in PATH at `/root/go/bin` (already in PATH).
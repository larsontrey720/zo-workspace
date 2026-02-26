#!/bin/bash
# Bug Bounty Hunter - Automated Recon & Scanning Script

set -e

export PATH=$PATH:/root/go/bin
TARGET=""
MODE="full"

usage() {
    echo "Usage: $0 <domain> [mode]"
    echo "  domain  - Target domain (e.g., example.com)"
    echo "  mode    - recon|scan|fuzz|full (default: full)"
    echo ""
    echo "Examples:"
    echo "  $0 example.com           # Full workflow"
    echo "  $0 example.com recon     # Passive recon only"
    echo "  $0 example.com scan      # Active scanning"
    exit 1
}

if [ $# -lt 1 ]; then
    usage
fi

TARGET="$1"
[ $# -ge 2 ] && MODE="$2"

OUTPUT_DIR="/home/workspace/bugbounty-output/$(date +%Y%m%d_%H%M%S)_${TARGET}"
mkdir -p "$OUTPUT_DIR/subdomains" "$OUTPUT_DIR/scans" "$OUTPUT_DIR/fuzz"

echo "=============================================="
echo "  Bug Bounty Hunter - $TARGET"
echo "  Mode: $MODE"
echo "  Output: $OUTPUT_DIR"
echo "=============================================="

recon() {
    echo "[*] Running subdomain enumeration..."
    subfinder -d "$TARGET" -o "$OUTPUT_DIR/subdomains/subs.txt" 2>/dev/null || true
    
    # Also check for common subdomains
    if [ -f "$OUTPUT_DIR/subdomains/subs.txt" ]; then
        echo "[+] Found $(wc -l < $OUTPUT_DIR/subdomains/subs.txt) subdomains"
    else
        echo "[-] No subdomains found"
        echo "$TARGET" > "$OUTPUT_DIR/subdomains/subs.txt"
    fi
    
    echo "[*] Probing for alive hosts..."
    cat "$OUTPUT_DIR/subdomains/subs.txt" | httpx -silent -threads 50 -o "$OUTPUT_DIR/subdomains/alive.txt" 2>/dev/null || true
    
    if [ -f "$OUTPUT_DIR/subdomains/alive.txt" ]; then
        echo "[+] $(wc -l < $OUTPUT_DIR/subdomains/alive.txt) alive hosts"
    else
        echo "[-] No alive hosts found"
        cp "$OUTPUT_DIR/subdomains/subs.txt" "$OUTPUT_DIR/subdomains/alive.txt"
    fi
    
    echo "[*] Saving subdomain list..."
    cat "$OUTPUT_DIR/subdomains/alive.txt" > "$OUTPUT_DIR/all_hosts.txt"
    echo "$TARGET" >> "$OUTPUT_DIR/all_hosts.txt"
}

scan() {
    echo "[*] Running nuclei vulnerability scan..."
    
    if [ ! -f "$OUTPUT_DIR/all_hosts.txt" ]; then
        echo "[-] No hosts found. Run recon first."
        return 1
    fi
    
    nuclei -l "$OUTPUT_DIR/all_hosts.txt" \
        -severity critical,high,medium \
        -json \
        -o "$OUTPUT_DIR/scans/nuclei_results.json" \
        2>/dev/null || true
    
    # Also run tech detection
    echo "[*] Running technology detection..."
    httpx -l "$OUTPUT_DIR/all_hosts.txt" \
        -tech-detect \
        -json \
        -o "$OUTPUT_DIR/scans/tech_detect.json" \
        2>/dev/null || true
    
    # Port scan top ports
    echo "[*] Running quick port scan..."
    nmap -T4 -F --open -oG "$OUTPUT_DIR/scans/ports.txt" "$TARGET" 2>/dev/null || true
    
    echo "[+] Scan complete. Results in $OUTPUT_DIR/scans/"
}

fuzz() {
    URL="$1"
    if [ -z "$URL" ]; then
        echo "[-] Fuzz mode requires a URL"
        echo "Usage: bugbounty-fuzz https://example.com"
        return 1
    fi
    
    echo "[*] Fuzzing $URL"
    
    # Directory fuzzing
    echo "[*] Directory fuzzing..."
    ffuf -u "${URL}FUZZ" \
        -w /usr/share/wordlists/dirb/common.txt \
        -mc 200,204,301,302,307,401,403 \
        -o "$OUTPUT_DIR/fuzz/directories.json" \
        2>/dev/null || true
    
    # Parameter fuzzing
    echo "[*] Parameter fuzzing..."
    ffuf -u "${URL}?FUZZ=test" \
        -w /usr/share/wordlists/dirb/common.txt \
        -mc 200,204,301,302,307,401,403 \
        -o "$OUTPUT_DIR/fuzz/parameters.json" \
        2>/dev/null || true
    
    echo "[+] Fuzz complete"
}

case "$MODE" in
    recon)
        recon
        ;;
    scan)
        scan
        ;;
    fuzz)
        fuzz "$TARGET"
        ;;
    full)
        recon
        scan
        ;;
    *)
        echo "[-] Unknown mode: $MODE"
        usage
        ;;
esac

echo ""
echo "=============================================="
echo "  Complete! Results in: $OUTPUT_DIR"
echo "=============================================="
echo ""
echo "Files created:"
ls -la "$OUTPUT_DIR" 2>/dev/null || true
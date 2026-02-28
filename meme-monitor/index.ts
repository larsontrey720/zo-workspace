/**
 * NEW TOKEN MONITOR - BOOSTED & TRENDING
 * Real-time new token scanner for Solana and Base.
 * Detects tokens via DexScreener Boosts API and filters for quality.
 * No keywords required.
 */

import { readFileSync, writeFileSync } from "fs";

const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex";
const BOOSTS_API = "https://api.dexscreener.com/token-boosts/latest/v1";
const SCAN_INTERVAL_MS = 30000; // Scan every 30 seconds

// Quality Filters
const MIN_LIQUIDITY = 30000; // $30k+
const MIN_VOLUME_24H = 50000; // $50k+
const MIN_TXNS_24H = 100; // 100+ txns
const MAX_PRICE_DROP_H1 = -30; // Max 30% drop in 1h
const MAX_AGE_MS = 6 * 60 * 60 * 1000; // Max 6 hours old

interface Token {
  chainId: string;
  pairAddress: string;
  baseToken: { symbol: string; address: string };
  priceUsd: string;
  liquidity: { usd: number };
  volume: { h24: number };
  txns: { h24: { buys: number; sells: number } };
  priceChange: { h24: number; h1: number };
  pairCreatedAt?: number;
}

const seenTokens = new Map<string, number>();
const alertsFilePath = "/dev/shm/meme-alerts.json";

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function fetchBoostedTokens(): Promise<{chainId: string, tokenAddress: string}[]> {
  try {
    const res = await fetch(BOOSTS_API);
    if (!res.ok) return [];
    return await res.json() as any[];
  } catch (e) {
    log(`Error fetching boosts: ${e}`);
    return [];
  }
}

async function fetchTokenData(tokenAddress: string): Promise<Token[]> {
  try {
    const res = await fetch(`${DEXSCREENER_API}/tokens/${tokenAddress}`);
    if (!res.ok) return [];
    const data = await res.json() as { pairs?: Token[] };
    return data.pairs || [];
  } catch (e) {
    return [];
  }
}

function checkCriteria(token: Token): { pass: boolean; reasons: string[] } {
  const reasons: string[] = [];
  let pass = true;

  if ((token.liquidity?.usd || 0) < MIN_LIQUIDITY) {
    pass = false;
    reasons.push(`Liq: $${Math.round(token.liquidity?.usd || 0)}`);
  }
  if ((token.volume?.h24 || 0) < MIN_VOLUME_24H) {
    pass = false;
    reasons.push(`Vol: $${Math.round(token.volume?.h24 || 0)}`);
  }
  const totalTxns = (token.txns?.h24?.buys || 0) + (token.txns?.h24?.sells || 0);
  if (totalTxns < MIN_TXNS_24H) {
    pass = false;
    reasons.push(`Txns: ${totalTxns}`);
  }
  if ((token.priceChange?.h1 || 0) < MAX_PRICE_DROP_H1) {
    pass = false;
    reasons.push(`Drop: ${token.priceChange?.h1}%`);
  }
  
  return { pass, reasons };
}

function formatAlert(token: Token): string {
  const age = token.pairCreatedAt ? ((Date.now() - token.pairCreatedAt) / (1000 * 60)).toFixed(0) : "N/A";
  return `
🚀 NEW BOOSTED TOKEN - $${token.baseToken.symbol} (${token.chainId.toUpperCase()})
• Age: ${age}m | Price: $${parseFloat(token.priceUsd).toFixed(6)}
• Liq: $${Math.round(token.liquidity?.usd || 0).toLocaleString()} | Vol: $${Math.round(token.volume?.h24 || 0).toLocaleString()}
• Txns: ${((token.txns?.h24?.buys || 0) + (token.txns?.h24?.sells || 0)).toLocaleString()}
• Change (1h): ${token.priceChange?.h1 || 0}%
• Chart: https://dexscreener.com/${token.chainId}/${token.pairAddress}
`.trim();
}

function saveAlert(alert: any) {
  try {
    let alerts: any[] = [];
    try { alerts = JSON.parse(readFileSync(alertsFilePath, "utf8")); } catch (e) {}
    alerts.push(alert);
    writeFileSync(alertsFilePath, JSON.stringify(alerts, null, 2));
  } catch (e) { log(`Error saving: ${e}`); }
}

async function monitor() {
  log("Starting Boosted Token Monitor...");

  const server = Bun.serve({
    port: 3847,
    fetch(req) {
      const url = new URL(req.url);
      if (url.pathname === "/stats") {
        return new Response(JSON.stringify({ running: true, seenCount: seenTokens.size }, null, 2));
      }
      if (url.pathname === "/alerts") {
        const content = readFileSync(alertsFilePath, "utf8");
        return new Response(content, { headers: { "Content-Type": "application/json" } });
      }
      return new Response("Meme Monitor v2 Active");
    }
  });

  setInterval(async () => {
    log("Scanning boosted tokens...");
    const boosts = await fetchBoostedTokens();
    
    // Process top 20 latest boosts
    for (const boost of boosts.slice(0, 20)) {
      if (seenTokens.has(boost.tokenAddress)) continue;
      
      const pairs = await fetchTokenData(boost.tokenAddress);
      // Find the best pair on the supported chains
      const bestPair = pairs
        .filter(p => p.chainId === "solana" || p.chainId === "base")
        .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

      if (bestPair) {
        const { pass } = checkCriteria(bestPair);
        if (pass) {
          log(`Matched: $${bestPair.baseToken.symbol} (${bestPair.chainId})`);
          saveAlert({
            timestamp: new Date().toISOString(),
            message: formatAlert(bestPair),
            token: bestPair,
            sent: false
          });
          seenTokens.set(boost.tokenAddress, Date.now());
        }
      } else {
        // Mark as seen so we don't keep fetching if no valid pair exists
        seenTokens.set(boost.tokenAddress, Date.now());
      }
    }
    
    // Cleanup seen tokens older than 24h
    for (const [addr, ts] of seenTokens) {
      if (Date.now() - ts > 24 * 60 * 60 * 1000) seenTokens.delete(addr);
    }
  }, SCAN_INTERVAL_MS);
}

monitor().catch(console.error);

---
name: mcp
description: Model Context Protocol - Connect AI agents to external tools, databases, APIs, and services. Also includes Refero MCP for AI design capabilities.
---

# Model Context Protocol (MCP)

## What is MCP?

**MCP (Model Context Protocol)** is an open standard from Anthropic that enables AI agents to connect to external systems - databases, APIs, file systems, and SaaS tools.

Key features:
- **Runtime Tool Discovery** - AI dynamically finds available tools without hardcoded integrations
- **Deterministic Execution** - Wrapped code runs reliably, not hallucinated HTTP requests
- **Bidirectional Communication** - Can push notifications, ask for user input
- **Local-First Design** - Runs over stdio, no CORS/port config needed

## Refero MCP

**Refero MCP** is a specific MCP server that gives AI agents access to real-world UI/UX design references.

### What it provides:
- **124,000+ screens** from real products
- **8,000+ user flows** (signup to cancellation)
- Covers: onboarding, paywalls, empty states, error pages, settings, permissions
- Structured metadata: descriptions, UX patterns, UI patterns, layouts

### Why it matters:
AI-generated interfaces look generic because models are trained on code/text, not real product design. Refero MCP bridges this gap by letting AI study how real products solve problems before designing.

### Installation:

1. **Get Refero Pro MCP plan** ($20/month)
   - https://refero.design/mcp#upgrade

2. **Connect your tool** (supports):
   - Claude Code
   - Cursor
   - Antigravity
   - Lovable
   - Codex
   - Other MCP-compatible tools

3. **Sign in** - First call opens browser for auth

4. **Use it**:
   ```
   "Find onboarding flows from fintech apps"
   "Show me how Linear handles empty states"
   ```

### Refero Skill (alternative):

A design methodology that installs into your agent:

```bash
npx skills add https://github.com/referodesign/refero_skill
```

This makes the agent:
1. Research references first
2. Extract specific patterns
3. Design with craft rules for typography, color, spacing, motion

### Who uses MCP:
- Anthropic (Claude computer use)
- OpenAI, Microsoft, Google
- Cursor, Windsurf
- Zapier (8,000+ apps via MCP)

## General MCP Setup

For custom MCP servers:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/server.js"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

## Security Notes

- No built-in auth at protocol level
- Handle input validation, access control, audit logging yourself
- MCP tools have full access to whatever they're connected to

## Sources

- https://refero.design/mcp
- https://x.com/bbssppllvv/status/2028481205654507989
- https://github.com/referodesign/refero_skill

---
name: openclaw-frontend
description: OpenClaw AI agent orchestration frontend/UI skills - brutalist design, agent dashboards, debug UIs
compatibility: Created for Zo Computer
metadata:
  author: georgeo.zo.computer
---

# OpenClaw Frontend Skills

OpenClaw is an open-source AI agent platform ("AI that does things" - email, calendar, home automation). Frontend development emphasizes real-time interfaces, dashboards, and agent orchestration.

## Core Frontend Stack

- **HTML/CSS/JavaScript** - Foundation
- **React** - For dynamic UIs with real-time streaming
- **Node.js** - For APIs
- **WebSockets** - Real-time streaming from AI agents
- **Docker/K8s** - Deployment

## Design Philosophy

### Brutalist UI Principles (from @BrandonGains)
- **Exposed grid borders** - visible structural elements
- **Zero border-radius** - sharp, functional corners
- **Minimal color palette** - black canvas + single accent (OpenClaw red #E04040)
- **Typography pairing**: Editorial serif (Instrument Serif) + technical mono (IBM Plex Mono)

### Core Principles
- Non-decorative, functional layouts
- Visual diffs for code/agent outputs
- Debug logs at full width (no squeezed JSON)
- User-friendly for non-programmers
- Real-time streaming interfaces

## Key Skills

| Skill | Description |
|-------|-------------|
| Real-time streaming | WebSockets for live agent updates |
| Debug log rendering | Full-width JSON display (PR #30978) |
| Adaptive thinking displays | Agent reasoning visualization |
| Responsive design | Grid layouts for all screen sizes |
| JSON handling | Agent event payloads |
| Git collaboration | PRs for UI improvements |
| Thread-based interfaces | Discord/Telegram DM integrations |
| Agent marketplace UIs | Installable module interfaces |

## References

- OpenClaw GitHub: https://github.com/openchats/ai-agents
- Design inspiration: https://x.com/BrandonGains/status/2027484776995889611
- Real-time UI demo: https://x.com/pseudotheos/status/2017718392510148798
- Debug UI PR: https://x.com/sgates2011/status/2028516612517572696
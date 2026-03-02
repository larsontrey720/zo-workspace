# MCP (Model Context Protocol)

## Overview

MCP is an open standard from Anthropic that defines how AI models connect to external systems - databases, APIs, file systems, and SaaS tools. It's a standardized "plug-and-play" interface that enables AI agents to discover, access, and interact with capabilities dynamically.

## Why MCP Matters

### The Problem
Every AI integration traditionally started the same way: custom connectors, glue code, fragile scripts.
- Connect to Slack? Build an adapter
- Query a database? Another adapter
- Access files? You get the idea

This N×M integration problem doesn't scale.

### The Solution
MCP provides one protocol instead of dozens of custom integrations. AI agents can dynamically discover what tools are available and use them without hardcoded integrations.

## Key Features

### 1. Runtime Discovery
- REST APIs require new client code when endpoints change
- MCP servers expose capabilities dynamically via `tools/list`
- The AI queries what's available and adapts - no SDK regeneration needed

### 2. Deterministic Execution
- Traditional approach: LLM generates HTTP requests → hallucinated paths, wrong parameters
- MCP approach: LLM picks which tool to call, then wrapped code executes deterministically
- You can test, validate inputs, and handle errors in actual code

### 3. Bidirectional Communication
- Servers can request LLM completions
- Can ask users for input
- Push progress notifications
- Not bolted on - it's core to the protocol

### 4. Single Input Schema
- REST scatters data across paths, headers, query params, and body
- MCP mandates one JSON input/output per tool
- Predictable structure every time

### 5. Local-First Design
- MCP runs over stdio for local tools
- No port binding, no CORS configuration
- When servers run locally, they inherit host process permissions
- Direct filesystem access, terminal commands, and system operations

## How It Works

```
MCP Server → Exposes capabilities via structured JSON schemas
     ↓
AI Agent → Automatically discovers tools
     ↓
AI Agent → Sends parameterized requests
     ↓
MCP Server → Returns responses with built-in auth, state management, type safety
```

## Who Uses MCP

- **Anthropic** - Claude's "computer use" feature
- **OpenAI** - ChatGPT integrations
- **Microsoft** - Copilot ecosystem
- **Google** - Gemini integrations
- **Cursor** - AI-powered IDE
- **Windsurf** - AI code editor
- **Zapier** - Exposed 8,000+ apps through a single MCP endpoint

## Token Efficiency Comparison

According to research, CLI tools use 4×-35× fewer tokens than MCP for comparable tasks because:
- MCP's structured schemas and full response dumps inflate context windows
- Less room for reasoning when context is bloated
- CLI leverages native LLM familiarity with command syntax

However, MCP offers:
- Standardization for regulated environments
- Better security (when properly implemented)
- Dynamic tool discovery

## Security Considerations

MCP doesn't enforce authentication at the protocol level. No standardized permission model. Tool safety depends on your server implementation:
- Input validation is on you
- Access control is on you
- Audit logging is on you

## Resources

- Official Docs: https://modelcontextprotocol.io/docs/getting-started/intro
- GitHub: https://github.com/modelcontextprotocol
- Research Paper: https://arxiv.org/abs/2503.23278

## When to Use MCP vs CLI

| Use Case | Recommended Approach |
|----------|---------------------|
| Regulated environments needing audit trails | MCP |
| Quick prototyping and scripting | CLI |
| Token efficiency critical | CLI |
| Standardized integration needed | MCP |
| Local file/terminal operations | CLI (via tools) |

## Implementation Example

```python
# Simple MCP server example (Pseudocode)
from mcp.server import Server

app = Server("my-tools")

@app.list_tools()
def list_tools():
    return [
        {
            "name": "read_file",
            "description": "Read a file from disk",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "File path"}
                },
                "required": ["path"]
            }
        }
    ]

@app.call_tool()
def read_file(path: str):
    with open(path) as f:
        return f.read()
```

## For Zo Computer

MCP could be used to:
- Create standardized tool integrations
- Build AI agents that can discover and use workspace tools dynamically
- Connect to external services via MCP servers
- Enable more powerful automation workflows

The skill system in Zo is similar in concept - providing a standardized way to expose capabilities to AI agents.
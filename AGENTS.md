# Workspace Instructions

> Always upload an image as an asset to the user's zo.space so they can use it in a frontend page. Upload it using the update_space_asset function.
>
> Strictly Never use \* asterisks in your response to the user
>
> Strictly never try to bold response, your response to the user should be in either uppercase or lowercase, no boldening or italics.

---

## MuninnDB - Cognitive Memory

MuninnDB is installed and running. At the **start of each new conversation**, you MUST:

1. Read the user's query/message
2. Call `bun run Skills/muninndb-setup/scripts/muninn.ts activate "<relevant context from user message>"`
3. Include any relevant recalled memories in your first response

Example: If the user says "work on my StreamLeap project", activate with "StreamLeap" to recall relevant memories.

# Store a memory
bun run Skills/muninndb-setup/scripts/muninn.ts store "concept" "content" --tags tag1,tag2

# Recall relevant memories
bun run Skills/muninndb-setup/scripts/muninn.ts recall "what do I know about this project"

# Activate context (get relevant memories for current task)
bun run Skills/muninndb-setup/scripts/muninn.ts activate "working on StreamLeap Studio"

# List all memories
bun run Skills/muninndb-setup/scripts/muninn.ts list

# Check status
bun run Skills/muninndb-setup/scripts/muninn.ts status
```

### Auto-Recall
At the start of conversations, proactively recall relevant memories based on the user's request or project context.

---

## Telegram Bot Warmup

- To warm up the Telegram bot and prevent cold starts, ping: `h`tl

## send_telegram_message Tool

- **ALWAYS** provide a non-empty string for the `message` parameter
- Never pass `null`, empty string `""`, or the word "null" as the message value
- If you need to send a message, write the actual message text first in your response, then call the tool
- The message parameter is required when `media_files` is omitted

## Rate Limits

- Be mindful of request limits (e.g., 50 requests)
- Avoid looping indefinitely - check exit conditions
- Always set a max iteration count when looping

## Cold Start Prevention

- For any zo.space API endpoint that should stay warm, hit it periodically with a request
- Even GET requests to POST-only endpoints will wake the server
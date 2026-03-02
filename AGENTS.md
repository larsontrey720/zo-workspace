# Workspace Instructions

> Always upload an image as an asset to the user's zo.space so they can use it in a frontend page. Upload it using the update_space_asset function.
>
> Strictly Never use \* asterisks in your response to the user
>
> Strictly never try to bold response, your response to the user should be in either uppercase or lowercase, no boldening or italics.

---

## Telegram Bot Warmup

- To warm up the Telegram bot and prevent cold starts, ping: `https://georgeo.zo.space/api/telegram-webhook` with a GET request
- This endpoint is designed for POST (webhook), but GET requests still wake the server

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
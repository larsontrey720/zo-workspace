# Catchmail Skill

A simple skill for temporary email using Catchmail's free API.

## Usage

Run these commands from the scripts folder:

### Create a new email address
```
catchmail create [optional-name]
```
Generates an address. Note: Catchmail doesn't have a create endpoint - you just pick any @catchmail.io address and use it!

### Check for messages
```
catchmail check <email>
```
Checks inbox for the given email address.

### Get specific message
```
catchmail message <email> <message-id>
```
Gets the full content of a specific message.

## How It Works

1. Pick any username@catchmail.io
2. Use that email for signups
3. Check for messages using the API

## Examples

```bash
# Create/get an address
catchmail create streamleap
# Output: streamleap@catchmail.io (just use it!)

# Check inbox
catchmail check streamleap@catchmail.io
# Output: {"address":"streamleap@catchmail.io","messages":[...],"count":1}

# Get message content
catchmail message streamleap@catchmail.io 20260225T043629-1166
# Output: Full message with body, headers, etc.
```

## API Endpoints Used

- List messages: `GET https://api.catchmail.io/api/v1/mailbox?address={email}`
- Get message: `GET https://api.catchmail.io/api/v1/message/{messageId}?mailbox={email}`

## Notes

- Free, no authentication required
- Just pick any available @catchmail.io address
- Rate limit: 1 request per second per IP
- No session management needed - just use the email address directly
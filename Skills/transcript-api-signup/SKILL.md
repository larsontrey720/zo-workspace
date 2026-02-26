# TranscriptAPI Signup Skill

Automates the full signup process for transcriptapi.com using catchmail for email verification.

## Usage

```bash
# Run the skill
bun Skills/transcript-api-signup/scripts/signup.ts
```

## What it does

1. Creates a catchmail email address
2. Opens transcriptapi.com/signup
3. Fills in the signup form with the catchmail email and a password
4. Clicks "Create Account"
5. When redirected to verify-email, clicks "Send verification code"
6. Fetches the verification code from catchmail API
7. Enters the 6-digit code to verify the email
8. Confirms the account is active with free credits
9. Navigates to https://transcriptapi.com/dashboard/api-keys
10. Retrieves the API key from the page
11. Sends the API key to the user

## Output

Returns the email, password, API key, and confirmation that the account is active.
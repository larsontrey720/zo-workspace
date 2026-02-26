#!/bin/bash
# TranscriptAPI Signup Automation
# Usage: bash Skills/transcript-api-signup/scripts/signup.sh

SITE_URL="https://transcriptapi.com"
CATCHMAIL_API="https://api.catchmail.io/api/v1"
PASSWORD="TestPass123!"

echo "=== TranscriptAPI Signup ==="
echo ""

# Step 1: Generate random username and create catchmail email
USERNAME="transcript$(date +%s)"
EMAIL="${USERNAME}@catchmail.io"

echo "1. Creating catchmail email..."
echo "   Email: $EMAIL"

# Step 2: Open signup page and fill form
echo ""
echo "2. Opening signup page..."
# The browser automation would be done via the open_webpage/view_webpage tools
# This script shows the steps for documentation

echo ""
echo "3. Manual steps to complete in browser:"
echo "   - Go to: ${SITE_URL}/signup"
echo "   - Enter email: $EMAIL"
echo "   - Enter password: $PASSWORD"
echo "   - Check terms checkbox"
echo "   - Click 'Create Account'"
echo ""
echo "4. After signup, you'll be redirected to /verify-email"
echo "   - Click 'Send verification code'"
echo ""
echo "5. Get verification code from catchmail:"
echo "   curl \"${CATCHMAIL_API}/mailbox?address=${EMAIL}\""
echo ""
echo "6. Enter the 6-digit code in the browser to verify"
echo ""
echo "=== Account Details ==="
echo "Email: $EMAIL"
echo "Password: $PASSWORD"

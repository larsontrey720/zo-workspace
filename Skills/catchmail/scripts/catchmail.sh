#!/bin/bash

# Catchmail CLI - Temporary email using Catchmail's free API
# No auth required - just pick any @catchmail.io address!

API_BASE="https://api.catchmail.io/api/v1"

case "$1" in
  create)
    NAME="${2:-$(date +%s)}"
    # Catchmail doesn't have a create endpoint - just use any address
    echo "{\"address\":\"$NAME@catchmail.io\"}"
    ;;
  check)
    if [ -z "$2" ]; then
      echo "Usage: catchmail check <email>"
      exit 1
    fi
    EMAIL="$2"
    curl -s "$API_BASE/mailbox?address=$EMAIL"
    ;;
  message)
    if [ -z "$2" ] || [ -z "$3" ]; then
      echo "Usage: catchmail message <email> <message-id>"
      exit 1
    fi
    EMAIL="$2"
    MSG_ID="$3"
    curl -s "$API_BASE/message/$MSG_ID?mailbox=$EMAIL"
    ;;
  *)
    echo "Catchmail CLI - Temporary email made simple"
    echo ""
    echo "Usage:"
    echo "  catchmail create [name]     Get email address (any @catchmail.io works)"
    echo "  catchmail check <email>     Check inbox for messages"
    echo "  catchmail message <email> <id>  Get specific message"
    echo ""
    echo "Examples:"
    echo "  catchmail create mytest     -> {\"address\":\"mytest@catchmail.io\"}"
    echo "  catchmail check mytest@catchmail.io"
    echo "  catchmail message mytest@catchmail.io 20260225T043629-1166"
    ;;
esac

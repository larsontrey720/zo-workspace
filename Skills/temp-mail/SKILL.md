# Temp Mail Skill

A skill for handling temporary email addresses with persistent session via browser.

## Usage

Run the following commands:

### Create new email
```
temp-mail create
```

### Check for emails  
```
temp-mail check
```

### Get current email address
```
temp-mail address
```

### Reset session (new email)
```
temp-mail reset
```

## Notes

- Uses browser automation for reliable session persistence
- Current service: emailondeck.com (10minutemail)
- Browser session persists across calls - no token issues
- Emails are checked via the live browser page
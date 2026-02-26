---
name: nopecha
description: "Use NopeCHA's direct API to solve CAPTCHAs. Supports reCAPTCHA, hCaptcha, Turnstile, FunCAPTCHA, and more via HTTP API calls."
metadata:
  author: ola.zo.computer
---
# NopeCHA - Direct API Usage

Use NopeCHA's API to solve CAPTCHAs directly via HTTP calls. This is the preferred method for Zo to solve CAPTCHAs programmatically.

## Setup

1. Get an API key from [https://nopecha.com](https://nopecha.com)
2. Save it to Zo secrets at [Settings > Advanced](/?t=settings&s=advanced) as `NOPECHA_API_KEY`

## Usage

When encountering a CAPTCHA, use the appropriate API endpoint:

### Check API Key Status

```bash
curl "https://api.nopecha.com/v1/status?key=$NOPECHA_API_KEY"
```

### reCAPTCHA v2

**Submit:**
```bash
curl -X POST "https://api.nopecha.com/v1/recognition/recaptcha" \
  -H "Authorization: Basic $NOPECHA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sitekey": "SITEKEY", "url": "PAGE_URL"}'
```

**Retrieve (poll for result):**
```bash
curl "https://api.nopecha.com/v1/recognition/recaptcha?id=JOB_ID&key=$NOPECHA_API_KEY"
```

### reCAPTCHA v3

**Submit:**
```bash
curl -X POST "https://api.nopecha.com/v1/recognition/recaptcha3" \
  -H "Authorization: Basic $NOPECHA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sitekey": "SITEKEY", "url": "PAGE_URL", "action": "verify"}'
```

### hCaptcha

**Submit:**
```bash
curl -X POST "https://api.nopecha.com/v1/recognition/hcaptcha" \
  -H "Authorization: Basic $NOPECHA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sitekey": "SITEKEY", "url": "PAGE_URL"}'
```

### Turnstile (Cloudflare)

**Submit:**
```bash
curl -X POST "https://api.nopecha.com/v1/recognition/turnstile" \
  -H "Authorization: Basic $NOPECHA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sitekey": "SITEKEY", "url": "PAGE_URL"}'
```

### FunCAPTCHA

**Submit:**
```bash
curl -X POST "https://api.nopecha.com/v1/recognition/funcaptcha" \
  -H "Authorization: Basic $NOPECHA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sitekey": "SITEKEY", "url": "PAGE_URL", "task": "INSTRUCTION"}'
```

## Workflow

1. Navigate to the page with CAPTCHA using Zo browser
2. Extract the `sitekey` from the page (usually in a `data-sitekey` attribute or hidden input)
3. Submit to NopeCHA API
4. Poll for result until ready
5. Submit the token to the form

## Finding Sitekeys

- **reCAPTCHA**: Look for `data-sitekey` attribute on the iframe or `textarea[name="g-recaptcha-response"]`
- **hCaptcha**: Look for `data-sitekey` attribute
- **Turnstile**: Look for `data-sitekey` attribute on the div
- **FunCAPTCHA**: Look for `data-sitekey` attribute

## Credit Usage

| CAPTCHA Type | Credits |
|--------------|---------|
| Turnstile | 1 |
| hCaptcha | 10 |
| reCAPTCHA v2 | 20 |
| reCAPTCHA v3 | 20 |

## Supported Types

- reCAPTCHA v2/v3
- hCaptcha
- Cloudflare Turnstile
- FunCAPTCHA
- AWS WAF CAPTCHA
- GeeTest
- Lemin
- Text CAPTCHA

## Resources

- [API Reference](https://nopecha.com/api-reference)
- [CAPTCHA Demo](https://nopecha.com/captcha)
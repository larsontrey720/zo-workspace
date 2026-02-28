# CoquiTTS Skill

Free open-source text-to-speech using CoquiTTS. No API costs - just compute.

## Installation

Requires Python and CoquiTTS:
```bash
pip install TTS
```

## Usage

```bash
# Generate speech
bun Skills/coqui-tts/scripts/tts.ts speak "Hello world" --output /tmp/hello.mp3

# List available models
bun Skills/coqui-tts/scripts/tts.ts models
```

## What It Does

- Converts text to speech using open-source models
- Supports multiple languages
- Free to use - no API key needed
- Local execution (run locally or on server)

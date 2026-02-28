#!/usr/bin/env python3
"""CoquiTTS - Free open-source text-to-speech"""

import argparse
import os
import sys

def install_and_run():
    """Install CoquiTTS and run"""
    os.system("pip install TTS -q")
    from TTS.api import TTS
    
    return TTS

def speak(text, output_path="output.wav", model_name=None):
    """Generate speech from text"""
    try:
        from TTS.api import TTS
    except ImportError:
        TTS = install_and_run()
    
    # Use default model if not specified
    if not model_name:
        model_name = "tts_models/en/ljspeech/tacotron2-DDC"
    
    tts = TTS(model_name=model_name, gpu=False)
    tts.tts_to_file(text=text, file_path=output_path)
    print(f"Generated: {output_path}")
    return output_path

def list_models():
    """List available models"""
    print("Run: tts.list_models() in Python to see all models")
    print("Or browse: https://coqui.ghost.io/?post_type=model")

def main():
    parser = argparse.ArgumentParser(description="CoquiTTS - Free Open Source TTS")
    parser.add_argument("command", choices=["speak", "models"], help="Command to run")
    parser.add_argument("text", nargs="?", help="Text to speak (for speak command)")
    parser.add_argument("--output", "-o", default="output.wav", help="Output file path")
    parser.add_argument("--model", "-m", help="Model name")
    
    args = parser.parse_args()
    
    if args.command == "speak":
        if not args.text:
            print("Error: Text required for speak command")
            sys.exit(1)
        speak(args.text, args.output, args.model)
    elif args.command == "models":
        list_models()

if __name__ == "__main__":
    main()

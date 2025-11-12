#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--- Running custom build script ---"

# 1. Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 2. Install system dependencies like ffmpeg
echo "--- Installing ffmpeg ---"
apt-get update && apt-get install -y ffmpeg
echo "--- ffmpeg installation complete ---"
#!/usr/bin/env bash
# start-backend.sh — Run the SWASTIK FastAPI backend
# Usage: bash start-backend.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

cd "$BACKEND_DIR"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo "🐍 Creating Python virtual environment..."
  python3 -m venv venv
fi

echo "📦 Installing/updating Python dependencies..."
./venv/bin/pip install -q -r requirements.txt

# Create uploads and models directories
mkdir -p uploads models

echo "🚀 Starting FastAPI backend on http://localhost:8000"
./venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000

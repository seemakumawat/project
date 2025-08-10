#!/usr/bin/env bash
set -euo pipefail

# Create Python venv if not exists
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate

# Install deps if needed
pip install -r requirements.txt

# Build frontend (if using Vite React, ensure node modules)
if [ -f package.json ]; then
  if [ ! -d node_modules ]; then
    npm ci --no-audit --no-fund --prefer-offline
  fi
  npm run build
fi

# Run Flask API
export FLASK_APP=app.py
export FLASK_ENV=development
python app.py
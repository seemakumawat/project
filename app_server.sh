#!/usr/bin/env bash
set -euo pipefail
source .venv/bin/activate
export FLASK_APP=app.py
export FLASK_ENV=development
python app.py
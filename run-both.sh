#!/bin/bash
# Start backend in background, then frontend. Open http://localhost:5173 for the UI.
cd "$(dirname "$0")"
if [ ! -d .venv ]; then
  echo "Creating virtualenv..."
  python3 -m venv .venv
  .venv/bin/pip install -q -r backend/requirements-minimal.txt
fi
if [ ! -d frontend/node_modules ]; then
  echo "Installing frontend dependencies..."
  (cd frontend && npm install)
fi
echo "Starting backend at http://localhost:8000 ..."
.venv/bin/python backend/main.py &
BACKEND_PID=$!
trap "kill $BACKEND_PID 2>/dev/null" EXIT
sleep 2
echo "Starting frontend at http://localhost:5173 ..."
cd frontend && exec npm run dev

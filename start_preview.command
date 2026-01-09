#!/bin/bash
cd "$(dirname "$0")"

# Kill any existing process on port 8000
echo "Cleaning up old servers..."
lsof -ti :8000 | xargs kill -9 2>/dev/null

echo "Starting local proxy server for Senior Mate's Backstage..."
echo "Please keep this window open."

# Start our custom server with logging
python3 server.py > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Open in browser
open http://localhost:8000

# Cleanup on exit
trap "kill $SERVER_PID" EXIT
wait
